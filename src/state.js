// 저장된 진행 상태를 현재 레슨 데이터에 맞게 정규화합니다.
// 깨진 JSON, 삭제된 레슨 id, 단계 수 축소 시에도 안전하게 동작해야 합니다.
(function(root){
  function parse(raw,fallback){try{const v=JSON.parse(raw);return v&&typeof v==='object'?v:fallback}catch{return fallback}}
  function normalizeState(lessons,raw){
    const positions=parse(raw.positions||'{}',{});
    const doneIn=parse(raw.done||'[]',[]);
    const out={};
    for(const l of lessons){const n=Math.floor(Number(positions[l.id]))||0;out[l.id]=Math.min(Math.max(0,n),l.steps.length-1)}
    const ids=new Set(lessons.map(l=>l.id));
    const current=ids.has(raw.lesson)?raw.lesson:lessons[0].id;
    const done=Array.isArray(doneIn)?doneIn.filter(id=>ids.has(id)):[];
    return {current,positions:out,done};
  }
  root.normalizeState=normalizeState;
  if(typeof module!=='undefined')module.exports={normalizeState};
})(typeof window!=='undefined'?window:globalThis);
