const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path')
const iconPath = path.join(__dirname, "/img/Sandbag.png");
let tray = null

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  win.on('minimize', () => {
    win.hide();
    tray = new Tray(iconPath);
    tray.setToolTip('Slippi Replay Formatter')

    tray.on('click', () => {
      win.show();
      tray.destroy();
    })
  })

  win.loadFile('main.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

