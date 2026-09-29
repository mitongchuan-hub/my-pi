/**
 * 实验室 Qwen 27B (5090) · Pi 一键接入
 *
 * 用法: 把这个文件放到  ~/.pi/agent/extensions/  下即可，然后启动 pi，
 *       /model 选择 "Qwen 27B Instruct (Lab)" 开始使用。
 *       没有 pi 的机器: npm install -g @earendil-works/pi-coding-agent
 *
 * 🔐 API Key 读取顺序（都不存在时本扩展自动禁用，不注册 provider）：
 *   1. 环境变量 LAB_QWEN_API_KEY
 *   2. 本地文件 ~/.pi/agent/secrets/lab-qwen.key（该目录永不入库/不上传）
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function loadKey(): string {
  if (process.env.LAB_QWEN_API_KEY) return process.env.LAB_QWEN_API_KEY.trim();
  const f = path.join(os.homedir(), ".pi", "agent", "secrets", "lab-qwen.key");
  try {
    return fs.readFileSync(f, "utf8").trim();
  } catch {
    return "";
  }
}

export default function (pi: ExtensionAPI) {
  const LAB_API_KEY = loadKey();
  if (!LAB_API_KEY) {
    console.warn("[lab-qwen] 未找到 API Key（环境变量 LAB_QWEN_API_KEY 或 ~/.pi/agent/secrets/lab-qwen.key），已跳过注册");
    return;
  }

  pi.registerProvider("lab-qwen", {
    name: "Lab Qwen (5090)",
    baseUrl: "http://172.25.17.131:18080/v1",
    apiKey: LAB_API_KEY,
    api: "openai-completions",
    authHeader: true,
    models: [
      {
        id: "qwen3.8:27b",
        name: "Qwen 27B Instruct (Lab)",
        reasoning: true,
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 102400,
        maxTokens: 32768,
        thinkingLevelMap: {
          // 本模型模板仅支持 low / medium / xhigh 三档
          minimal: null,   // 不支持，隐藏
          low: "low",
          medium: "medium",// 默认档
          high: "xhigh",   // 最高档映射到 xhigh
          xhigh: "xhigh",
          max: null,       // 不支持，隐藏
        },
        compat: {
          supportsDeveloperRole: false,
          supportsReasoningEffort: true,
          maxTokensField: "max_tokens",
        },
      },
    ],
  });
}
