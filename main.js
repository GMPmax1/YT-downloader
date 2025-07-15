const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'hiddenInset',
    show: false
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'Text Files', extensions: ['txt'] }
    ],
    properties: ['openFile']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf8');
    return {
      path: filePath,
      content: content
    };
  }
  return null;
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('check-ytdlp', async () => {
  return new Promise((resolve) => {
    exec('yt-dlp --version', (error, stdout, stderr) => {
      if (error) {
        resolve({ installed: false, error: error.message });
      } else {
        resolve({ installed: true, version: stdout.trim() });
      }
    });
  });
});

ipcMain.handle('download-videos', async (event, { links, outputPath, format, quality }) => {
  const totalVideos = links.length;
  let completedVideos = 0;
  const failedVideos = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i].trim();
    if (!link) continue;

    try {
      await downloadSingleVideo(link, outputPath, format, quality, (progress) => {
        event.sender.send('download-progress', {
          currentVideo: i + 1,
          totalVideos,
          completedVideos,
          progress,
          currentUrl: link
        });
      });
      
      completedVideos++;
      event.sender.send('download-progress', {
        currentVideo: i + 1,
        totalVideos,
        completedVideos,
        progress: 100,
        currentUrl: link,
        status: 'completed'
      });
    } catch (error) {
      failedVideos.push({ url: link, error: error.message });
      event.sender.send('download-progress', {
        currentVideo: i + 1,
        totalVideos,
        completedVideos,
        progress: 0,
        currentUrl: link,
        status: 'failed',
        error: error.message
      });
    }
  }

  return {
    completed: completedVideos,
    failed: failedVideos.length,
    failedVideos
  };
});

function downloadSingleVideo(url, outputPath, format, quality, progressCallback) {
  return new Promise((resolve, reject) => {
    const formatArg = format === 'audio' ? '-f bestaudio[ext=m4a]' : `-f "best[height<=${quality}]"`;
    const outputTemplate = path.join(outputPath, '%(title)s.%(ext)s');
    
    const command = `yt-dlp ${formatArg} -o "${outputTemplate}" "${url}"`;
    
    const process = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    // Parse progress from yt-dlp output
    process.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.includes('[download]') && line.includes('%')) {
          const match = line.match(/(\d+\.?\d*)%/);
          if (match) {
            progressCallback(parseFloat(match[1]));
          }
        }
      }
    });
  });
}