// 사용법: 앱을 `npx electron . --remote-debugging-port=9333` 로 띄운 뒤 `node scripts/e2e-overlay.cjs` — 끝나면 앱이 스스로 종료돼야 정상
// CDP 로 Orca Tutor 렌더러를 조작: 형광펜 표시 → 숨김 → 창 닫기
const PORT = 9333;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const targets = async () => (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();

(async () => {
  let list;
  for (let i = 0; i < 30; i++) { try { list = await targets(); if (list.some(t => t.url.startsWith('file:'))) break; } catch {} await sleep(500); }
  const page = list.find(t => t.url.startsWith('file:'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0; const pending = {};
  ws.onmessage = e => { const m = JSON.parse(e.data); pending[m.id]?.(m); };
  const ev = expr => new Promise(r => { const n = ++id; pending[n] = m => r(m.result?.result?.value); ws.send(JSON.stringify({ id: n, method: 'Runtime.evaluate', params: { expression: expr, awaitPromise: true } })); });
  const st = () => ev("document.getElementById('status').textContent");
  const overlays = async () => (await targets()).filter(t => t.url.startsWith('data:')).length;

  console.log('before: overlay targets =', await overlays());
  await ev("for(const [k,v] of [['rx',200],['ry',200],['rw',240],['rh',90]])document.getElementById(k).value=v;document.getElementById('showRect').click()");
  await sleep(1500);
  console.log('show: status =', await st(), '| overlay targets =', await overlays());
  await ev("document.getElementById('hideRect').click()");
  await sleep(800);
  console.log('hide: status =', await st());
  await ev("document.getElementById('rw').value='';document.getElementById('showRect').click()");
  await sleep(500);
  console.log('bad input: status =', await st());
  ws.send(JSON.stringify({ id: ++id, method: 'Runtime.evaluate', params: { expression: 'window.close()' } }));
  await sleep(300);
  console.log('close sent');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
