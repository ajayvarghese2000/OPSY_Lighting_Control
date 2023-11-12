const { app, BrowserWindow } = require('electron')

// Create the application window.
const createWindow = () => {
  const win = new BrowserWindow({
    width: 389,
    height: 650,
    resizable: false,
    autoHideMenuBar: true,
    webPreferences: 
      {
        nodeIntegration: true,
        contextIsolation: false,
        devTools: false,
      }
  })

  // Load the index.html of the app.
  win.loadFile('./src/index.html')
}

// When the app is ready, create the application window.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// When all windows are closed, quit the application
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})