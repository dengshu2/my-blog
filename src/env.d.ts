/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare module "@pagefind/default-ui" {
	declare class PagefindUI {
		constructor(arg: unknown);
	}
}

interface ImportMetaEnv {
	readonly PUBLIC_NAVIDROME_SHARE_ID?: string;
	readonly PUBLIC_NAVIDROME_URL?: string;
	readonly WEBMENTION_API_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
