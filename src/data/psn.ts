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
	/** 完成度 0-100 */
	progress: number;
	earned: PsnTrophyCounts | null;
	lastPlayed: string | null;
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
