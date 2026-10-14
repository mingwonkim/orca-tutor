// 실제 Orca 와 연동 확인 (앱은 숨김 모드라 화면에 안 뜬다): node scripts/e2e-orca.cjs
// - 단축키 표기(Orca 기본값/사용자 설정)
// - clone 3단계: Orca 에 예제 저장소가 등록돼 있으면 자동으로 4단계로 진행
// - split 1단계: 자동 확인 대기 상태로 머묾 (분할 전이므로)
const {spawn}=require('node:child_process');const path=require('node:path');
const ROOT=path.join(__dirname,'..');const PORT=9334;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// ORCA_TUTOR_BIN=<빌드된 exe> 로 패키징 결과도 같은 검사를 돌린다
const BIN=process.env.ORCA_TUTOR_BIN;
const app=spawn(BIN||path.join(ROOT,'node_modules','electron','dist',process.platform==='win32'?'electron.exe':'electron'),[...(BIN?[]:['.']),`--remote-debugging-port=${PORT}`],{cwd:ROOT,env:{...process.env,ORCA_TUTOR_HIDDEN:'1'},stdio:'ignore'});

(async()=>{
 let list;for(let i=0;i<40;i++){try{list=await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();if(list.some(t=>t.url.startsWith('file:')))break}catch{}await sleep(300)}
 const ws=new WebSocket(list.find(t=>t.url.startsWith('file:')).webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
 let id=0;const pend={};ws.onmessage=e=>{const m=JSON.parse(e.data);pend[m.id]?.(m)};
 const ev=expr=>new Promise(r=>{const n=++id;pend[n]=m=>r(m.result?.result?.value);ws.send(JSON.stringify({id:n,method:'Runtime.evaluate',params:{expression:expr,awaitPromise:true,returnByValue:true}}))});
 const go=(lesson,step)=>ev(`{const s=document.getElementById('lesson');s.value='${lesson}';s.onchange({target:s});document.getElementById('reset').click();for(let i=0;i<${step};i++)document.getElementById('next').click()}`);
 const read=()=>ev(`({count:document.getElementById('count').textContent,title:document.getElementById('title').textContent,key:document.getElementById('key').innerText.replace(/\\n/g,' | '),auto:document.getElementById('auto').hidden?null:document.getElementById('auto').textContent,pen:document.getElementById('pen').hidden?null:document.getElementById('penStatus').textContent,status:document.getElementById('status').textContent})`);
 const fails=[];const expect=(ok,msg)=>{console.log(ok?'  ✓':'  ✗',msg);if(!ok)fails.push(msg)};
 await sleep(1500);

 await go('intro',1);await sleep(500);let r=await read();console.log('intro#2',JSON.stringify(r));
 expect(/Ctrl\+Shift\+J|⌘ J/.test(r.key),'Worktree Jump 단축키가 Orca 기본값');expect(/기본값|내 Orca 설정/.test(r.key),'단축키 출처 표시');expect(r.pen!==null,'형광펜 토글 표시');

 // 형광펜 추적: 숨김 모드라 overlay 는 안 보이지만 버튼 찾기·좌표 변환·overlay 배치까지는 실제로 돈다
 await go('clone',0);await go('intro',2);let found=false;for(let i=0;i<8&&!found;i++){await sleep(700);r=await read();found=/표시 중/.test(r.pen||'')}
 console.log('intro#3 pen',JSON.stringify(r.pen));
 expect(found||/실행 중이 아니/.test(r.pen||''),'Orca "새 탭" 버튼 위치 추적 (Orca 꺼져 있으면 안내)');
 const ov=(await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).filter(t=>t.url.startsWith('data:')).length;
 expect(!found||ov===1,'overlay 창 생성됨');

 await go('split',0);await sleep(3500);r=await read();console.log('split#1',JSON.stringify(r));
 expect(r.count.startsWith('1 /'),'분할 전에는 진행 안 함');expect(/자동 확인 중/.test(r.auto||''),'자동 확인 대기 문구');expect(/Ctrl\+Shift\+D|⌘ D/.test(r.key),'오른쪽 분할 단축키');

 await go('clone',2);let advanced=false;for(let i=0;i<10&&!advanced;i++){await sleep(1000);r=await read();advanced=r.count.startsWith('4 /')}
 console.log('clone#3',JSON.stringify(r));
 expect(advanced&&/Orca에서 확인/.test(r.status),'예제 저장소가 Orca 에 등록돼 있으면 자동 진행 (미등록이면 대기가 정상)');

 app.kill();process.exit(fails.length?1:0);
})().catch(e=>{console.error('FAIL',e);app.kill();process.exit(1)});
