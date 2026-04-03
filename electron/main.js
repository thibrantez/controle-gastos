const { app, BrowserWindow, shell } = require('electron')
const http = require('http')
const path = require('path')

const PORTS = [3005, 3741, 3000, 3001, 3002, 3003, 3004]

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}`, (res) => {
      res.destroy()
      resolve(port)
    })
    req.setTimeout(1000, () => { req.destroy(); resolve(null) })
    req.on('error', () => resolve(null))
  })
}

async function findServer() {
  for (const port of PORTS) {
    const found = await checkPort(port)
    if (found) return found
  }
  return null
}

const NOT_RUNNING_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #030712;
    display: flex; align-items: center; justify-content: center;
    height: 100vh; font-family: system-ui, sans-serif;
    user-select: none;
  }
  .card {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 16px;
    padding: 40px 48px;
    text-align: center;
    max-width: 420px;
  }
  .icon { font-size: 48px; margin-bottom: 20px; }
  h2 { color: #f1f5f9; font-size: 18px; margin-bottom: 10px; }
  p  { color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
  code {
    display: block;
    background: #1e293b;
    color: #818cf8;
    font-size: 13px;
    padding: 10px 16px;
    border-radius: 8px;
    margin-bottom: 24px;
    font-family: monospace;
  }
  button {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    color: white;
    border: none;
    padding: 10px 28px;
    border-radius: 10px;
    font-size: 14px;
    cursor: pointer;
    font-weight: 600;
  }
  button:hover { opacity: 0.85; }
</style>
</head>
<body>
<div class="card">
  <div class="icon">⚡</div>
  <h2>Servidor não encontrado</h2>
  <p>Inicie o servidor antes de abrir o app:</p>
  <code>npm run dev</code>
  <button onclick="location.reload()">Tentar novamente</button>
</div>
</body>
</html>`

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 620,
    backgroundColor: '#030712',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'Controle de Gastos',
    autoHideMenuBar: true,
    show: false,
  })

  win.once('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const port = await findServer()

  if (port) {
    win.loadURL(`http://127.0.0.1:${port}`)
  } else {
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(NOT_RUNNING_HTML)}`)
  }
}

app.whenReady().then(async () => {
  await createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
