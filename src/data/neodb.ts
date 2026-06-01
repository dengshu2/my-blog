import neodbData from "./neodb-marks.json";

export interface NeodbMark {
	title: string;
	cover: string | null;
	url: string | null;
	/** 你的评分，0-10，可能为 null */
	rating: number | null;
	markedAt: string | null;
}

export interface NeodbCategory {
	category: string;
	items: NeodbMark[];
}

export interface NeodbProfile {
	username: string;
	url: string;
}

export interface NeodbData {
	updatedAt: string | null;
	profile: NeodbProfile | null;
	total: number;
	categories: NeodbCategory[];
}

export const neodb = neodbData as unknown as NeodbData;

const CATEGORY_LABELS: Record<string, string> = {
	movie: "电影",
	tv: "剧集",
	book: "书",
	music: "音乐",
	game: "游戏",
	podcast: "播客",
	performance: "演出",
};

const CATEGORY_ORDER = ["movie", "tv", "book", "music", "game", "podcast", "performance"];

export function categoryLabel(cat: string): string {
	return CATEGORY_LABELS[cat] ?? cat;
}

/** 按预定顺序返回有数据的分类 */
export function orderedCategories(): NeodbCategory[] {
	return [...neodb.categories].sort(
		(a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
	);
}
