const test=require('node:test');const assert=require('node:assert');
const {normalizeState}=require('../src/state.js');
const L=[{id:'a',steps:[1,2,3]},{id:'b',steps:[1]}];

test('빈 저장소 → 첫 레슨, 0단계',()=>{assert.deepStrictEqual(normalizeState(L,{}),{current:'a',positions:{a:0,b:0},done:[]})});
test('삭제된 레슨 id → 첫 레슨으로 대체',()=>{assert.strictEqual(normalizeState(L,{lesson:'old'}).current,'a')});
test('깨진 JSON → 기본값',()=>{const s=normalizeState(L,{positions:'{oops',done:'nope'});assert.deepStrictEqual(s.positions,{a:0,b:0});assert.deepStrictEqual(s.done,[])});
test('범위 밖 위치 → clamp',()=>{const s=normalizeState(L,{positions:JSON.stringify({a:9,b:-4})});assert.deepStrictEqual(s.positions,{a:2,b:0})});
test('숫자 아닌 위치 → 0',()=>{assert.strictEqual(normalizeState(L,{positions:JSON.stringify({a:'x'})}).positions.a,0)});
test('없는 레슨의 완료 기록 제거',()=>{assert.deepStrictEqual(normalizeState(L,{done:JSON.stringify(['a','zzz'])}).done,['a'])});
test('null JSON → 기본값',()=>{assert.deepStrictEqual(normalizeState(L,{positions:'null'}).positions,{a:0,b:0})});
