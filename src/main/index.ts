import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as os from "os";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      // 安全配置：启用 contextIsolation，禁用 nodeIntegration
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    // 窗口样式优化
    show: false, // 等待 ready-to-show 事件再显示，避免白屏
    backgroundColor: "#f5f5f5",
  });

  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL("http://localhost:8080");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  // 窗口准备好后再显示，提升用户体验
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ============ IPC 通信处理 ============

// 处理来自渲染进程的消息
ipcMain.on("message-from-renderer", (_event, message: string) => {
  console.log("[Main] Received message from renderer:", message);

  // 回复消息给渲染进程
  if (mainWindow) {
    mainWindow.webContents.send(
      "message-from-main",
      `Main process received: "${message}"`,
    );
  }
});

// 获取应用信息（invoke 模式，支持返回值）
ipcMain.handle("get-app-info", async () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
    platform: process.platform,
    arch: process.arch,
  };
});

// 获取系统信息
ipcMain.handle("get-system-info", async () => {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    homeDir: os.homedir(),
    uptime: `${(os.uptime() / 3600).toFixed(2)} hours`,
  };
});

// 显示对话框
ipcMain.handle(
  "show-dialog",
  async (_event, options: { title: string; message: string }) => {
    if (!mainWindow) return null;

    const result = await dialog.showMessageBox(mainWindow, {
      type: "info",
      title: options.title,
      message: options.message,
      buttons: ["OK", "Cancel"],
    });

    return result;
  },
);

// ============ 应用生命周期 ============

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
