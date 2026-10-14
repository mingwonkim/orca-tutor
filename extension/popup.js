const msg=document.getElementById('message');
chrome.storage.local.get(['pair'],({pair})=>{document.getElementById('pair').value=pair||''});
document.getElementById('save').onclick=()=>{const pair=document.getElementById('pair').value.trim();if(!/^\d{2,5}:[a-f0-9]{36}$/.test(pair)){msg.textContent='연결 코드 형식이 올바르지 않습니다.';return}chrome.storage.local.set({pair},()=>msg.textContent='연결 코드 저장됨')};
async function send(action){const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(!tab?.url?.startsWith('https://github.com/')){msg.textContent='GitHub 저장소에서 실행하세요.';return}try{await chrome.scripting.executeScript({target:{tabId:tab.id},files:['highlight.js']});const response=await chrome.tabs.sendMessage(tab.id,{action});msg.textContent=response?.message||'완료'}catch(e){msg.textContent='실행 실패: '+e.message}}
document.getElementById('start').onclick=()=>send('start');document.getElementById('stop').onclick=()=>send('stop');
