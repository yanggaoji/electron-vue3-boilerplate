<template>
  <div>
    <h1>Electron Vue3 IPC Demo</h1>

    <div style="margin-top: 20px">
      <h2>发送消息到主进程</h2>
      <input
        v-model="messageToSend"
        type="text"
        placeholder="输入要发送的消息..."
        @keyup.enter="sendMessage"
        style="margin-right: 10px"
      />
      <button @click="sendMessage">发送</button>
      <div v-if="mainProcessReply" style="margin-top: 10px">
        <strong>主进程回复：</strong> {{ mainProcessReply }}
      </div>
    </div>

    <div style="margin-top: 20px">
      <h2>应用信息</h2>
      <button @click="getAppInfo" :disabled="loading.appInfo">
        {{ loading.appInfo ? "加载中..." : "获取应用信息" }}
      </button>
      <ul v-if="appInfo" style="margin-top: 10px">
        <li v-for="(value, key) in appInfo" :key="key">
          <strong>{{ formatLabel(key) }}:</strong> {{ value }}
        </li>
      </ul>
    </div>

    <div style="margin-top: 20px">
      <h2>系统信息</h2>
      <button @click="getSystemInfo" :disabled="loading.systemInfo">
        {{ loading.systemInfo ? "加载中..." : "获取系统信息" }}
      </button>
      <ul v-if="systemInfo" style="margin-top: 10px">
        <li v-for="(value, key) in systemInfo" :key="key">
          <strong>{{ formatLabel(key) }}:</strong> {{ value }}
        </li>
      </ul>
    </div>

    <div style="margin-top: 20px">
      <h2>原生对话框</h2>
      <button @click="showDialog">打开对话框</button>
      <p v-if="dialogResult !== null" style="margin-top: 10px">
        你点击了：{{ dialogResult === 0 ? "OK" : "Cancel" }}
      </p>
    </div>

    <div
      style="margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px"
    >
      <p>运行平台: {{ platform }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from "vue";
import type { AppInfo, SystemInfo } from "./types/electron";

export default defineComponent({
  name: "App",
  setup() {
    // 状态
    const messageToSend = ref("Hello from Vue!");
    const mainProcessReply = ref("");
    const appInfo = ref<AppInfo | null>(null);
    const systemInfo = ref<SystemInfo | null>(null);
    const dialogResult = ref<number | null>(null);
    const platform = ref("");
    const loading = ref({
      appInfo: false,
      systemInfo: false,
    });

    // 取消订阅函数
    let unsubscribe: (() => void) | null = null;

    // 初始化
    onMounted(() => {
      platform.value = window.electronAPI?.platform || "unknown";

      // 监听主进程消息
      unsubscribe = window.electronAPI?.onMainMessage((message) => {
        mainProcessReply.value = message;
      });
    });

    // 清理
    onUnmounted(() => {
      unsubscribe?.();
    });

    // 发送消息到主进程
    const sendMessage = () => {
      if (messageToSend.value.trim()) {
        window.electronAPI?.sendMessage(messageToSend.value);
      }
    };

    // 获取应用信息
    const getAppInfo = async () => {
      loading.value.appInfo = true;
      try {
        appInfo.value =
          await window.electronAPI?.invoke<AppInfo>("get-app-info");
      } catch (error) {
        console.error("Failed to get app info:", error);
      } finally {
        loading.value.appInfo = false;
      }
    };

    // 获取系统信息
    const getSystemInfo = async () => {
      loading.value.systemInfo = true;
      try {
        systemInfo.value =
          await window.electronAPI?.invoke<SystemInfo>("get-system-info");
      } catch (error) {
        console.error("Failed to get system info:", error);
      } finally {
        loading.value.systemInfo = false;
      }
    };

    // 显示对话框
    const showDialog = async () => {
      try {
        const result = await window.electronAPI?.invoke<{ response: number }>(
          "show-dialog",
          {
            title: "IPC 测试",
            message: "这是一个通过 IPC 调用的原生对话框！",
          },
        );
        dialogResult.value = result?.response ?? null;
      } catch (error) {
        console.error("Failed to show dialog:", error);
      }
    };

    // 格式化标签名
    const formatLabel = (key: string): string => {
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    };

    return {
      messageToSend,
      mainProcessReply,
      appInfo,
      systemInfo,
      dialogResult,
      platform,
      loading,
      sendMessage,
      getAppInfo,
      getSystemInfo,
      showDialog,
      formatLabel,
    };
  },
});
</script>

<style>
body {
  font-family: sans-serif;
  padding: 20px;
}
button {
  margin-right: 5px;
  cursor: pointer;
}
input {
  padding: 5px;
}
</style>
