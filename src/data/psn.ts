import psnData from "./psn-games.json";

export interface PsnTrophyCounts {
	bronze: number;
	silver: number;
	gold: number;
	platinum: number;
}

export interface PsnGame {
	name: string;
	icon: string | null;
	platform: string | null;
	/** 游玩时长（分钟） */
	playtime: number;
	/** 游玩次数 */
	playCount: number | null;
	lastPlayed: string | null;
	/** 奖杯完成度 0-100，匹配不上为 null */
	progress: number | null;
	earned: PsnTrophyCounts | null;
}

export interface PsnSummary {
	trophyLevel: number;
	earned: PsnTrophyCounts;
}

export interface PsnData {
	updatedAt: string | null;
	summary: PsnSummary | null;
	games: PsnGame[];
}

export const psn = psnData as unknown as PsnData;
