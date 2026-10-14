const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('orcaAPI',{
  platform:process.platform, // 동기 값: 첫 렌더부터 올바른 OS 키 표기
  openUrl:url=>ipcRenderer.invoke('open-url',String(url)),
  setTop:v=>ipcRenderer.invoke('set-top',!!v),
  bridgeInfo:()=>ipcRenderer.invoke('bridge-info'),
  verifyRepo:()=>ipcRenderer.invoke('verify-repo'),
  highlightRect:r=>ipcRenderer.invoke('highlight-rect',r),
  onBrowserEvent:callback=>ipcRenderer.on('browser-event',(_e,data)=>callback(data))
});
