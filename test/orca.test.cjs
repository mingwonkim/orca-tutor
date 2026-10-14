const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const os=require('node:os');const path=require('node:path');const vm=require('node:vm');
const orca=require('../src/orca.cjs');

const snap=(o={})=>({repos:[],worktrees:[],tabs:{},agents:0,...o});

test('repo-registered: canonicalKey 대소문자 무시',()=>{
 const now=snap({repos:[{id:'a',key:'github.com/mingwonkim/harujon-assets'}]});
 assert.equal(orca.evaluate({kind:'repo-registered',repo:'github.com/MingwonKim/harujon-assets'},snap(),now),true);
 assert.equal(orca.evaluate({kind:'repo-registered',repo:'github.com/x/y'},snap(),now),false);
});
test('repos-min',()=>{
 assert.equal(orca.evaluate({kind:'repos-min',n:2},snap(),snap({repos:[{id:1},{id:2}]})),true);
 assert.equal(orca.evaluate({kind:'repos-min',n:2},snap(),snap({repos:[{id:1}]})),false);
});
test('new-worktrees: 시작 시점 이후 새로 생긴 메인 아닌 worktree 만 센다',()=>{
 const base=snap({worktrees:[{id:'m',main:true},{id:'old',main:false}]});
 assert.equal(orca.evaluate({kind:'new-worktrees',n:1},base,base),false);
 assert.equal(orca.evaluate({kind:'new-worktrees',n:1},base,snap({worktrees:[...base.worktrees,{id:'new',main:false}]})),true);
 assert.equal(orca.evaluate({kind:'new-worktrees',n:3},base,snap({worktrees:[...base.worktrees,{id:'a'},{id:'b'}]})),false);
});
test('split: 원래 4분할이던 탭은 통과시키지 않고, 늘어난 탭만 본다',()=>{
 const base=snap({tabs:{t1:4,t2:1}});
 assert.equal(orca.evaluate({kind:'split',panes:2},base,base),false);
 assert.equal(orca.evaluate({kind:'split',panes:2},base,snap({tabs:{t1:4,t2:2}})),true);
 assert.equal(orca.evaluate({kind:'split',panes:4},base,snap({tabs:{t1:4,t2:3}})),false);
 assert.equal(orca.evaluate({kind:'split',panes:2},base,snap({tabs:{t1:4,t2:1,t3:2}})),true);
});
test('agents',()=>{assert.equal(orca.evaluate({kind:'agents',n:3},snap(),snap({agents:3})),true)});
test('알 수 없는 kind 는 통과하지 않음',()=>{assert.equal(orca.evaluate({kind:'nope'},snap(),snap()),false)});

test('snapshot: CLI 출력에서 구조 정보만 남긴다 (미리보기·제목 버림)',async()=>{
 const fake={repo:{repos:[{id:'r',gitRemoteIdentity:{canonicalKey:'GitHub.com/A/B'}}]},
  worktree:{worktrees:[{id:'w1',repoId:'r',isMainWorktree:true},{id:'w2',repoId:'r',isArchived:true}]},
  terminal:{terminals:[{tabId:'t',worktreeId:'w1',agentIdentity:'claude',preview:'비밀'},{tabId:'t',worktreeId:'w1'},{tabId:'u',orphaned:true}]}};
 const run=(_bin,args,_o,cb)=>cb(null,JSON.stringify({ok:true,result:fake[args[0]]}));
 const s=await orca.snapshot(run);
 assert.deepEqual(s,{repos:[{id:'r',key:'github.com/a/b'}],worktrees:[{id:'w1',repoId:'r',main:true}],tabs:{t:2},agents:1});
 assert.ok(!JSON.stringify(s).includes('비밀'));
});
test('orcaJson: CLI 없음/실행 안 됨 구분',async()=>{
 await assert.rejects(orca.orcaJson(['repo','list'],(_b,_a,_o,cb)=>cb(Object.assign(Error('x'),{code:'ENOENT'}))),{code:'no-cli'});
 await assert.rejects(orca.orcaJson(['repo','list'],(_b,_a,_o,cb)=>cb(null,JSON.stringify({ok:false,error:{code:'runtime_unavailable'}}))),{code:'not-running'});
});

test('keybindings: 공통 + 플랫폼별 덮어쓰기, 없으면 {}',()=>{
 const home=fs.mkdtempSync(path.join(os.tmpdir(),'orca-kb-'));
 assert.deepEqual(orca.keybindings(home,'win32'),{});
 fs.mkdirSync(path.join(home,'.orca'));
 fs.writeFileSync(path.join(home,'.orca','keybindings.json'),JSON.stringify({keybindings:{'terminal.splitRight':'Mod+Alt+R','tab.newTerminal':[]},platforms:{win32:{'terminal.splitRight':['Mod+K']}}}));
 assert.deepEqual(orca.keybindings(home,'win32'),{'terminal.splitRight':['Mod+K'],'tab.newTerminal':[]});
 assert.deepEqual(orca.keybindings(home,'darwin'),{'terminal.splitRight':['Mod+Alt+R'],'tab.newTerminal':[]});
 fs.writeFileSync(path.join(home,'.orca','keybindings.json'),'{깨진 json');
 assert.deepEqual(orca.keybindings(home,'win32'),{});
});

test('레슨의 check/target/action 형식',()=>{
 const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/lessons.js'),'utf8'),ctx);
 const KINDS=['repo-registered','repos-min','new-worktrees','split','agents'];
 for(const l of ctx.window.LESSONS)for(const s of l.steps){
  if(s.check){assert.ok(KINDS.includes(s.check.kind),`${l.id}: ${s.check.kind}`);if(s.check.kind==='repo-registered')assert.match(s.check.repo,/^github\.com\/[\w.-]+\/[\w.-]+$/)}
  if(s.target){assert.ok(Array.isArray(s.target)&&s.target.length<=4);for(const p of s.target)new RegExp(p)}
  if(s.action)assert.match(s.action,/^[a-z]+(\.[A-Za-z]+)+$/);
 }
});
