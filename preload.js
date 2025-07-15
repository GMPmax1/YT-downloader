const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  checkYtDlp: () => ipcRenderer.invoke('check-ytdlp'),
  downloadVideos: (options) => ipcRenderer.invoke('download-videos', options),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', callback)
});