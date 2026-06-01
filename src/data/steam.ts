import steamData from "./steam-games.json";

export interface SteamGame {
	appid: number;
	name: string;
	/** 总游戏时长（分钟） */
	playtime: number;
}

export interface SteamRecentGame extends SteamGame {
	/** 最近两周时长（分钟） */
	playtime2Weeks: number;
}

export interface SteamProfile {
	name: string;
	url: string;
	avatar: string;
}

export interface SteamData {
	updatedAt: string | null;
	profile: SteamProfile | null;
	recent: SteamRecentGame[];
	games: SteamGame[];
}

export const steam = steamData as unknown as SteamData;

/** Steam 商店横版头图（460x215），所有游戏都有 */
export function steamHeader(appid: number): string {
	return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
}

/** 商店页链接 */
export function steamStoreUrl(appid: number): string {
	return `https://store.steampowered.com/app/${appid}`;
}

/** 分钟 → 可读时长 */
export function formatPlaytime(minutes: number): string {
	if (minutes === 0) return "未玩过";
	if (minutes < 60) return `${minutes} 分钟`;
	return `${(minutes / 60).toFixed(1)} 小时`;
}
