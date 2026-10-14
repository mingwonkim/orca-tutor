const {app,BrowserWindow,ipcMain,screen,shell}=require('electron');
const path=require('path');
const {execFile}=require('node:child_process');
const {promisify}=require('node:util');
const run=promisify(execFile);
const {dialog}=require('electron');
const {startBridge}=require('./bridge.cjs');
let bridge;let overlay=null;

const ALLOWED_HOSTS=new Set(['github.com','www.onorca.dev','onorca.dev']);

function create(){
  const area=screen.getPrimaryDisplay().workArea;
  const width=410,height=Math.min(680,area.height-60);
  const win=new BrowserWindow({
    width,height,x:Math.max(area.x,area.x+area.width-width-20),y:area.y+45,
    minWidth:350,minHeight:Math.min(470,height),alwaysOnTop:true,autoHideMenuBar:true,title:'Orca Tutor',
    webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}
  });
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.on('will-navigate',e=>e.preventDefault());
  win.loadFile(path.join(__dirname,'index.html'));
  win.setAlwaysOnTop(true,'floating');
  // macOS: Orca가 전체 화면(별도 Space)이어도 안내창이 보이도록. 실기기 확인 필요.
  if(process.platform==='darwin')win.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen:true});
  // 숨은 overlay 창이 남아 있으면 window-all-closed 가 안 떠서 Windows 에서 앱이 종료되지 않는다
  win.on('closed',()=>{overlay?.destroy();overlay=null});
  return win;
}

// 앱 메인 문서(index.html)의 최상위 프레임만 IPC 허용 — 다른 file:// 문서·하위 프레임 차단
const INDEX_URL=require('node:url').pathToFileURL(path.join(__dirname,'index.html')).href;
function fromApp(e){return !!e.senderFrame&&e.senderFrame===e.sender.mainFrame&&e.senderFrame.url===INDEX_URL}

app.whenReady().then(()=>{bridge=startBridge(event=>{for(const w of BrowserWindow.getAllWindows())w.webContents.send('browser-event',event)});create();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)create()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});

ipcMain.handle('open-url',(e,url)=>{
  if(!fromApp(e))throw new Error('Blocked sender');
  const u=new URL(url);
  if(u.protocol!=='https:'||!ALLOWED_HOSTS.has(u.hostname))throw new Error('Blocked URL');
  return shell.openExternal(u.href);
});
ipcMain.handle('set-top',(e,value)=>{
  if(!fromApp(e))throw new Error('Blocked sender');
  BrowserWindow.fromWebContents(e.sender)?.setAlwaysOnTop(!!value,'floating');
  return true;
});

ipcMain.handle('bridge-info',e=>{if(!fromApp(e))throw Error('Blocked sender');return {port:bridge.port,token:bridge.token}});

// Transparent, click-through native highlight overlay. Manual placement is explicit:
// this does NOT claim to detect Orca controls automatically.
function highlightRect(rect){
 if(!rect){overlay?.hide();return true}
 if(![rect.x,rect.y,rect.width,rect.height].every(Number.isFinite))throw Error('Invalid rectangle');
 const bounds=screen.getDisplayNearestPoint({x:Math.round(rect.x),y:Math.round(rect.y)}).bounds;
 if(rect.width<8||rect.height<8||rect.width>bounds.width||rect.height>bounds.height)throw Error('Invalid rectangle');
 if(!overlay){overlay=new BrowserWindow({show:false,frame:false,transparent:true,alwaysOnTop:true,focusable:false,skipTaskbar:true,hasShadow:false,webPreferences:{sandbox:true,nodeIntegration:false,contextIsolation:true}});overlay.setIgnoreMouseEvents(true,{forward:true});overlay.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent('<html><body style="margin:0;box-sizing:border-box;width:100vw;height:100vh;border:5px solid #ffe600;border-radius:12px;background:rgba(255,230,0,.12)"></body></html>'))}
 overlay.setBounds({x:Math.round(rect.x),y:Math.round(rect.y),width:Math.round(rect.width),height:Math.round(rect.height)});
 overlay.setAlwaysOnTop(true,'screen-saver');overlay.showInactive();return true;
}
ipcMain.handle('highlight-rect',(e,rect)=>{if(!fromApp(e))throw Error('Blocked sender');return highlightRect(rect)});
// 읽기 전용 Git 검사. 결과 reason 을 단계별로 나눠 렌더러가 해결 방법을 안내한다.
// Orca 에 프로젝트가 등록됐는지는 알 수 없으므로 여기서는 "clone 됨"까지만 판정한다.
ipcMain.handle('verify-repo',async(e,expectedUrl)=>{
 if(!fromApp(e))throw Error('Blocked sender');
 const m=/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(String(expectedUrl));
 if(!m)throw Error('Invalid expected URL');
 const win=BrowserWindow.fromWebContents(e.sender);
 const selected=await dialog.showOpenDialog(win,{title:'Git 저장소 폴더 선택',properties:['openDirectory']});
 if(selected.canceled||!selected.filePaths[0])return {ok:false,reason:'cancelled'};
 const dir=selected.filePaths[0];
 const git=args=>run('git',['-C',dir,...args],{timeout:7000,windowsHide:true}).then(r=>r.stdout.trim());
 let root,remote;
 try{root=await git(['rev-parse','--show-toplevel'])}catch(err){return {ok:false,reason:err.code==='ENOENT'?'no-git':'not-repo'}}
 try{await git(['rev-parse','--verify','HEAD'])}catch{return {ok:false,reason:'no-commit',folder:root}}
 try{remote=await git(['remote','get-url','origin'])}catch{return {ok:false,reason:'no-origin',folder:root}}
 const normalize=u=>u.trim().replace(/\.git$/,'').replace(/\/$/,'').toLowerCase();
 const slug=`${m[1]}/${m[2]}`.toLowerCase();
 const match=[`https://github.com/${slug}`,`git@github.com:${slug}`,`ssh://git@github.com/${slug}`].includes(normalize(remote));
 return {ok:match,reason:match?'verified':'different-remote',folder:root,remote};
});
