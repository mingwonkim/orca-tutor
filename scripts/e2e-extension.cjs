// 사용법: npm start 대신 `npx electron . --remote-debugging-port=9333` 로 앱을 띄운 뒤 `node scripts/e2e-extension.cjs`  (REPO=<다른 저장소 URL> 로 거부 경로 확인)
// 실제 Chrome + 실제 github.com 에서 확장 E2E: 팝업 시작 → Code 클릭 → HTTPS 복사 클릭 → 앱 단계 진행 확인
// 전제: Orca Tutor 가 --remote-debugging-port=9333 으로 떠 있음
const { spawn } = require('node:child_process');
const path = require('node:path');
const SCRATCH = require('node:os').tmpdir();
const EXT = path.join(__dirname, '..', 'extension');
const REPO = process.env.REPO || 'https://github.com/mingwonkim/harujon-assets';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(...a);

// --- 튜터 앱(CDP websocket) ---
async function appSession() {
  const list = await (await fetch('http://127.0.0.1:9333/json/list')).json();
  const ws = new WebSocket(list.find(t => t.url.startsWith('file:')).webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {};
  ws.onmessage = e => { const m = JSON.parse(e.data); pend[m.id]?.(m); };
  return expr => new Promise(r => { const n = ++id; pend[n] = m => r(m.result?.result?.value); ws.send(JSON.stringify({ id: n, method: 'Runtime.evaluate', params: { expression: expr, awaitPromise: true, returnByValue: true } })); });
}

// --- Chrome (CDP pipe: fd3 쓰기, fd4 읽기, \0 구분) ---
function chrome() {
  const proc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--remote-debugging-pipe', '--enable-unsafe-extension-debugging', '--headless=new',
    `--user-data-dir=${path.join(SCRATCH, 'orca-tutor-e2e-profile')}`, '--no-first-run', '--no-default-browser-check', '--window-size=1400,900', 'about:blank'
  ], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
  const out = proc.stdio[3], inp = proc.stdio[4];
  let buf = '', id = 0; const pend = {}; const listeners = [];
  inp.on('data', d => { buf += d; let i; while ((i = buf.indexOf('\0')) >= 0) { const m = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1); if (m.id && pend[m.id]) pend[m.id](m); else listeners.forEach(f => f(m)); } });
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const n = ++id; pend[n] = m => m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result); out.write(JSON.stringify({ id: n, method, params, sessionId }) + '\0'); });
  return { proc, send, on: f => listeners.push(f) };
}

