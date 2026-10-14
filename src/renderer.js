const $=id=>document.getElementById(id);
const platform=window.orcaAPI?.platform||'win32';
const CONTEXT=[['why','왜 하는가'],['practice','현업에서는'],['result','성공하면'],['caution','주의할 점']];

function storageGet(k){try{return localStorage.getItem(k)}catch{return null}}
function storageSet(k,v){try{localStorage.setItem(k,v)}catch{}}

// --- Orca 연동 상태 ---
let userKeys={};            // ~/.orca/keybindings.json 사용자 단축키 {actionId:[...]}
const baselines={};         // 레슨별 시작 시점 Orca 상태 (worktree·분할 "새로 생겼는지" 판정용)
let checkRun=0;             // 단계가 바뀌면 이전 폴링을 무효화
const fmtKey=k=>platform==='darwin'
  ?k.split('+').map(p=>({Mod:'⌘',Cmd:'⌘',Shift:'⇧',Alt:'⌥',Ctrl:'⌃',Comma:','}[p]||p)).join(' ')
  :k.split('+').map(p=>({Mod:'Ctrl',Cmd:'Ctrl',Comma:','}[p]||p)).join('+');
const ORCA_REASON={'no-cli':'Orca CLI(orca)를 찾지 못했어요.','not-running':'Orca가 실행 중이 아니에요.','bad-output':'Orca 응답을 읽지 못했어요.'};

function renderOrca(s){
  const run=++checkRun,lessonId=current;
  // 형광펜: 이 단계에 Orca 버튼 대상이 있으면 메인 프로세스가 1초마다 위치를 추적
  const penWanted=!!s.target&&$('penOn').checked;
  $('pen').hidden=!s.target;$('penStatus').textContent='';
  window.orcaAPI.orcaHighlight(penWanted?s.target:null).then(r=>{
    if(run!==checkRun||!penWanted||r.ok)return;
    $('penStatus').textContent=r.reason==='unsupported'?'이 운영체제는 자동 형광펜 미지원 — 아래 수동 형광펜을 쓰세요.':'';
  }).catch(()=>{});
  // 자동 확인: orca CLI 로 2초마다 판정, 통과하면 다음 단계로
  $('auto').hidden=!s.check;$('auto').textContent=s.check?'Orca에서 자동 확인 중…':'';
  if(!s.check)return;
  (async()=>{
    if(!baselines[lessonId]){const r=await window.orcaAPI.orcaSnapshot();if(run!==checkRun)return;
      if(!r.ok){$('auto').textContent=(ORCA_REASON[r.reason]||'Orca 상태를 읽지 못했어요.')+' 직접 확인한 뒤 “완료했어요”를 누르세요.';return}
      baselines[lessonId]=r.snap}
    while(run===checkRun){
      const r=await window.orcaAPI.orcaCheck(s.check,baselines[lessonId]).catch(()=>({ok:false}));
      if(run!==checkRun)return;
      if(r.ok&&r.passed){next();status('✓ Orca에서 확인했어요. 다음 단계로 넘어갑니다.');return}
      $('auto').textContent=r.ok?'Orca에서 자동 확인 중… (완료되면 저절로 넘어가요)':(ORCA_REASON[r.reason]||'Orca 상태를 읽지 못했어요.')+' 직접 확인한 뒤 “완료했어요”를 누르세요.';
      await new Promise(res=>setTimeout(res,2000));
    }
  })();
}
window.orcaAPI.orcaKeys().then(k=>{userKeys=k||{};render()}).catch(()=>{});
window.orcaAPI.onOrcaHighlight(d=>{
  if($('pen').hidden)return;
  $('penStatus').textContent=d.found?`· "${d.name}" 버튼에 표시 중`:d.orcaRunning===false?'· Orca가 실행 중이 아니에요':'· Orca 화면에서 버튼을 찾는 중… (사이드바·탭이 보이게 해주세요)';
});

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
    const mine=s.action&&userKeys[s.action];
    const k=document.createElement('div');k.textContent=mine?(mine.length?mine.map(fmtKey).join(' / '):'단축키 해제됨'):key;$('key').append(k);
    const b=document.createElement('div');b.className=s.keyVerified===false?'unverified':'keynote';
    b.textContent=mine?`내 Orca 설정(~/.orca/keybindings.json) · 기본값은 ${key}`:s.keyVerified===false?'문서 기준 · 설치 버전에서 미검증':'Orca 1.4.205 기본값';
    $('key').append(b);
  }
  renderOrca(s);
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
$('reset').onclick=()=>{positions[current]=0;done=done.filter(id=>id!==current);delete baselines[current];save();renderOptions();render()};
$('penOn').checked=storageGet('pen')!=='off';
$('penOn').onchange=e=>{storageSet('pen',e.target.checked?'on':'off');render()};
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
  if(current==='clone'&&positions.clone===1&&data.verified===true){next();status('✓ GitHub URL 클립보드 검증 성공')}else if(current==='clone'&&positions.clone===1){status('복사 클릭은 감지했지만 클립보드 내용을 확인하지 못했습니다. HTTPS 주소를 다시 복사하거나, 주소를 확인한 뒤 직접 다음 단계로 진행하세요.')}
  // 확장은 복사할 때마다 다시 보내므로, 단계를 맞춘 뒤 다시 복사하면 된다
  else if(current==='clone'&&positions.clone>1)status('GitHub 복사 버튼 클릭 감지됨. 주소 복사 단계는 이미 지났습니다.');
  else status('GitHub 복사 버튼 클릭 감지됨. "GitHub 프로젝트 가져오기" 2단계(Clone 주소 복사)로 이동한 뒤 복사 버튼을 다시 누르면 자동으로 넘어갑니다.');
});

