import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// Two independent deployments of the same service. They differ only in
// endpoint and credentials; everything else is identical.
interface Deployment {
	id: string;
	name: string;
	baseUrl: string;
	envVar: string;
}

const DEPLOYMENTS: Deployment[] = [
	{
		id: "xinshu",
		name: "Xinshu (mirror)",
		baseUrl: "https://mirror.xinshu.ai/v1",
		envVar: "XINSHU_API_KEY",
	},
	{
		id: "xinshu-gpt",
		name: "Xinshu (gpt)",
		baseUrl: "https://gpt.xinshu.ai/v1",
		envVar: "XINSHU_GPT_API_KEY",
	},
];

// Key resolution order: env var, then ~/.pi/agent/auth.json (what /login writes).
function resolveApiKey(dep: Deployment): string | undefined {
	if (process.env[dep.envVar]) return process.env[dep.envVar];
	try {
		const auth = JSON.parse(readFileSync(join(homedir(), ".pi", "agent", "auth.json"), "utf8"));
		const entry = auth[dep.id];
		if (typeof entry === "string") return entry;
		return entry?.key ?? entry?.apiKey ?? entry?.access;
	} catch {
		return undefined;
	}
}

// gpt-6-astra uses the same 1.05M context declaration as GPT-5.6 Sol.
function isGpt6Astra(id: string): boolean {
	return /^gpt-6-astra$/i.test(id);
}

// GPT-5 / o-series and gpt-6-astra support reasoning and vision.
function isReasoningModel(id: string): boolean {
	return isGpt6Astra(id) || /gpt-5|^o\d/i.test(id);
}

// GPT-5.6 Sol supports "max". Xinshu accepts gpt-6-astra through xhigh only.
function thinkingLevelMapFor(id: string): Record<string, string> {
	return /^gpt-5\.6-sol$/i.test(id)
		? { xhigh: "xhigh", max: "max" }
		: { xhigh: "xhigh" };
}

// Declare model-family context capacity without a provider-specific safety cap.
function contextWindowFor(id: string): number {
	if (isGpt6Astra(id) || /^gpt-5\.6(?:-|$)/i.test(id)) return 1050000;
	if (isReasoningModel(id)) return 400000;
	return 128000;
}

// Pi's agent loop needs tool-capable chat models; drop image-generation,
// realtime, audio, embedding and similar non-chat models from the list.
function isChatModel(id: string): boolean {
	return !/image|realtime|audio|tts|whisper|transcribe|embed|moderation/i.test(id);
}

async function registerDeployment(pi: ExtensionAPI, dep: Deployment): Promise<void> {
	const apiKey = resolveApiKey(dep);

	let models: Array<Record<string, unknown>> = [];
	if (apiKey) {
		try {
			const res = await fetch(`${dep.baseUrl}/models`, {
				headers: { Authorization: `Bearer ${apiKey}` },
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const payload = (await res.json()) as { data?: Array<{ id: string }> };
			models = (payload.data ?? []).filter((m) => isChatModel(m.id)).map((m) => ({
				id: m.id,
				name: m.id,
				reasoning: isReasoningModel(m.id),
				// xhigh/max are opt-in: declare only levels supported by the model.
				...(isReasoningModel(m.id) ? { thinkingLevelMap: thinkingLevelMapFor(m.id) } : {}),
				input: isReasoningModel(m.id) ? ["text", "image"] : ["text"],
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				contextWindow: contextWindowFor(m.id),
				maxTokens: isReasoningModel(m.id) ? 128000 : 16384,
			}));
		} catch {
			// Fetch failed (no network, bad key, ...) — register with an empty
			// model list instead of breaking startup.
		}
	}

	pi.registerProvider(dep.id, {
		name: dep.name,
		baseUrl: dep.baseUrl,
		...(apiKey ? { apiKey } : {}),
		api: "openai-responses",
		models,
	});
}

export default async function (pi: ExtensionAPI) {
	await Promise.all(DEPLOYMENTS.map((dep) => registerDeployment(pi, dep)));
}
