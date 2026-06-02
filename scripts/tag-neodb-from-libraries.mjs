// 用 Steam / PSN 的本地游戏库回标 NeoDB：把过门槛的游戏标为「玩过」并打平台 tag。
// 设计为一次性补全工具，但幂等 —— 之后游戏库新增了过门槛的作品，重跑可以增量补标。
//
// 安全约束：
//  - Token 只从 NEODB_API_TOKEN 环境变量读，绝不进入源码或日志输出
//  - 默认 dry-run，加 --write 才真写
//  - 对已有标记的游戏：先 GET 现有 mark，回写时合并 rating/comment/created_time/visibility，
//    只在 tags 上追加平台标签——避免清空你之前的评分和短评
//  - post_to_fediverse=false：不会广播 toot 给关注者
//
// 用法：
//   NEODB_API_TOKEN=xxx node scripts/tag-neodb-from-libraries.mjs            # 仅打印匹配结果
//   NEODB_API_TOKEN=xxx node scripts/tag-neodb-from-libraries.mjs --write    # 实际写入
//
// 可选环境变量：
//   NEODB_THRESHOLD_HOURS   覆盖默认 10 小时门槛
//   NEODB_INSTANCE          覆盖默认实例 https://neodb.social
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.NEODB_API_TOKEN;
const INSTANCE = (process.env.NEODB_INSTANCE ?? "https://neodb.social").replace(/\/$/, "");
const WRITE = process.argv.includes("--write");
const THRESHOLD_MIN = Math.round((Number(process.env.NEODB_THRESHOLD_HOURS) || 10) * 60);
const REQUEST_DELAY_MS = 400; // 对社区实例友好一点，别猛刷

if (!TOKEN) {
	console.error("缺少 NEODB_API_TOKEN 环境变量");
	process.exit(1);
}

// NeoDB 搜索会被 DLC/卡牌/豪华版/Steam 专版抢匹配的情况，按清洗后的游戏名直接钉住正确 UUID。
// 新增条目时：先 dry-run 跑一遍看哪些匹配不准，再把 NeoDB 上的"正确条目"UUID 添到这里。
const MANUAL_UUID = {
	Bloodborne: "71j3vfCt2RJQmq6paCxgkp", // 血源诅咒（vs Bloodborne: The Card Game）
	"Sekiro: Shadows Die Twice": "02J7FZX6SV4OqUpUuDlz6y", // 只狼：影逝二度（vs GOTY Edition）
	"Clair Obscur: Expedition 33": "1BUuAewL1tD5JUZ50wCA3U", // 光与影：33号远征队（vs Deluxe Edition）
	"Hollow Knight: Silksong": "1EZcXj3398L8TKZ4ELPIkW", // 空洞骑士：丝之歌
	"Ghost of Tsushima": "3IymED4gRtyqWO4Vw42zag", // 对马岛之魂（vanilla 条目，对齐你现有 NeoDB 风格）
};

