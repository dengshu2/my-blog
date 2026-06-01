// 拉取 NeoDB「看过/读过/玩过」(complete)的全部标记，写入 src/data/neodb-marks.json。
// 失败软着陆：任何错误都保留现有 JSON，绝不让构建崩。
// 用法：NEODB_API_TOKEN=xxx node scripts/fetch-neodb.mjs
//   NEODB_INSTANCE 可选，默认 https://neodb.social
import { existsSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/neodb-marks.json");

const TOKEN = process.env.NEODB_API_TOKEN;
const INSTANCE = (process.env.NEODB_INSTANCE ?? "https://neodb.social").replace(/\/$/, "");
const SHELF = "complete";
const CATEGORIES = ["movie", "tv", "book", "music", "game", "podcast", "performance"];
const PAGE_DELAY_MS = 300; // 对社区实例友好一点，别猛刷
const MAX_PAGES = 300; // 安全阀，防止异常时死循环

function keepExisting(reason) {
	if (existsSync(OUT)) {
		console.warn(`[neodb] ${reason} —— 保留现有数据文件`);
	} else {
		console.warn(`[neodb] ${reason} —— 无现有数据，写入空文件`);
		writeFileSync(
			OUT,
			`${JSON.stringify({ updatedAt: null, profile: null, total: 0, categories: [] }, null, "\t")}\n`,
		);
	}
	process.exit(0);
}

if (!TOKEN) keepExisting("缺少 NEODB_API_TOKEN 环境变量");

const headers = { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url) {
	const res = await fetch(url, { headers });
	if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url.replace(INSTANCE, "")}`);
	return res.json();
}

async function fetchCategory(category) {
	const items = [];
	let page = 1;
	let pages = 1;
	do {
		const data = await getJSON(
			`${INSTANCE}/api/me/shelf/${SHELF}?category=${category}&page=${page}`,
		);
		pages = data.pages ?? 1;
		for (const m of data.data ?? []) {
			const it = m.item ?? {};
			items.push({
				title: it.display_title || it.title || "(无题)",
				cover: it.cover_image_url || null,
				url: it.url ? INSTANCE + it.url : null,
				rating: m.rating_grade ?? null, // 你的评分，0-10，可能为 null
				markedAt: m.created_time ?? null,
			});
		}
		page += 1;
		if (page <= pages) await sleep(PAGE_DELAY_MS);
	} while (page <= pages && page <= MAX_PAGES);
	return items;
}

try {
	let profile = null;
	try {
		const me = await getJSON(`${INSTANCE}/api/me`);
		profile = { username: me.username, url: `${INSTANCE}/users/${me.username}/` };
	} catch (e) {
		console.warn(`[neodb] /api/me 失败：${e.message}`);
	}

	const categories = [];
	let total = 0;
	for (const cat of CATEGORIES) {
		try {
			const items = await fetchCategory(cat);
			if (items.length > 0) {
				items.sort((a, b) => (b.markedAt ?? "").localeCompare(a.markedAt ?? ""));
				categories.push({ category: cat, items });
				total += items.length;
				console.log(`[neodb] ${cat}: ${items.length} 条`);
			}
			await sleep(PAGE_DELAY_MS);
		} catch (e) {
			// 单个分类失败不影响其它分类
			console.warn(`[neodb] 分类 ${cat} 拉取失败：${e.message}（跳过）`);
		}
	}

	// 全军覆没时别用空数据覆盖好数据
	if (total === 0) keepExisting("所有分类都没拉到数据");

	writeFileSync(
		OUT,
		`${JSON.stringify({ updatedAt: new Date().toISOString(), profile, total, categories }, null, "\t")}\n`,
	);
	console.log(`[neodb] 写入 ${total} 条标记，覆盖 ${categories.length} 个分类`);
} catch (err) {
	keepExisting(`拉取失败：${err.message}`);
}
