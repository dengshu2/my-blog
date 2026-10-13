export interface SiteConfig {
	author: string;
	date: {
		locale: string | string[] | undefined;
		options: Intl.DateTimeFormatOptions;
	};
	description: string;
	lang: string;
	ogLocale: string;
	sortPostsByUpdatedDate: boolean;
	title: string;
}

export interface PaginationLink {
	srLabel?: string;
	text?: string;
	url: string;
}

export interface SiteMeta {
	/** 文章发布时间（ISO），有值时按文章页输出 og/JSON-LD */
	articleDate?: string | undefined;
	/** 文章更新时间（ISO） */
	articleModified?: string | undefined;
	/** 不希望被搜索引擎收录的页面（如 404） */
	noindex?: boolean;
	description?: string;
	ogImage?: string | undefined;
	title: string;
}

export type AdmonitionType = "tip" | "note" | "important" | "caution" | "warning";
