const test=require('node:test');const assert=require('node:assert');
const fs=require('fs');const path=require('path');const vm=require('vm');
const ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/lessons.js'),'utf8'),ctx);
const LESSONS=ctx.window.LESSONS;
const REQUIRED=['title','body','verify','why','practice','result','caution'];

test('레슨 id 중복 없음',()=>{const ids=LESSONS.map(l=>l.id);assert.strictEqual(new Set(ids).size,ids.length)});
for(const l of LESSONS){
  test(`${l.id}: 단계 존재`,()=>assert.ok(l.steps.length>0));
  l.steps.forEach((s,i)=>{
    test(`${l.id}#${i+1} 필수 필드(현업 설명 포함)`,()=>{for(const k of REQUIRED)assert.ok(typeof s[k]==='string'&&s[k].trim(),`${k} 누락`)});
    test(`${l.id}#${i+1} 단축키 win/mac 쌍 + 검증 여부 표기`,()=>{
      assert.strictEqual(!!s.win,!!s.mac,'win/mac 중 하나만 있음');
      if(s.win)assert.strictEqual(typeof s.keyVerified,'boolean','keyVerified 누락');
      if(s.keyVerified===false)assert.ok(s.menu,'미검증 단축키에는 menu 대안 필요');
    });
    if(s.url)test(`${l.id}#${i+1} URL은 https`,()=>assert.strictEqual(new URL(s.url).protocol,'https:'));
  });
}
