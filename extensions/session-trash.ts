import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// 回收站目录（与之前的 sessions-trash 保持一致）
const TRASH_DIR = path.join(os.homedir(), ".pi", "agent", "sessions-trash");

interface TrashItem {
  dir: string;
  file: string;
  size: number;
}

function listTrash(): TrashItem[] {
  const out: TrashItem[] = [];
  if (!fs.existsSync(TRASH_DIR)) return out;
  for (const dir of fs.readdirSync(TRASH_DIR)) {
    const d = path.join(TRASH_DIR, dir);
    if (!fs.statSync(d).isDirectory()) continue;
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      try {
        out.push({ dir, file: f, size: fs.statSync(p).size });
      } catch {
        /* ignore */
      }
    }
  }
  return out;
}

function fmtSize(n: number): string {
  return n > 1048576 ? (n / 1048576).toFixed(1) + "MB" : (n / 1024).toFixed(0) + "KB";
}

export default function (pi: ExtensionAPI) {
  // /trash —— 将当前会话移入回收站，然后自动开新会话
  pi.registerCommand("trash", {
    description: "把当前会话移入回收站（sessions-trash），然后开始新会话",
    handler: async (_args, ctx) => {
      const file = ctx.sessionManager.getSessionFile();
      if (!file) {
        ctx.ui.notify("当前是临时会话（无会话文件），无需归档", "error");
        return;
      }
      const ok = await ctx.ui.confirm(
        "归档当前会话",
        `将移入回收站:\n${file}\n\n之后会自动开启新会话，会话可用 /trashrestore 恢复。`,
      );
      if (!ok) return;

      await ctx.newSession({
        withSession: async (nctx) => {
          try {
            const dest = path.join(
              TRASH_DIR,
              path.basename(path.dirname(file)),
              path.basename(file),
            );
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.copyFileSync(file, dest);
            fs.unlinkSync(file);
            nctx.ui.notify(`已归档到回收站: ${dest}`, "info");
          } catch (e: any) {
            nctx.ui.notify(`归档失败: ${e.message}`, "error");
          }
        },
      });
    },
  });

  // /trashlist —— 列出回收站中的会话
  pi.registerCommand("trashlist", {
    description: "查看回收站中的会话",
    handler: async (_args, ctx) => {
      const items = listTrash();
      if (items.length === 0) {
        ctx.ui.notify("回收站是空的", "info");
        return;
      }
      items.sort((a, b) => a.dir.localeCompare(b.dir) || a.file.localeCompare(b.file));
      const lines = [
        `回收站共 ${items.length} 个会话:`,
        ...items.map((i) => `  [${i.dir}/${i.file}] ${fmtSize(i.size)}`),
        `恢复: /trashrestore    清空: /trashpurge`,
      ];
      ctx.ui.setWidget("trashlist", lines);
      ctx.ui.notify(`回收站共 ${items.length} 个会话（详见上方列表）`, "info");
    },
  });

  // /trashrestore —— 从回收站恢复某个会话
  pi.registerCommand("trashrestore", {
    description: "从回收站恢复一个会话",
    handler: async (_args, ctx) => {
      const items = listTrash();
      if (items.length === 0) {
        ctx.ui.notify("回收站是空的", "info");
        return;
      }
      items.sort((a, b) => a.dir.localeCompare(b.dir) || a.file.localeCompare(b.file));
      const labels = items.map((i) => `${i.dir}/${i.file}  (${fmtSize(i.size)})`);
      const choice = await ctx.ui.select("选择要恢复的会话:", labels);
      if (!choice) return;
      const idx = labels.indexOf(choice);
      if (idx < 0) return;
      const item = items[idx];
      const src = path.join(TRASH_DIR, item.dir, item.file);
      const sessionsRoot = path.join(os.homedir(), ".pi", "agent", "sessions");
      const dest = path.join(sessionsRoot, item.dir, item.file);
      try {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        fs.unlinkSync(src);
        // 若恢复后该目录只剩空文件夹则删掉
        const trashSub = path.join(TRASH_DIR, item.dir);
        if (fs.existsSync(trashSub) && fs.readdirSync(trashSub).length === 0) {
          fs.rmdirSync(trashSub);
        }
        ctx.ui.notify(`已恢复: ${dest}（可用 /resume 切换到该会话）`, "info");
      } catch (e: any) {
        ctx.ui.notify(`恢复失败: ${e.message}`, "error");
      }
    },
  });

  // /trashpurge —— 清空回收站（彻底删除）
  pi.registerCommand("trashpurge", {
    description: "清空回收站（彻底删除，不可恢复）",
    handler: async (_args, ctx) => {
      const items = listTrash();
      if (items.length === 0) {
        ctx.ui.notify("回收站是空的", "info");
        return;
      }
      const ok = await ctx.ui.confirm(
        "清空回收站",
        `将彻底删除 ${items.length} 个会话文件，不可恢复！`,
      );
      if (!ok) return;
      try {
        fs.rmSync(TRASH_DIR, { recursive: true, force: true });
        ctx.ui.notify("回收站已清空", "info");
      } catch (e: any) {
        ctx.ui.notify(`清空失败: ${e.message}`, "error");
      }
    },
  });
}
