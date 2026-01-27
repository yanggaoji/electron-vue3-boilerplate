// 全局类型定义：将 electronAPI 暴露到 window 对象上

export interface AppInfo {
  name: string;
  version: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  platform: string;
  arch: string;
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  cpus: number;
  totalMemory: string;
  freeMemory: string;
  homeDir: string;
  uptime: string;
}

export interface DialogResult {
  response: number;
  checkboxChecked: boolean;
}

export interface ElectronAPI {
  sendMessage: (message: string) => void;
  invoke: <T = unknown>(channel: string, ...args: unknown[]) => Promise<T>;
  onMainMessage: (callback: (message: string) => void) => () => void;
  platform: NodeJS.Platform;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
