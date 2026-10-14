const {test}=require('node:test');const assert=require('node:assert/strict');const {startBridge}=require('../src/bridge.cjs');
test('local bridge refuses unauthorized requests and accepts paired GitHub event',async()=>{
 const events=[];const b=startBridge(e=>events.push(e));await new Promise(resolve=>b.server.listening?resolve():b.server.once('listening',resolve));
 try{
  const url=`http://127.0.0.1:${b.port}/event`;
  const base={method:'POST',headers:{Origin:'chrome-extension://example','Content-Type':'application/json'},body:JSON.stringify({event:'github-copy-clicked',url:'https://github.com/owner/repo.git'})};
  assert.equal((await fetch(url,base)).status,403);
  assert.equal((await fetch(url,{...base,headers:{...base.headers,'X-Orca-Token':b.token}})).status,200);
  assert.equal(events.length,1);
  assert.equal((await fetch(url,{...base,headers:{...base.headers,Origin:'https://evil.example','X-Orca-Token':b.token}})).status,403);
  assert.equal((await fetch(url,{...base,headers:{...base.headers,Origin:'chrome-extension://example','X-Orca-Token':'bad'}})).status,403);
  assert.equal((await fetch(url,{...base,headers:{...base.headers,'X-Orca-Token':b.token},body:JSON.stringify({event:'github-copy-clicked',url:'https://evil.com/a'})})).status,400);
 }finally{await new Promise(resolve=>b.server.close(resolve))}
});
