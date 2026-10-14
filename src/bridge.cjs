const http=require('node:http');
const crypto=require('node:crypto');
function startBridge(onEvent){
 const token=crypto.randomBytes(18).toString('hex');
 const server=http.createServer((req,res)=>{
  const origin=req.headers.origin||'';
  const allowed=/^(chrome-extension|moz-extension):\/\/[a-zA-Z0-9_-]+$/.test(origin);
  res.setHeader('Access-Control-Allow-Origin',allowed?origin:'null');
  res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Content-Type,X-Orca-Token');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  if(req.method==='OPTIONS'){res.writeHead(allowed?204:403);res.end();return}
  if(!allowed||req.method!=='POST'||req.url!=='/event'||req.headers['x-orca-token']!==token){res.writeHead(403);res.end();return}
  let raw='';req.on('data',c=>{raw+=c;if(raw.length>4096)req.destroy()});req.on('end',()=>{
   try{const data=JSON.parse(raw);if(data.event!=='github-copy-clicked'||!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(?:\.git)?$/.test(data.url)){throw Error('invalid event')}
    onEvent({event:data.event,url:data.url,verified:data.verified===true});res.writeHead(200,{'Content-Type':'application/json'});res.end('{"ok":true}');
   }catch{res.writeHead(400);res.end()}
  });
 });
 server.listen(0,'127.0.0.1');
 return {server,token,get port(){return server.address()?.port||0}};
}
module.exports={startBridge};
