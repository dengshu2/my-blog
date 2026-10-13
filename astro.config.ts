import fs from "node:fs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import webmanifest from "astro-webmanifest";
import { defineConfig } from "astro/config";
import { expressiveCodeOptions } from "./src/site.config";
import { siteConfig } from "./src/site.config";

// Remark plugins
import { unified } from "@astrojs/markdown-remark";
import remarkDirective from "remark-directive"; /* Handle ::: directives as nodes */
import { remarkAdmonitions } from "./src/plugins/remark-admonitions"; /* Add admonitions */
import { remarkMermaid } from "./src/plugins/remark-mermaid"; /* Convert mermaid blocks to raw HTML */
import { remarkReadingTime } from "./src/plugins/remark-reading-time";

// Rehype plugins
import rehypeExternalLinks from "rehype-external-links";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { rehypeLazyImages } from "./src/plugins/rehype-lazy-images";

/** 从文章 frontmatter 读取 updatedDate / publishDate，作为站点地图的 lastmod */
function readPostDates(dir: string) {
	const dates = new Map<string, string>();
	for (const file of fs.readdirSync(dir)) {
		if (!/\.mdx?$/.test(file)) continue;
		const frontmatter = fs.readFileSync(`${dir}/${file}`, "utf8").split(/^---$/m)[1] ?? "";
		const field = (name: string) =>
			frontmatter.match(new RegExp(`^${name}:\\s*["']?([^"'\\n]+)`, "m"))?.[1];
		const date = field("updatedDate") ?? field("publishDate");
		if (date) dates.set(`/posts/${file.replace(/\.mdx?$/, "")}/`, new Date(date).toISOString());
	}
	return dates;
}
const postLastModified = readPostDates("./src/content/post");

// https://astro.build/config
export default defineConfig({
	// Astro 7 默认值改为 "jsx"（剥离行内元素间空格），保持 v6 行为
	compressHTML: true,
	image: {
		// 文章里的图床图片在构建时下载并转成 WebP、补上宽高，部署在本站 /_astro/ 下长期缓存
		domains: ["img.runningotter.com"],
	},
	integrations: [
		expressiveCode(expressiveCodeOptions),
		icon(),

		sitemap({
			// 标签页内容单薄，不进站点地图
			filter: (page) => !new URL(page).pathname.startsWith("/tags/"),
			serialize(item) {
				const lastmod = postLastModified.get(new URL(item.url).pathname);
				return lastmod ? { ...item, lastmod } : item;
			},
		}),
		mdx(),
		robotsTxt(),
		webmanifest({
			// See: https://github.com/alextim/astro-lib/blob/main/packages/astro-webmanifest/README.md
			/**
			 * required
			 **/
			name: siteConfig.title,
			/**
			 * optional
			 **/
			// short_name: "Astro_Cactus",
			description: siteConfig.description,
			lang: siteConfig.lang,
			icon: "public/icon.svg", // the source for generating favicon & icons
			icons: [
				{
					src: "icons/apple-touch-icon.png", // used in src/components/BaseHead.astro L:26
					sizes: "180x180",
					type: "image/png",
				},
				{
					src: "icons/icon-192.png",
					sizes: "192x192",
					type: "image/png",
				},
				{
					src: "icons/icon-512.png",
					sizes: "512x512",
					type: "image/png",
				},
			],
			start_url: "/",
			background_color: "#1d1f21",
			theme_color: "#2bbc8a",
			display: "standalone",
			config: {
				insertFaviconLinks: false,
				insertThemeColorMeta: false,
				insertManifestLink: false,
			},
		}),
	],
	markdown: {
		// Astro 7 默认改用原生 Sätteri 管线；本站的自定义插件依赖 remark/rehype，
		// 显式指定 unified 处理器并把插件交给它，保留原有 Markdown 行为
		processor: unified({
			rehypePlugins: [
				[
					rehypeExternalLinks,
					{
						rel: ["nofollow", "noreferrer"],
						target: "_blank",
					},
				],
				rehypeUnwrapImages,
				rehypeLazyImages,
			],
			remarkPlugins: [remarkMermaid, remarkReadingTime, remarkDirective, remarkAdmonitions],
			remarkRehype: {
				footnoteLabelProperties: {
					className: [""],
				},
			},
		}),
	},
	// https://docs.astro.build/en/guides/prefetch/
	prefetch: true,
	// ! Please remember to replace the following site property with your own domain
	site: "https://blog.runningotter.com/",
	vite: {
		build: {
			// Mermaid 核心块约 660 KB，只在含图表的文章里按需加载，不必每次构建都告警
			chunkSizeWarningLimit: 700,
		},
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
		plugins: [tailwindcss(), rawFonts([".ttf", ".woff"])],
	},
});

function rawFonts(ext: string[]) {
	return {
		name: "vite-plugin-raw-fonts",
		// @ts-expect-error:next-line
		transform(_, id) {
			if (ext.some((e) => id.endsWith(e))) {
				const buffer = fs.readFileSync(id);
				return {
					code: `export default ${JSON.stringify(buffer)}`,
					map: null,
				};
			}
		},
	};
}
