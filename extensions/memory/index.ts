import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const MAX_MEMORY_BYTES = 32 * 1024;

function expandHome(path: string): string {
	if (path === "~") return homedir();
	if (path.startsWith("~/") || path.startsWith("~\\")) {
		return join(homedir(), path.slice(2));
	}
	return path;
}

function getAgentDir(): string {
	const configured = process.env.PI_CODING_AGENT_DIR?.trim();
	return configured ? resolve(expandHome(configured)) : join(homedir(), ".pi", "agent");
}

// 记忆文件与本扩展同目录（memory/manual-memory.md）；
// 若同目录没有而旧位置（agent 根目录）有，则回退旧位置，保证平滑迁移。
function getExtensionDir(): string {
	try {
		return dirname(fileURLToPath(import.meta.url));
	} catch {
		try {
			// eslint-disable-next-line no-undef
			return __dirname;
		} catch {
			return process.cwd();
		}
	}
}

const here = join(getExtensionDir(), "manual-memory.md");
const legacy = join(getAgentDir(), "manual-memory.md");
const memoryFile = existsSync(here) ? here : legacy;

function normalizeMemory(content: string): string {
	const trimmed = content.trim();
	return trimmed ? `${trimmed}\n` : "";
}

async function loadMemory(): Promise<string> {
	try {
		return normalizeMemory(await readFile(memoryFile, "utf8"));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return "";
		throw error;
	}
}

async function saveMemory(content: string): Promise<void> {
	const normalized = normalizeMemory(content);
	const bytes = Buffer.byteLength(normalized, "utf8");
	if (bytes > MAX_MEMORY_BYTES) {
		throw new Error(`Memory is ${bytes} bytes; the limit is ${MAX_MEMORY_BYTES} bytes.`);
	}

	await mkdir(dirname(memoryFile), { recursive: true });
	await writeFile(memoryFile, normalized, { encoding: "utf8", mode: 0o600 });
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export default function manualMemoryExtension(pi: ExtensionAPI) {
	pi.registerCommand("memory", {
		description: "Edit manually maintained long-term preferences｜编辑手工维护的长期偏好",
		handler: async (_args, ctx) => {
			if (!ctx.hasUI) {
				ctx.ui.notify(`Manual memory file: ${memoryFile}`, "info");
				return;
			}

			try {
				const current = await loadMemory();
				const edited = await ctx.ui.editor("Manual long-term memory", current);
				if (edited === undefined) return;

				const normalized = normalizeMemory(edited);
				if (normalized === current) {
					ctx.ui.notify("Memory unchanged", "info");
					return;
				}

				await saveMemory(normalized);
				ctx.ui.notify(normalized ? "Long-term memory saved" : "Long-term memory cleared", "info");
			} catch (error) {
				ctx.ui.notify(`Could not save memory: ${errorMessage(error)}`, "error");
			}
		},
	});

	pi.registerCommand("remember", {
		description: "Append one manually supplied long-term preference｜追加一条长期偏好",
		handler: async (args, ctx) => {
			const preference = args.trim();
			if (!preference) {
				ctx.ui.notify("Usage: /remember <preference>", "warning");
				return;
			}

			try {
				const current = await loadMemory();
				const entry = `- ${preference.replace(/\r?\n/g, "\n  ")}`;
				const next = current ? `${current.trimEnd()}\n${entry}` : entry;
				await saveMemory(next);
				ctx.ui.notify("Preference saved", "info");
			} catch (error) {
				ctx.ui.notify(`Could not save preference: ${errorMessage(error)}`, "error");
			}
		},
	});

	pi.on("before_agent_start", async (event, ctx) => {
		try {
			const memory = await loadMemory();
			if (!memory) return;

			return {
				systemPrompt: `${event.systemPrompt}\n\n## Manual Long-Term Memory\n\nThe following preferences were explicitly maintained by the user. Follow them when relevant. Do not add, remove, or rewrite these memories yourself.\n\n${memory.trimEnd()}\n`,
			};
		} catch (error) {
			ctx.ui.notify(`Could not load long-term memory: ${errorMessage(error)}`, "error");
		}
	});
}
