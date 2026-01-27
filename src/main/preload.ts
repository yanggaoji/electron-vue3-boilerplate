import { contextBridge, ipcRenderer } from "electron";

// 定义暴露给渲染进程的 API
const electronAPI = {
  // 发送消息到主进程
  sendMessage: (message: string) => {
    ipcRenderer.send("message-from-renderer", message);
  },

  // 调用主进程方法并获取返回值（双向通信）
  invoke: async (channel: string, ...args: unknown[]) => {
    const validChannels = ["get-app-info", "show-dialog", "get-system-info"];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Invalid channel: ${channel}`);
  },

  // 监听主进程发来的消息
  onMainMessage: (callback: (message: string) => void) => {
    const subscription = (
      _event: Electron.IpcRendererEvent,
      message: string,
    ) => {
      callback(message);
    };
    ipcRenderer.on("message-from-main", subscription);

    // 返回取消订阅函数
    return () => {
      ipcRenderer.removeListener("message-from-main", subscription);
    };
  },

  // 平台信息
  platform: process.platform,
};

// 安全地将 API 暴露给渲染进程
contextBridge.exposeInMainWorld("electronAPI", electronAPI);

// 导出类型供渲染进程使用
export type ElectronAPI = typeof electronAPI;
