const $=id=>document.getElementById(id);
const platform=window.orcaAPI?.platform||'win32';
const CONTEXT=[['why','왜 하는가'],['practice','현업에서는'],['result','성공하면'],['caution','주의할 점']];

function storageGet(k){try{return localStorage.getItem(k)}catch{return null}}
function storageSet(k,v){try{localStorage.setItem(k,v)}catch{}}

let {current,positions,done}=normalizeState(LESSONS,{lesson:storageGet('lesson'),positions:storageGet('positions'),done:storageGet('done')});

function save(){storageSet('lesson',current);storageSet('positions',JSON.stringify(positions));storageSet('done',JSON.stringify(done))}
function lessonOf(id){return LESSONS.find(x=>x.id===id)||LESSONS[0]}
function status(text){$('status').textContent=text}

function renderOptions(){
  $('lesson').replaceChildren(...LESSONS.map(l=>{const o=document.createElement('option');o.value=l.id;o.textContent=(done.includes(l.id)?'✓ ':'')+l.title;return o}));
}

function render(){
  const lesson=lessonOf(current);const i=positions[lesson.id];const s=lesson.steps[i];const n=lesson.steps.length;
  $('lesson').value=lesson.id;$('tag').textContent=lesson.tag;$('count').textContent=`${i+1} / ${n}`;
  const pct=done.includes(lesson.id)?100:Math.round(100*i/n);
  $('bar').style.width=`${pct}%`;$('progress').setAttribute('aria-valuenow',String(pct));
  $('step').textContent=`STEP ${i+1}`;$('title').textContent=s.title;$('body').textContent=s.body;

  const key=platform==='darwin'?s.mac:s.win;
  $('key').hidden=!key;$('key').replaceChildren();
  if(key){
    const k=document.createElement('div');k.textContent=key;$('key').append(k);
    if(s.keyVerified===false){const b=document.createElement('div');b.className='unverified';b.textContent='문서 기준 · 설치 버전에서 미검증';$('key').append(b)}
  }
  $('menu').hidden=!s.menu;$('menu').textContent=s.menu?'대안: '+s.menu:'';

  $('command').hidden=!s.command;$('command').replaceChildren();
  if(s.command){
    const code=document.createElement('code');code.textContent=s.command;
    const btn=document.createElement('button');btn.textContent='명령어 복사';btn.className='secondary';btn.style.marginTop='10px';
    btn.onclick=()=>navigator.clipboard.writeText(s.command).then(()=>status('명령어를 복사했습니다.'),()=>status('복사하지 못했습니다. 직접 선택해 복사하세요.'));
    $('command').append(code,document.createElement('br'),btn);
  }
  $('link').replaceChildren();
  if(s.url){
    const btn=document.createElement('button');btn.textContent='GitHub 열기 ↗';btn.className='secondary';
    btn.onclick=()=>window.orcaAPI.openUrl(s.url).catch(()=>status('링크를 열지 못했습니다.'));
    $('link').append(btn);
  }

  const box=$('context');box.replaceChildren();
  for(const [k,label] of CONTEXT){
    if(!s[k])continue;
    const d=document.createElement('details');if(k==='why')d.open=true;
    const sm=document.createElement('summary');sm.textContent=label;
    const p=document.createElement('p');p.textContent=s[k];
    d.append(sm,p);box.append(d);
  }

  $('verify').textContent=s.verify;
  $('verifyRepoPanel').hidden=!(current==='clone'&&i===2);$('prev').disabled=i===0;
  $('next').textContent=i===n-1?'과정 완료 ✓':'완료했어요 →';status('');
}

function next(){
  const l=lessonOf(current);const i=positions[l.id];
  if(i===l.steps.length-1){
    if(!done.includes(l.id))done.push(l.id);save();renderOptions();render();
    status('🎉 이 과정을 완료했습니다. 다른 과정을 선택해 보세요.');return;
  }
  positions[l.id]=i+1;save();render();
}
function prev(){positions[current]=Math.max(0,positions[current]-1);save();render()}

renderOptions();
$('lesson').onchange=e=>{current=lessonOf(e.target.value).id;save();render()};
$('prev').onclick=prev;$('next').onclick=next;
$('reset').onclick=()=>{positions[current]=0;done=done.filter(id=>id!==current);save();renderOptions();render()};
$('top').onchange=e=>window.orcaAPI.setTop(e.target.checked).catch(()=>{});
document.addEventListener('keydown',e=>{
  if(e.target.closest('select,input,textarea'))return;
  if(e.altKey&&e.key==='ArrowRight'){e.preventDefault();next()}
  if(e.altKey&&e.key==='ArrowLeft'){e.preventDefault();prev()}
});
render();

// 브라우저 확장과 로컬 루프백 브리지 연결. 사용자가 진행 중인 정확한 단계만 자동 승인.
let pairInfo=null;
window.orcaAPI.bridgeInfo().then(info=>{pairInfo=info;$('paircode').textContent=info.port+':'+info.token}).catch(()=>{$('paircode').textContent='연동 불가'});
$('copyPair').onclick=()=>{if(!pairInfo)return;navigator.clipboard.writeText(pairInfo.port+':'+pairInfo.token).then(()=>status('연결 코드 복사 완료'))};
window.orcaAPI.onBrowserEvent(data=>{
  if(data.event!=='github-copy-clicked')return;
  // 다른 저장소에서 복사해도 진행되지 않도록 강의의 예제 저장소와 대조
  const repo=(lessonOf('clone').steps[0].url||'').toLowerCase();
  if(String(data.url).replace(/\.git$/,'').toLowerCase()!==repo){status('다른 저장소의 복사 버튼입니다. 강의의 예제 저장소에서 진행하세요.');return}
  if(current==='clone'&&positions.clone===1&&data.verified===true){next();status('✓ GitHub URL 클립보드 검증 성공')}else if(current==='clone'&&positions.clone===1){status('복사 클릭은 감지했지만 클립보드 확인이 불가능합니다. 주소를 확인한 뒤 직접 다음 단계로 진행하세요.')}
  else status('GitHub 복사 버튼 클릭 감지됨. 현재 강의 단계는 변경하지 않았습니다.');
});

$('verifyRepo').onclick=async()=>{
 try{const r=await window.orcaAPI.verifyRepo();if(r.ok){status('✓ Git origin 검증 완료: '+r.folder);if(current==='clone'&&positions.clone===2)next()}else status('저장소 확인 실패: '+(r.reason||'unknown')+(r.remote?' / '+r.remote:''))}catch(e){status('Git 확인 오류: '+e.message)}
};
$('showRect').onclick=()=>{
 const [x,y,width,height]=['rx','ry','rw','rh'].map(id=>Number($(id).value));
 window.orcaAPI.highlightRect({x,y,width,height}).then(()=>status('형광펜 표시됨 · 실제 Orca 버튼 위치는 수동 지정')).catch(e=>status('좌표 오류: '+e.message));
};
$('hideRect').onclick=()=>window.orcaAPI.highlightRect(null).then(()=>status('강조 표시 숨김'));
