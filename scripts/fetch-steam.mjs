// 拉取 Steam 游戏库与最近在玩，写入 src/data/steam-games.json。
// 设计为「失败软着陆」：任何错误都保留现有 JSON，绝不让构建崩。
// 用法：STEAM_API_KEY=xxx node scripts/fetch-steam.mjs
//   STEAM_ID 可选，默认用下方常量（SteamID 本就是公开信息）。
import { existsSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/steam-games.json");

const KEY = process.env.STEAM_API_KEY;
const STEAM_ID = process.env.STEAM_ID ?? "76561199023045394";
const BASE = "https://api.steampowered.com";

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
	const res = await fetch(url);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
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

	const player = summary?.response?.players?.[0];
	const data = {
		updatedAt: new Date().toISOString(),
		profile: player
			? { name: player.personaname, url: player.profileurl, avatar: player.avatarfull }
			: null,
		recent: (recent?.response?.games ?? []).map((g) => ({
			appid: g.appid,
			name: g.name,
			playtime2Weeks: g.playtime_2weeks,
			playtime: g.playtime_forever,
		})),
		games,
	};

	writeFileSync(OUT, `${JSON.stringify(data, null, "\t")}\n`);
	console.log(`[steam] 写入 ${games.length} 款游戏，最近在玩 ${data.recent.length} 款`);
} catch (err) {
	keepExisting(`拉取失败：${err.message}`);
}