const REPO_REASON={
 'cancelled':'폴더 선택을 취소했습니다.',
 'no-git':'Git이 설치되어 있지 않습니다. https://git-scm.com 에서 설치한 뒤 다시 확인하세요.',
 'not-repo':'선택한 폴더는 Git 저장소가 아닙니다. git clone 으로 만든 폴더(.git 이 있는 폴더)를 선택하세요.',
 'no-commit':'저장소에 커밋이 없습니다. 빈 폴더에서 git init 한 것이 아니라 git clone 으로 받은 폴더인지 확인하세요.',
 'no-origin':'origin 원격 주소가 없습니다. git clone 으로 받은 폴더인지 확인하세요.',
 'different-remote':'다른 저장소입니다. 강의의 예제 저장소를 clone 한 폴더를 선택하세요.'
};
$('verifyRepo').onclick=async()=>{
 try{
  const r=await window.orcaAPI.verifyRepo(lessonOf('clone').steps[0].url);
  // clone 확인만 한다. Orca 등록 여부는 알 수 없으므로 단계는 사용자가 직접 넘긴다.
  if(r.ok)status('✓ Git clone 확인됨: '+r.folder+' — 이제 Orca에 이 폴더를 프로젝트로 등록한 뒤 “완료했어요”를 누르세요.');
  else status((r.reason==='cancelled'?'':'저장소 확인 실패: ')+(REPO_REASON[r.reason]||r.reason)+(r.remote?' (origin: '+r.remote+')':''));
 }catch(e){status('Git 확인 오류: '+e.message)}
};
$('showRect').onclick=()=>{
 const [x,y,width,height]=['rx','ry','rw','rh'].map(id=>Number($(id).value));
 window.orcaAPI.highlightRect({x,y,width,height}).then(()=>status('형광펜 표시됨 · 실제 Orca 버튼 위치는 수동 지정')).catch(e=>status('좌표 오류: '+e.message));
};
$('hideRect').onclick=()=>window.orcaAPI.highlightRect(null).then(()=>status('강조 표시 숨김'));