(async () => {
  const app = await appSession();
  // 앱: clone 강의 2단계(index 1)로 이동, 연결 코드 확보
  await app("{const s=document.getElementById('lesson');s.value='clone';s.onchange({target:s});document.getElementById('reset').click();document.getElementById('next').click()}");
  const pair = await app("window.orcaAPI.bridgeInfo().then(i=>i.port+':'+i.token)");
  log('app before:', await app("document.getElementById('count').textContent+' '+document.getElementById('title').textContent"));

  const c = chrome();
  try {
    const { id: extId } = await c.send('Extensions.loadUnpacked', { path: EXT });
    log('extension loaded:', extId);

    const { targetId } = await c.send('Target.createTarget', { url: REPO });
    const { sessionId: s } = await c.send('Target.attachToTarget', { targetId, flatten: true });
    await c.send('Page.enable', {}, s); await c.send('Runtime.enable', {}, s);
    await c.send('Browser.grantPermissions', { origin: 'https://github.com', permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'] });
    const ev = async expr => (await c.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, s)).result.value;
    for (let i = 0; i < 40 && await ev('document.readyState') !== 'complete'; i++) await sleep(500);
    await sleep(2000);
    log('page:', await ev('location.href'), '| lang:', await ev('document.documentElement.lang'));

    // 콘솔/네트워크 오류 수집
    const errors = [];
    await c.send('Network.enable', {}, s);
    c.on(m => { if (m.sessionId !== s) return; if (m.method === 'Network.requestWillBeSent' && m.params.request.url.includes('127.0.0.1')) log('net req:', m.params.request.url, 'Origin:', m.params.request.headers.Origin); if (m.method === 'Network.responseReceived' && m.params.response.url.includes('127.0.0.1')) log('net res:', m.params.response.status); if (m.method === 'Network.loadingFailed') log('net fail:', m.params.errorText, m.params.blockedReason || '', m.params.corsErrorStatus ? JSON.stringify(m.params.corsErrorStatus) : ''); });
    c.on(m => { if (m.sessionId === s && m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); if (m.sessionId === s && m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value || a.description).join(' ')); });

    // 확장 아이콘 클릭 = activeTab 권한 + 팝업
    const all = (await c.send('Target.getTargets', { filter: [{ type: 'tab' }, { type: 'page' }] })).targetInfos;
    const tab = all.find(t => t.type === 'tab' && t.url.startsWith(REPO));
    log('tab target:', tab?.targetId || 'none', all.map(t => t.type).join(','));
    await c.send('Extensions.triggerAction', { id: extId, targetId: tab.targetId });
    await sleep(1500);
    const popup = (await c.send('Target.getTargets')).targetInfos.find(t => t.url.includes(extId) && t.url.endsWith('popup.html'));
    log('popup target:', !!popup);
    const { sessionId: ps } = await c.send('Target.attachToTarget', { targetId: popup.targetId, flatten: true });
    const pev = async expr => (await c.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, ps)).result.value;
    // 사용자가 하듯 팝업에 연결 코드 입력 → 저장
    await pev(`document.getElementById('pair').value=${JSON.stringify(pair)};document.getElementById('save').click()`);
    await sleep(500);
    log('pair save:', await pev("document.getElementById('message').textContent"));
    await pev("document.getElementById('start').click()");
    await sleep(2000);
    log('popup message:', await pev("document.getElementById('message').textContent"));

    const rectOf = sel => ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,text:(e.getAttribute('aria-label')||e.textContent).trim().slice(0,40)}})()`);
    const click = async ({ x, y }) => { for (const type of ['mousePressed', 'mouseReleased']) await c.send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 }, s); };
    const tip = () => ev("document.getElementById('orca-v2-tip')?.textContent||null");

    let t = await rectOf('.orca-v2-target');
    log('① highlighted:', t?.text, '| tip:', await tip());
    if (!t) throw new Error('Code 버튼 강조 실패');
    await sleep(500); t = await rectOf('.orca-v2-target'); await click(t);
    await sleep(3000);
    t = await rectOf('.orca-v2-target');
    log('② highlighted:', t?.text, '| tip:', await tip());
    // 시나리오: GitHub CLI 탭으로 바꾸면 복사 버튼 대신 HTTPS 탭을 안내해야 한다
    const cli = await ev(`(()=>{const e=[...document.querySelectorAll("button")].find(x=>/GitHub CLI/.test(x.getAttribute("aria-label")||x.textContent));if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    if (cli) { await click(cli); await sleep(1200); log("CLI tab → tip:", await tip()); t = await rectOf(".orca-v2-target"); log("  highlighted:", t?.text); await click(t); await sleep(1200); log("HTTPS tab → tip:", await tip()); }
    else log("CLI tab: not found (skip)");
    t = await rectOf('.orca-v2-target');
    if (t && /HTTPS copy|HTTPS 복사/.test(await tip())) {
      await click(t);
      await sleep(2500);
      log('③ tip:', await tip());
      log('clipboard:', await ev('navigator.clipboard.readText().catch(e=>"ERR "+e.message)'));
      log('app after 1st copy:', await app("document.getElementById('count').textContent+' | '+document.getElementById('status').textContent"));
      // 같은 버튼을 다시 눌러도 매번 전송돼야 한다 (앱은 이미 3단계라 진행 없이 안내만)
      await sleep(2500); t = await rectOf('.orca-v2-target');
      if (!t) { log('2nd: no target | tip:', await tip(), '| state:', JSON.stringify(await ev(`({inputs:[...document.querySelectorAll('input')].filter(i=>/\\.git$/.test(i.value)).map(i=>({v:i.value,vis:i.getBoundingClientRect().width>0})),expanded:[...document.querySelectorAll('button')].filter(b=>/^Code/.test(b.textContent.trim())).map(b=>b.getAttribute('aria-expanded')),targets:document.querySelectorAll('.orca-v2-target').length})`))); throw new Error('2nd copy: no highlighted target'); }
      await click(t); await sleep(2500);
    }
    log('page errors:', errors.length ? errors : 'none');
    await sleep(1000);
    log('app after:', await app("document.getElementById('count').textContent+' '+document.getElementById('title').textContent+' | status: '+document.getElementById('status').textContent"));
  } finally { c.proc.kill(); }
  process.exit(0);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
