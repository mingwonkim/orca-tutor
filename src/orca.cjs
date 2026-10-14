// Orca 연동 (메인 프로세스 전용, 전부 읽기 전용)
// - 공식 orca CLI(--json)로 프로젝트·worktree·터미널 상태를 읽어 단계 완료를 판정
// - ~/.orca/keybindings.json 에서 사용자가 바꾼 단축키를 읽음
// - Windows: UI Automation 으로 Orca 창의 버튼 위치를 찾음 (macOS 는 미구현 → null)
const {execFile,spawn}=require('node:child_process');
const fs=require('node:fs');const os=require('node:os');const path=require('node:path');

function orcaBin(){
 if(process.platform==='win32'){const p=path.join(process.env.LOCALAPPDATA||'','Programs','orca','resources','bin','orca.exe');if(fs.existsSync(p))return p}
 return 'orca';
}
function orcaJson(args,run=execFile){
 return new Promise((resolve,reject)=>run(orcaBin(),[...args,'--json'],{timeout:8000,windowsHide:true,maxBuffer:16*1024*1024},(err,stdout)=>{
  if(err&&err.code==='ENOENT')return reject(Object.assign(Error('Orca CLI 없음'),{code:'no-cli'}));
  let j;try{j=JSON.parse(stdout)}catch{return reject(Object.assign(Error('Orca 응답 해석 실패'),{code:'bad-output'}))}
  if(!j.ok)return reject(Object.assign(Error(j.error?.message||'Orca 오류'),{code:j.error?.code==='runtime_unavailable'?'not-running':'orca-error'}));
  resolve(j.result);
 }));
}

// 판정에 필요한 구조 정보만 남긴다 (터미널 미리보기·제목 같은 내용은 버림)
async function snapshot(run){
 const [r,w,t]=await Promise.all([orcaJson(['repo','list'],run),orcaJson(['worktree','list'],run),orcaJson(['terminal','list'],run)]);
 const tabs={};const agentWorktrees=new Set();
 for(const x of t.terminals||[]){if(x.orphaned)continue;tabs[x.tabId]=(tabs[x.tabId]||0)+1;if(x.agentIdentity)agentWorktrees.add(x.worktreeId)}
 return {
  repos:(r.repos||[]).map(x=>({id:x.id,key:(x.gitRemoteIdentity?.canonicalKey||'').toLowerCase()})),
  worktrees:(w.worktrees||[]).filter(x=>!x.isArchived).map(x=>({id:x.id,repoId:x.repoId,main:!!x.isMainWorktree})),
  tabs,agents:agentWorktrees.size
 };
}

// check: lessons.js 의 step.check. base: 단계에 들어올 때의 snapshot. 순수 함수라 테스트 가능.
function evaluate(check,base,now){
 switch(check.kind){
  case 'repo-registered':return now.repos.some(r=>r.key===check.repo.toLowerCase());
  case 'repos-min':return now.repos.length>=check.n;
  case 'new-worktrees':{const old=new Set(base.worktrees.map(w=>w.id));return now.worktrees.filter(w=>!w.main&&!old.has(w.id)).length>=(check.n||1)}
  case 'split':return Object.entries(now.tabs).some(([id,n])=>n>=check.panes&&n>(base.tabs[id]||0));
  case 'agents':return now.agents>=check.n;
  default:return false;
 }
}

// ~/.orca/keybindings.json → {actionId:[bindings]} (현재 플랫폼 우선). 없으면 {}.
function keybindings(home=os.homedir(),platform=process.platform){
 let doc;try{doc=JSON.parse(fs.readFileSync(path.join(home,'.orca','keybindings.json'),'utf8'))}catch{return {}}
 const norm=o=>Object.fromEntries(Object.entries(o||{}).filter(([k])=>k!=='platforms').map(([k,v])=>[k,[].concat(v??[]).filter(s=>typeof s==='string')]));
 const common=norm(doc.keybindings??doc);
 return {...common,...norm((doc.platforms||{})[platform])};
}

// --- Windows UI Automation: 상주 PowerShell 하나에 한 줄씩 질의 (매번 띄우면 느림) ---
const PS=String.raw`
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
$AE=[System.Windows.Automation.AutomationElement]; $TS=[System.Windows.Automation.TreeScope]
[Console]::OutputEncoding=[Text.Encoding]::UTF8; [Console]::InputEncoding=[Text.Encoding]::UTF8
while(($line=[Console]::In.ReadLine()) -ne $null){
 try{
  $re=$line; $hit=$null
  $p=Get-Process -Name Orca -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if($p){
   $win=$AE::FromHandle($p.MainWindowHandle)
   $all=$win.FindAll($TS::Descendants,(New-Object System.Windows.Automation.PropertyCondition($AE::ControlTypeProperty,[System.Windows.Automation.ControlType]::Button)))
   foreach($e in $all){ $n=$e.Current.Name; if($n -and $n -match $re -and -not $e.Current.IsOffscreen){ $r=$e.Current.BoundingRectangle; if($r.Width -gt 0){ $hit=@{x=$r.X;y=$r.Y;width=$r.Width;height=$r.Height;name=$n}; break } } }
  }
  [Console]::Out.WriteLine((ConvertTo-Json -Compress @{ok=$true;orca=[bool]$p;hit=$hit}))
 }catch{ [Console]::Out.WriteLine((ConvertTo-Json -Compress @{ok=$false;error="$_"})) }
}`;
let ps=null,queue=[],buf='';
function uia(){
 if(ps)return ps;
 // 스크립트는 -EncodedCommand 로, stdin 은 질의 전용으로 쓴다
 ps=spawn('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(PS,'utf16le').toString('base64')],{windowsHide:true});
 ps.stdout.setEncoding('utf8');
 ps.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const line=buf.slice(0,i).trim();buf=buf.slice(i+1);if(!line.startsWith('{'))continue;const q=queue.shift();try{q?.resolve(JSON.parse(line))}catch(e){q?.reject(e)}}});
 ps.on('exit',()=>{ps=null;for(const q of queue.splice(0))q.reject(Error('UIA 종료'))});
 return ps;
}
// patterns: 정규식 문자열 배열 (한국어·영어 UI 이름). 화면 좌표(물리 픽셀) 사각형 또는 null.
function findControl(patterns){
 if(process.platform!=='win32')return Promise.resolve({ok:true,orca:null,hit:null,unsupported:true});
 const p=uia();
 return new Promise((resolve,reject)=>{
  const t=setTimeout(()=>{queue=queue.filter(q=>q.resolve!==done);reject(Error('UIA 시간 초과'))},8000);
  const done=v=>{clearTimeout(t);resolve(v)};
  queue.push({resolve:done,reject:e=>{clearTimeout(t);reject(e)}});
  p.stdin.write(patterns.join('|').replace(/[\r\n]/g,'')+'\n');
 });
}
function stopUia(){ps?.kill();ps=null}

module.exports={orcaJson,snapshot,evaluate,keybindings,findControl,stopUia};
