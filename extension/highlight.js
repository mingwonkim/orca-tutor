(()=>{
 if(window.__orcaTutorV2)return;window.__orcaTutorV2=true;
 if(location.origin!=='https://github.com')return;
 let target=null,targetKey='',tip=null,style=null,controller=null,run=0,result='';
 const ko=(document.documentElement.lang||navigator.language||'').toLowerCase().startsWith('ko');
 const T=(k,e)=>ko?k:e;
 // GitHub 아이콘 버튼(복사 등)은 이름이 aria-labelledby 툴팁에만 있다
 const labelledBy=e=>(e?.getAttribute('aria-labelledby')||'').split(/\s+/).map(id=>id&&document.getElementById(id)?.textContent||'').join(' ').trim();
 const norm=e=>(e?.getAttribute('aria-label')||labelledBy(e)||e?.getAttribute('data-testid')||e?.textContent||'').replace(/\s+/g,' ').trim();
 const visible=e=>{if(!e)return false;const r=e.getBoundingClientRect();return r.width>0&&r.height>0};
 const repoUrl=()=>(location.origin+location.pathname.replace(/\/$/,'')+'.git').toLowerCase();
 // 복사 직후 GitHub 가 버튼 이름을 "Copied!" 로 바꾼다 — 그것도 같은 버튼으로 본다
 const COPY=/copy (url|https|clone|to clipboard)|copy url|copied|클립보드에 복사|복사/i;

 function cleanup(){run++;controller?.abort();target?.classList.remove('orca-v2-target');tip?.remove();style?.remove();target=tip=style=controller=null;targetKey=result=''}
 function position(){if(!target||!tip)return;const r=target.getBoundingClientRect();const h=tip.offsetHeight||90;tip.style.left=Math.max(8,Math.min(innerWidth-310,r.left))+'px';tip.style.top=(r.bottom+h+12<innerHeight?r.bottom+12:Math.max(8,r.top-h-12))+'px'}
 // key 가 바뀔 때만 문구를 바꾼다 — 복사 결과 문구가 다음 tick 에 덮이지 않게
 // React 가 같은 요소의 className 을 다시 써서 강조 class 를 지우므로 매번 다시 붙인다
 function highlight(el,key,message){if(el!==target){target?.classList.remove('orca-v2-target');target=el}el.classList.add('orca-v2-target');if(key!==targetKey){targetKey=key;tip.textContent=message}position()}

 function findCode(){return [...document.querySelectorAll('button,summary,[role="button"]')].find(e=>visible(e)&&/^Code(?:\s|$)/i.test(norm(e))&&(e.hasAttribute('aria-haspopup')||e.tagName==='SUMMARY'))||[...document.querySelectorAll('button,summary')].find(e=>visible(e)&&/^Code(?:\s|$)/i.test(norm(e)))}
 // 열린 Code 메뉴 안에서 "이 저장소 HTTPS 주소" 입력칸에 붙은 복사 버튼만 찾는다 (SSH·CLI·다른 대화상자 제외)
 function findHttpsCopy(){
  const want=repoUrl();
  const input=[...document.querySelectorAll('input')].find(i=>visible(i)&&i.value.trim().toLowerCase()===want);
  for(let p=input?.parentElement,i=0;p&&i<5;p=p.parentElement,i++){const b=[...p.querySelectorAll('button,[role="button"]')].find(x=>visible(x)&&COPY.test(norm(x)));if(b)return b}
  return null;
 }
 function menuRoot(){const code=findCode();if(code?.getAttribute('aria-expanded')!=='true')return null;return [...document.querySelectorAll('[class*="AnchoredOverlay"],[role="dialog"],[role="menu"],.Popover')].find(visible)||document}
 function findTab(root,re){return [...root.querySelectorAll('button,[role="tab"]')].find(e=>visible(e)&&re.test(norm(e)))}

 function tick(){
  if(!tip)return;
  const copy=findHttpsCopy();
  if(copy){highlight(copy,'copy',result||T('② 노란색 HTTPS 복사 버튼을 클릭하세요.','② Click the highlighted HTTPS copy button.'));return}
  const root=menuRoot(),code=findCode();
  if(root){
   const https=findTab(root,/^(Clone with )?HTTPS$/i);
   if(https)return highlight(https,'https',T('② HTTPS 탭을 선택하세요. (SSH·GitHub CLI 주소는 처음 쓰기 어렵습니다)','② Select the HTTPS tab.'));
   const local=findTab(root,/^Local$/i);
   if(local)return highlight(local,'local',T('② Local 탭을 선택하세요.','② Select the Local tab.'));
  }
  if(code)highlight(code,'code',T('① 노란색 Code 버튼을 클릭하세요.','① Click the highlighted Code button.'));
 }

 async function copyDone(){
  const my=run,url=repoUrl();
  await new Promise(resolve=>setTimeout(resolve,250));if(my!==run)return; // 중지·재시작된 안내는 아무것도 보내지 않는다
  let clip='denied';
  try{clip=(await navigator.clipboard.readText()).trim().toLowerCase().replace(/\.git$/,'')===url.replace(/\.git$/,'')?'ok':'mismatch'}catch{}
  if(my!==run)return;
  let sent={ok:false,reason:'no-extension'};
  try{sent=await chrome.runtime.sendMessage({type:'bridge-event',url,verified:clip==='ok'})}catch{}
  if(my!==run||!tip)return;
  tip.textContent=result=({ok:'✓ 클립보드에 저장소 주소가 복사된 것을 확인했습니다.',mismatch:'클립보드 내용이 이 저장소의 HTTPS 주소와 다릅니다. HTTPS 탭에서 다시 복사하세요.',denied:'복사 버튼 클릭은 감지했지만 브라우저가 클립보드 읽기를 막아 복사 성공은 확인하지 못했습니다.'})[clip]
   +(sent?.ok?' 튜터에 전달했습니다. 튜터가 "Clone 주소 복사" 단계일 때만 넘어갑니다 — 다른 단계라면 그 단계로 옮긴 뒤 다시 복사하세요.'
    :sent?.reason==='no-pair'?' 확장 팝업에 연결 코드를 저장한 뒤 복사 버튼을 다시 누르세요.'
    :' 튜터에 연결하지 못했습니다. 앱을 켜고 팝업의 연결 코드를 확인한 뒤 다시 복사하세요.');
  position();
 }

 function start(){cleanup();if(!/^\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+\/?$/.test(location.pathname))return {message:'GitHub 저장소 메인 페이지에서 실행하세요.'};
  if(!findCode())return {message:'현재 GitHub UI에서 Code 버튼을 찾지 못했습니다. 페이지를 새로고침하거나 확장 기능을 다시 실행하세요.'};
  style=document.createElement('style');style.textContent='.orca-v2-target{outline:5px solid #f9e547!important;outline-offset:4px!important;box-shadow:0 0 0 10px #f9e54740!important}#orca-v2-tip{position:fixed;z-index:2147483647;max-width:295px;background:#282257;color:white;border:2px solid #f9e547;border-radius:12px;padding:12px;font:14px/1.5 system-ui;pointer-events:none;box-shadow:0 8px 22px #0005}';document.head.append(style);
  tip=document.createElement('div');tip.id='orca-v2-tip';tip.setAttribute('role','status');document.body.append(tip);controller=new AbortController();const {signal}=controller;
  // 메뉴를 닫거나 탭을 바꾸면 DOM 이 교체되므로 리스너를 버튼에 붙이지 않고 document 에서 위임 처리. 여러 번 눌러도 매번 전송.
  document.addEventListener('click',e=>{if(targetKey==='copy'&&target&&target.contains(e.target))copyDone()},{capture:true,signal});
  // ponytail: 300ms 폴링 — 메뉴 열림/탭 전환을 놓치지 않는 가장 단순한 방법. 무거워지면 MutationObserver 로
  const timer=setInterval(tick,300);signal.addEventListener('abort',()=>clearInterval(timer),{once:true});
  addEventListener('scroll',position,{capture:true,passive:true,signal});addEventListener('resize',position,{signal});document.addEventListener('turbo:load',cleanup,{signal});addEventListener('popstate',cleanup,{signal});
  tick();target?.scrollIntoView({block:'center',behavior:'smooth'});
  return {message:'Code → HTTPS 복사 순차 안내를 시작했습니다.'}
 }
 chrome.runtime.onMessage.addListener((req,_sender,respond)=>{respond(req.action==='stop'?(cleanup(),{message:'강조 표시 제거됨'}):start());return false});
})();
