// 拉取 PSN 奖杯数据（游戏列表 + 奖杯等级），写入 src/data/psn-games.json。
// 用 NPSSO 走 PSN 移动端 OAuth 流程换 access token（零依赖，原生 fetch）。
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

async function getAccessToken() {
	// 1. NPSSO -> authorization code（302 重定向，code 藏在 Location 里）
	const authUrl = `${AUTH_BASE}/authorize?${new URLSearchParams({
		access_type: "offline",
		client_id: CLIENT_ID,
		redirect_uri: REDIRECT,
		response_type: "code",
		scope: SCOPE,
	})}`;
	const authRes = await fetch(authUrl, {
		redirect: "manual",
		headers: { Cookie: `npsso=${NPSSO}` },
	});
	const location = authRes.headers.get("location") || "";
	const code = new URL(location).searchParams.get("code");
	if (!code) throw new Error("拿不到 authorization code（NPSSO 可能已过期）");

	// 2. code -> access token
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

	// 奖杯游戏列表（分页，每页 100）
	const games = [];
	let offset = 0;
	let total = Number.POSITIVE_INFINITY;
	while (offset < total) {
		const data = await apiGet(token, `/trophy/v1/users/me/trophyTitles?limit=100&offset=${offset}`);
		total = data.totalItemCount ?? 0;
		const batch = data.trophyTitles ?? [];
		for (const t of batch) {
			games.push({
				name: t.trophyTitleName,
				icon: t.trophyTitleIconUrl ?? null,
				platform: t.trophyTitlePlatform ?? null,
				progress: t.progress ?? 0, // 完成度 0-100
				earned: t.earnedTrophies ?? null,
				lastPlayed: t.lastUpdatedDateTime ?? null,
			});
		}
		if (batch.length === 0) break;
		offset += batch.length;
	}

	if (games.length === 0) keepExisting("没拉到任何奖杯游戏");

	games.sort((a, b) => (b.lastPlayed ?? "").localeCompare(a.lastPlayed ?? ""));

	writeFileSync(
		OUT,
		`${JSON.stringify({ updatedAt: new Date().toISOString(), summary, games }, null, "\t")}\n`,
	);
	console.log(`[psn] 写入 ${games.length} 个游戏，奖杯等级 ${summary?.trophyLevel ?? "?"}`);
} catch (err) {
	keepExisting(`拉取失败：${err.message}`);
}
