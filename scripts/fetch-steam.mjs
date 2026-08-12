// 拉取 Steam 游戏库与最近在玩，写入 src/data/steam-games.json。
// 设计为「失败软着陆」：任何错误都保留现有 JSON，绝不让构建崩。
// 用法：STEAM_API_KEY=xxx node scripts/fetch-steam.mjs
//   STEAM_ID 可选，默认用下方常量（SteamID 本就是公开信息）。
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/steam-games.json");

const KEY = process.env.STEAM_API_KEY;
const STEAM_ID = process.env.STEAM_ID ?? "76561199023045394";
const BASE = "https://api.steampowered.com";
const STORE_BASE = "https://store.steampowered.com/api/appdetails";
const STORE_CONCURRENCY = 4;

/** 失败时保留旧数据；若无旧数据则写入空结构。始终以 0 退出，不阻断构建。 */
function keepExisting(reason) {
	if (existsSync(OUT)) {
		console.warn(`[steam] ${reason} —— 保留现有数据文件`);
	} else {
		console.warn(`[steam] ${reason} —— 无现有数据，写入空文件`);
		writeFileSync(
			OUT,
			`${JSON.stringify({ updatedAt: null, profile: null, recent: [], games: [] }, null, "\t")}\n`,
		);
	}
	process.exit(0);
}

if (!KEY) keepExisting("缺少 STEAM_API_KEY 环境变量");

async function getJSON(url) {
	const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}

/** 在不压垮 Steam Store API 的前提下并发处理游戏。 */
async function mapConcurrent(items, concurrency, mapper) {
	const results = new Array(items.length);
	let nextIndex = 0;

	async function worker() {
		while (nextIndex < items.length) {
			const index = nextIndex++;
			results[index] = await mapper(items[index]);
		}
	}

	await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
	return results;
}

/**
 * 新版 Steam 商店素材可能位于带哈希的目录，不能再只靠 appid 拼出地址。
 * 单款游戏查询失败时沿用上一次的地址，让偶发限流不影响整批数据刷新。
 */
async function fetchHeaderImages(appids) {
	let previous = {};
	if (existsSync(OUT)) {
		try {
			previous = JSON.parse(readFileSync(OUT, "utf8"));
		} catch {
			console.warn("[steam] 现有数据无法解析，封面地址将不使用缓存");
		}
	}

	const previousHeaders = new Map(
		[...(previous.games ?? []), ...(previous.recent ?? [])]
			.filter((game) => game.headerImage)
			.map((game) => [game.appid, game.headerImage]),
	);
	let fallbackCount = 0;

	const entries = await mapConcurrent(appids, STORE_CONCURRENCY, async (appid) => {
		try {
			const json = await getJSON(`${STORE_BASE}?appids=${appid}&filters=basic`);
			const headerImage = json?.[appid]?.data?.header_image;
			if (typeof headerImage === "string" && headerImage.startsWith("https://")) {
				return [appid, headerImage];
			}
		} catch {
			// 下面统一回退并汇总警告，避免一次刷新输出几十条错误。
		}

		fallbackCount++;
		return [appid, previousHeaders.get(appid)];
	});

	if (fallbackCount > 0) {
		console.warn(`[steam] ${fallbackCount} 款游戏未获取到新封面，使用缓存或旧版地址`);
	}

	return new Map(entries.filter(([, headerImage]) => headerImage));
}

try {
	const [summary, owned, recent] = await Promise.all([
		getJSON(`${BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${KEY}&steamids=${STEAM_ID}`),
		getJSON(
			`${BASE}/IPlayerService/GetOwnedGames/v1/?key=${KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=true&format=json`,
		),
		getJSON(`${BASE}/IPlayerService/GetRecentlyPlayedGames/v1/?key=${KEY}&steamid=${STEAM_ID}`),
	]);

	const games = (owned?.response?.games ?? [])
		.map((g) => ({ appid: g.appid, name: g.name, playtime: g.playtime_forever }))
		.sort((a, b) => b.playtime - a.playtime);

	// 资料设为私密时 GetOwnedGames 会返回空——此时别用空数据覆盖好数据
	if (games.length === 0) keepExisting("GetOwnedGames 返回空（资料是否设为私密？）");

	const recentGames = (recent?.response?.games ?? []).map((g) => ({
		appid: g.appid,
		name: g.name,
		playtime2Weeks: g.playtime_2weeks,
		playtime: g.playtime_forever,
	}));
	const appids = [...new Set([...games, ...recentGames].map((game) => game.appid))];
	const headerImages = await fetchHeaderImages(appids);
	const withHeaderImage = (game) => ({
		...game,
		...(headerImages.get(game.appid) ? { headerImage: headerImages.get(game.appid) } : {}),
	});

	const player = summary?.response?.players?.[0];
	const data = {
		updatedAt: new Date().toISOString(),
		profile: player
			? { name: player.personaname, url: player.profileurl, avatar: player.avatarfull }
			: null,
		recent: recentGames.map(withHeaderImage),
		games: games.map(withHeaderImage),
	};

	writeFileSync(OUT, `${JSON.stringify(data, null, "\t")}\n`);
	console.log(`[steam] 写入 ${games.length} 款游戏，最近在玩 ${data.recent.length} 款`);
} catch (err) {
	keepExisting(`拉取失败：${err.message}`);
}
