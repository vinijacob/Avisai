const { app, BrowserWindow, nativeTheme, shell } = require("electron");

const APP_URL = process.env.AVISAI_URL ?? "http://localhost:3000";

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 380,
    minHeight: 600,
    title: "Avisaí",
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#0b0b0d" : "#f4f3ee",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once("ready-to-show", () => win.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(APP_URL)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.webContents.on("did-fail-load", (_event, errorCode, _description, _url, isMainFrame) => {
    if (!isMainFrame || errorCode === -3) return;
    win.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent(
          `<body style="font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;background:#0b0b0d;color:#f3f2ed">
            <div style="text-align:center"><h2>Não foi possível conectar ao Avisaí</h2>
            <p style="opacity:.6">Verifique se o frontend está rodando em ${APP_URL}</p></div></body>`,
        ),
    );
  });

  win.loadURL(APP_URL);
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