const headers = { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 去掉 ™ ® "Legacy" "PS4™ & PS5™" 等噪声，方便搜索匹配 */
function cleanName(name) {
	return String(name)
		.replace(/[™®©]/g, "")
		.replace(/\s+PS4\s*&?\s*PS5\b.*$/i, "")
		.replace(/\s+Legacy\b/i, "")
		.replace(/\s+/g, " ")
		.trim();
}

async function getJSON(url) {
	const res = await fetch(url, { headers });
	if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url.replace(INSTANCE, "")}`);
	return res.json();
}

async function searchGame(query) {
	const url = `${INSTANCE}/api/catalog/search?query=${encodeURIComponent(query)}&category=game`;
	return (await getJSON(url)).data ?? [];
}

/** 标题归一化后等于 query 的优先，前缀匹配次之，最后兜底取第一条 */
const norm = (s) =>
	String(s ?? "")
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, "");
function pickMatch(results, query) {
	if (!results.length) return null;
	const q = norm(query);
	return (
		results.find((r) => norm(r.display_title ?? r.title) === q) ??
		results.find((r) => norm(r.display_title ?? r.title).startsWith(q)) ??
		results[0]
	);
}

function uuidFromUrl(url) {
	return String(url ?? "")
		.split("/")
		.filter(Boolean)
		.pop(); // "/game/{uuid}"
}

async function getExistingMark(uuid) {
	try {
		return await getJSON(`${INSTANCE}/api/me/shelf/item/${uuid}`);
	} catch (e) {
		if (String(e.message).includes("HTTP 404")) return null;
		throw e;
	}
}

async function postMark(uuid, body) {
	const res = await fetch(`${INSTANCE}/api/me/shelf/item/${uuid}`, {
		method: "POST",
		headers: { ...headers, "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(`POST ${uuid} HTTP ${res.status}: ${await res.text()}`);
	return res.json();
}

// ---- 准备候选列表 ----
const steamJson = JSON.parse(
	readFileSync(resolve(__dirname, "../src/data/steam-games.json"), "utf8"),
);
const psnJson = JSON.parse(readFileSync(resolve(__dirname, "../src/data/psn-games.json"), "utf8"));

const candidates = [
	...steamJson.games
		.filter((g) => g.playtime >= THRESHOLD_MIN)
		.map((g) => ({
			source: "Steam",
			tag: "Steam",
			name: g.name,
			hours: Math.floor(g.playtime / 60),
		})),
	...psnJson.games
		.filter((g) => g.playtime >= THRESHOLD_MIN)
		.map((g) => ({
			source: `PSN/${g.platform}`,
			tag: "PlayStation",
			name: g.name,
			hours: Math.floor(g.playtime / 60),
		})),
];

console.log(
	`\n模式: ${WRITE ? "WRITE（会写入 NeoDB）" : "DRY-RUN（仅打印）"}    候选 ${candidates.length} 款（≥${THRESHOLD_MIN / 60}h）\n`,
);

const planned = [];
const failed = [];

for (const c of candidates) {
	const q = cleanName(c.name);
	let match = null;
	let uuid = MANUAL_UUID[q];
	if (uuid) {
		try {
			const item = await getJSON(`${INSTANCE}/api/game/${uuid}`);
			match = { display_title: item.display_title ?? item.title, url: `/game/${uuid}` };
		} catch (e) {
			failed.push({ ...c, query: q, reason: `手动 UUID 取条目失败 ${e.message}` });
			continue;
		}
	} else {
		try {
			match = pickMatch(await searchGame(q), q);
		} catch (e) {
			failed.push({ ...c, query: q, reason: `搜索失败 ${e.message}` });
			continue;
		}
		if (!match) {
			failed.push({ ...c, query: q, reason: "无搜索结果" });
			continue;
		}
		uuid = uuidFromUrl(match.url);
	}
	const existing = await getExistingMark(uuid).catch(() => null);
	planned.push({
		...c,
		query: q,
		matchTitle: match.display_title ?? match.title,
		matchUrl: INSTANCE + match.url,
		uuid,
		existing,
	});
	await sleep(REQUEST_DELAY_MS);
}

// ---- 打印计划 ----
console.log("=== 匹配结果 ===\n");
for (const p of planned) {
	const existedNote = p.existing
		? `已有标记 shelf=${p.existing.shelf_type} rating=${p.existing.rating_grade ?? "_"} tags=[${(p.existing.tags ?? []).join(",")}]`
		: "新建标记";
	console.log(
		`[${p.hours}h ${p.source}] ${p.name}`,
		`\n  → ${p.matchTitle}  ${p.matchUrl}`,
		`\n  → ${existedNote}  + 将追加 tag: ${p.tag}\n`,
	);
}

if (failed.length) {
	console.log("=== 失败/匹配不到（需人工处理） ===\n");
	for (const f of failed)
		console.log(`[${f.hours}h ${f.source}] ${f.name}  (查询=${f.query})  ${f.reason}`);
	console.log();
}

if (!WRITE) {
	console.log("DRY-RUN 完毕。审完上表后加 --write 真正写入。");
	process.exit(0);
}

// ---- 真正写入 ----
console.log("=== 开始写入 ===\n");
let okCount = 0;
const writeErrors = [];
for (const p of planned) {
	const existingTags = p.existing?.tags ?? [];
	const mergedTags = existingTags.includes(p.tag) ? existingTags : [...existingTags, p.tag];
	const body = {
		shelf_type: p.existing?.shelf_type ?? "complete",
		visibility: p.existing?.visibility ?? 0,
		comment_text: p.existing?.comment_text ?? "",
		rating_grade: p.existing?.rating_grade ?? 0,
		tags: mergedTags,
		post_to_fediverse: false, // 不广播 toot 给关注者
	};
	if (p.existing?.created_time) body.created_time = p.existing.created_time;
	try {
		await postMark(p.uuid, body);
		okCount += 1;
		console.log(`✓ ${p.name}  (tag=[${mergedTags.join(",")}])`);
	} catch (e) {
		writeErrors.push({ name: p.name, reason: e.message });
		console.log(`✗ ${p.name}  ${e.message}`);
	}
	await sleep(REQUEST_DELAY_MS);
}

console.log(`\n写入完成：${okCount}/${planned.length} 成功`);
if (writeErrors.length) {
	console.log("写入失败：");
	for (const e of writeErrors) console.log(`  - ${e.name}: ${e.reason}`);
}
