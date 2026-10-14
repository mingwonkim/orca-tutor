(()=>{
 if(window.__orcaTutorV2)return;window.__orcaTutorV2=true;
 if(location.origin!=='https://github.com')return;
 let target=null,tip=null,style=null,controller=null,observer=null,phase=0;
 const ko=(document.documentElement.lang||navigator.language||'').toLowerCase().startsWith('ko');
 const norm=e=>(e?.getAttribute('aria-label')||e?.getAttribute('data-testid')||e?.textContent||'').replace(/\s+/g,' ').trim();
 const visible=e=>{if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
 function cleanup(){controller?.abort();observer?.disconnect();target?.classList.remove('orca-v2-target');tip?.remove();style?.remove();target=tip=style=controller=observer=null;phase=0}
 function position(){if(!target||!tip)return;const r=target.getBoundingClientRect();const h=tip.offsetHeight||90;tip.style.left=Math.max(8,Math.min(innerWidth-310,r.left))+'px';tip.style.top=(r.bottom+h+12<innerHeight?r.bottom+12:Math.max(8,r.top-h-12))+'px'}
 function findCode(){return [...document.querySelectorAll('button,summary,[role="button"]')].find(e=>visible(e)&&/^Code(?:\s|$)/i.test(norm(e))&&(e.hasAttribute('aria-haspopup')||e.tagName==='SUMMARY'))||[...document.querySelectorAll('button,summary')].find(e=>visible(e)&&/^Code(?:\s|$)/i.test(norm(e)))}
 function findCopy(){
  const nodes=[...document.querySelectorAll('button,[role="button"]')].filter(visible);
  return nodes.find(e=>/copy (url|https|clone|to clipboard)|copy url|클립보드에 복사|복사/i.test(norm(e))&&!!e.closest('[role="dialog"], [role="menu"], [data-testid*="clone"], .Popover, .dropdown-menu'))||nodes.find(e=>/copy (url|https|clone)|copy url|클립보드에 복사/i.test(norm(e)));
 }
 function highlight(el,message){if(target)target.classList.remove('orca-v2-target');target=el;target.classList.add('orca-v2-target');tip.textContent=message;position()}
 async function copyDone(){
  const url=location.origin+location.pathname.replace(/\/$/,'')+'.git';
  let verified=false;await new Promise(resolve=>setTimeout(resolve,250));try{const clip=await navigator.clipboard.readText();verified=clip.trim().replace(/\.git$/,'')===url.replace(/\.git$/,'')}catch{}
  chrome.storage.local.get(['pair'],async ({pair})=>{
   if(!pair)return;
   const match=/^(\d{2,5}):([a-f0-9]{36})$/.exec(pair);if(!match)return;
   try{await fetch('http://127.0.0.1:'+match[1]+'/event',{method:'POST',headers:{'Content-Type':'application/json','X-Orca-Token':match[2]},body:JSON.stringify({event:'github-copy-clicked',url,verified})})}catch{}
  });
  if(!tip)return; // 대기 중 cleanup(페이지 이동·중지)되면 tip 이 null
  tip.textContent=verified?'✓ 클립보드에 저장소 주소가 복사된 것을 확인했습니다.':'복사 버튼 클릭 감지 · 브라우저가 클립보드 읽기를 허용하지 않아 복사 성공은 확인되지 않았습니다.';
 }
 function advance(){if(phase!==0)return;phase=1;tip.textContent='② 열린 메뉴에서 HTTPS 주소 옆 복사 버튼을 누르세요.';let attempts=0;const timer=setInterval(()=>{if(!tip||phase!==1){clearInterval(timer);return}const copy=findCopy();if(copy){clearInterval(timer);highlight(copy,ko?'② 노란색 HTTPS 복사 버튼을 클릭하세요.':'② Click the highlighted HTTPS copy button.');copy.addEventListener('click',()=>{phase=2;copyDone()},{once:true,signal:controller.signal})}else if(++attempts>24){clearInterval(timer);tip.textContent='복사 버튼을 찾지 못했습니다. Code → Local → HTTPS를 선택하고 복사 아이콘을 눌러주세요.'}},250);controller.signal.addEventListener('abort',()=>clearInterval(timer),{once:true})}
 function start(){cleanup();if(!/^\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+\/?$/.test(location.pathname))return {message:'GitHub 저장소 메인 페이지에서 실행하세요.'};
  const code=findCode();if(!code)return {message:'현재 GitHub UI에서 Code 버튼을 찾지 못했습니다. 페이지를 새로고침하거나 확장 기능을 다시 실행하세요.'};
  style=document.createElement('style');style.textContent='.orca-v2-target{outline:5px solid #f9e547!important;outline-offset:4px!important;box-shadow:0 0 0 10px #f9e54740!important}#orca-v2-tip{position:fixed;z-index:2147483647;max-width:295px;background:#282257;color:white;border:2px solid #f9e547;border-radius:12px;padding:12px;font:14px/1.5 system-ui;pointer-events:none;box-shadow:0 8px 22px #0005}';document.head.append(style);
  tip=document.createElement('div');tip.id='orca-v2-tip';tip.setAttribute('role','status');document.body.append(tip);controller=new AbortController();const {signal}=controller;
  highlight(code,ko?'① 노란색 Code 버튼을 클릭하세요.':'① Click the highlighted Code button.');code.addEventListener('click',advance,{once:true,signal});addEventListener('scroll',position,{capture:true,passive:true,signal});addEventListener('resize',position,{signal});document.addEventListener('turbo:load',cleanup,{signal});addEventListener('popstate',cleanup,{signal});observer=new MutationObserver(()=>{if(target&&!target.isConnected){if(phase===0)cleanup();else position()}});observer.observe(document.body,{subtree:true,childList:true});code.scrollIntoView({block:'center',behavior:'smooth'});position();return {message:'Code → HTTPS 복사 순차 안내를 시작했습니다.'}
 }
 chrome.runtime.onMessage.addListener((req,_sender,respond)=>{respond(req.action==='stop'?(cleanup(),{message:'강조 표시 제거됨'}):start());return false});
})();
