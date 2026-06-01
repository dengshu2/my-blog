// 拉取 PSN 游玩记录（时长）+ 奖杯进度，写入 src/data/psn-games.json。
// 用 NPSSO 走 PSN 移动端 OAuth 流程换 access token（零依赖，原生 fetch）。
// 游戏列表以 gamelist（游玩时长）为主，按 trophyTitles 的完成度做补充（按游戏名匹配）。
// 失败软着陆：任何错误都保留现有 JSON。
// 用法：PSN_NPSSO=xxx node scripts/fetch-psn.mjs
import { existsSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/psn-games.json");

const NPSSO = process.env.PSN_NPSSO;

// PSN 官方移动端 App 的公开 OAuth 凭证（社区通用，psn-api 同款）
const CLIENT_ID = "09515159-7237-4370-9b40-3806e67c0891";
const CLIENT_SECRET = "ucPjka5tntB2KqsP";
const REDIRECT = "com.scee.psxandroid.scecompcall://redirect";
const SCOPE = "psn:mobile.v2.core psn:clientapp";
const AUTH_BASE = "https://ca.account.sony.com/api/authz/v3/oauth";
const API_BASE = "https://m.np.playstation.com/api";

const PLATFORM = {
	ps5_native_game: "PS5",
	ps4_game: "PS4",
	ps3_game: "PS3",
	ps_vita_game: "PS Vita",
};

function keepExisting(reason) {
	if (existsSync(OUT)) {
		console.warn(`[psn] ${reason} —— 保留现有数据文件`);
	} else {
		console.warn(`[psn] ${reason} —— 无现有数据，写入空文件`);
		writeFileSync(
			OUT,
			`${JSON.stringify({ updatedAt: null, summary: null, games: [] }, null, "\t")}\n`,
		);
	}
	process.exit(0);
}

if (!NPSSO) keepExisting("缺少 PSN_NPSSO 环境变量");

/** ISO 8601 时长（PT58H36M49S）-> 分钟 */
function durationToMinutes(iso) {
	const m = String(iso ?? "").match(/^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
	if (!m) return 0;
	const d = +(m[1] || 0);
	const h = +(m[2] || 0);
	const min = +(m[3] || 0);
	const s = +(m[4] || 0);
	return d * 1440 + h * 60 + min + Math.round(s / 60);
}

/** 归一化游戏名用于跨接口匹配 */
const norm = (s) => (s ?? "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

async function getAccessToken() {
	const authUrl = `${AUTH_BASE}/authorize?${new URLSearchParams({
		access_type: "offline",
		client_id: CLIENT_ID,
		redirect_uri: REDIRECT,
		response_type: "code",
		scope: SCOPE,
	})}`;
	const authRes = await fetch(authUrl, { redirect: "manual", headers: { Cookie: `npsso=${NPSSO}` } });
	const code = new URL(authRes.headers.get("location") || "").searchParams.get("code");
	if (!code) throw new Error("拿不到 authorization code（NPSSO 可能已过期）");

	const tokenRes = await fetch(`${AUTH_BASE}/token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
		},
		body: new URLSearchParams({
			code,
			redirect_uri: REDIRECT,
			grant_type: "authorization_code",
			token_format: "jwt",
		}),
	});
	if (!tokenRes.ok) throw new Error(`token 交换失败 HTTP ${tokenRes.status}`);
	const json = await tokenRes.json();
	if (!json.access_token) throw new Error("token 响应里没有 access_token");
	return json.access_token;
}

async function apiGet(token, path) {
	const res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
	if (!res.ok) throw new Error(`HTTP ${res.status} @ ${path}`);
	return res.json();
}

try {
	const token = await getAccessToken();

	// 奖杯总览（等级 + 各色奖杯数）
	let summary = null;
	try {
		const s = await apiGet(token, "/trophy/v1/users/me/trophySummary");
		summary = { trophyLevel: s.trophyLevel, earned: s.earnedTrophies };
	} catch (e) {
		console.warn(`[psn] trophySummary 失败：${e.message}`);
	}

	// 奖杯完成度，按归一化游戏名建索引（用来给 gamelist 补充进度）
	const trophyByName = new Map();
	try {
		let offset = 0;
		let total = Number.POSITIVE_INFINITY;
		while (offset < total) {
			const data = await apiGet(token, `/trophy/v1/users/me/trophyTitles?limit=100&offset=${offset}`);
			total = data.totalItemCount ?? 0;
			const batch = data.trophyTitles ?? [];
			for (const t of batch) {
				trophyByName.set(norm(t.trophyTitleName), {
					progress: t.progress ?? null,
					earned: t.earnedTrophies ?? null,
				});
			}
			if (batch.length === 0) break;
			offset += batch.length;
		}
	} catch (e) {
		console.warn(`[psn] trophyTitles 失败：${e.message}`);
	}

	// 游玩记录（含时长），作为主列表
	const games = [];
	let offset = 0;
	let total = Number.POSITIVE_INFINITY;
	while (offset < total) {
		const data = await apiGet(
			token,
			`/gamelist/v2/users/me/titles?categories=ps4_game,ps5_native_game&limit=100&offset=${offset}`,
		);
		total = data.totalItemCount ?? 0;
		const batch = data.titles ?? [];
		for (const t of batch) {
			const tr = trophyByName.get(norm(t.name));
			games.push({
				name: t.name,
				icon: t.imageUrl ?? null,
				platform: PLATFORM[t.category] ?? t.category ?? null,
				playtime: durationToMinutes(t.playDuration), // 分钟
				playCount: t.playCount ?? null,
				lastPlayed: t.lastPlayedDateTime ?? null,
				progress: tr?.progress ?? null, // 奖杯完成度，匹配不上为 null
				earned: tr?.earned ?? null,
			});
		}
		if (batch.length === 0) break;
		offset += batch.length;
	}

	if (games.length === 0) keepExisting("没拉到任何游玩记录");

	games.sort((a, b) => b.playtime - a.playtime); // 按游玩时长从多到少

	writeFileSync(
		OUT,
		`${JSON.stringify({ updatedAt: new Date().toISOString(), summary, games }, null, "\t")}\n`,
	);
	console.log(`[psn] 写入 ${games.length} 个游戏（按时长排序），奖杯等级 ${summary?.trophyLevel ?? "?"}`);
} catch (err) {
	keepExisting(`拉取失败：${err.message}`);
}
