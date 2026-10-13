// 拉取 NeoDB「看过/读过/玩过」(complete)的全部标记，写入 src/data/neodb-marks.json。
// 失败软着陆：任何错误都保留现有 JSON；单个分类失败时沿用该分类的旧数据。
// 在 GitHub Actions 中失败会让任务变红（见 scripts/lib/data-file.mjs）。
// 用法：NEODB_API_TOKEN=xxx node scripts/fetch-neodb.mjs
//   NEODB_INSTANCE 可选，默认 https://neodb.social
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	failKeepingExisting,
	readExisting,
	reportError,
	writeIfChanged,
} from "./lib/data-file.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/neodb-marks.json");

const TOKEN = process.env.NEODB_API_TOKEN;
const INSTANCE = (process.env.NEODB_INSTANCE ?? "https://neodb.social").replace(/\/$/, "");
const SHELF = "complete";
const CATEGORIES = ["movie", "tv", "book", "music", "game", "podcast", "performance"];
const PAGE_DELAY_MS = 300; // 对社区实例友好一点，别猛刷
const MAX_PAGES = 300; // 安全阀，防止异常时死循环

const keepExisting = (reason) =>
	failKeepingExisting("neodb", OUT, { profile: null, total: 0, categories: [] }, reason);

if (!TOKEN) keepExisting("缺少 NEODB_API_TOKEN 环境变量");

const headers = { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url) {
	const res = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
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
	const previous = readExisting(OUT);
	const failures = [];

	let profile = previous?.profile ?? null;
	try {
		const me = await getJSON(`${INSTANCE}/api/me`);
		profile = { username: me.username, url: `${INSTANCE}/users/${me.username}/` };
	} catch (e) {
		console.warn(`[neodb] /api/me 失败：${e.message}（沿用旧资料）`);
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
			// 单个分类失败不影响其它分类，并沿用该分类上一次的数据，避免整类消失
			failures.push(cat);
			const old = previous?.categories?.find((c) => c.category === cat);
			if (old) {
				categories.push(old);
				total += old.items.length;
			}
			console.warn(`[neodb] 分类 ${cat} 拉取失败：${e.message}（${old ? "沿用旧数据" : "跳过"}）`);
		}
	}

	// 全军覆没时别用空数据覆盖好数据
	if (failures.length === CATEGORIES.length || total === 0) keepExisting("所有分类都没拉到数据");

	const changed = writeIfChanged(OUT, { profile, total, categories });
	console.log(
		changed
			? `[neodb] 写入 ${total} 条标记，覆盖 ${categories.length} 个分类`
			: `[neodb] 数据无变化（${total} 条），不改写文件`,
	);
	if (failures.length > 0) {
		reportError("neodb", `部分分类拉取失败：${failures.join(", ")}`);
		if (process.env.GITHUB_ACTIONS === "true") process.exit(1);
	}
} catch (err) {
	keepExisting(`拉取失败：${err.message}`);
}
