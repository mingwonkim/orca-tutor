// 콘텐츠 스크립트의 fetch 는 github.com 출처로 나가서 Chrome 로컬 네트워크 접근 검사에 막히고,
// 브리지도 chrome-extension:// 출처만 받는다. 그래서 브리지 호출은 확장 출처인 여기서 한다.
chrome.runtime.onMessage.addListener((msg,sender,respond)=>{
 if(sender.id!==chrome.runtime.id||msg?.type!=='bridge-event')return false;
 chrome.storage.local.get(['pair'],async ({pair})=>{
  const match=/^(\d{2,5}):([a-f0-9]{36})$/.exec(pair||'');
  if(!match){respond({ok:false,reason:'no-pair'});return}
  try{
   const r=await fetch('http://127.0.0.1:'+match[1]+'/event',{method:'POST',headers:{'Content-Type':'application/json','X-Orca-Token':match[2]},body:JSON.stringify({event:'github-copy-clicked',url:msg.url,verified:msg.verified===true})});
   respond({ok:r.ok,reason:r.ok?'sent':'http-'+r.status});
  }catch{respond({ok:false,reason:'app-not-running'})}
 });
 return true;
});
