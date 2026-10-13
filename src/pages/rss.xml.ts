import { getAllPosts, sortMDByDate } from "@/data/post";
import { siteConfig } from "@/site-config";
import rss from "@astrojs/rss";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { render } from "astro:content";

const site = import.meta.env.SITE;

/** 把正文里的站内相对地址（/_astro/... 图片、/posts/... 链接）改成绝对地址，阅读器里才能打开 */
function absolutizeUrls(html: string) {
	return html.replace(/(\s(?:src|href|srcset)=")(\/(?!\/)[^"]*)"/g, (_, attr, path) => {
		return `${attr}${new URL(path, site).href}"`;
	});
}

export const GET = async () => {
	const posts = await getAllPosts();
	const sortedPosts = sortMDByDate(posts);
	// 用 Astro 自己渲染正文，和网页走同一套 remark/rehype 插件（提示框、图片、Mermaid 等）
	const container = await AstroContainer.create();

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site,

		customData: `<language>${siteConfig.lang}</language>
		<copyright>Copyright ${new Date().getFullYear()} ${siteConfig.author}</copyright>
		<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
		<atom:link href="${new URL("rss.xml", site).href}" rel="self" type="application/rss+xml" />`,

		items: await Promise.all(
			sortedPosts.map(async (post) => {
				const { Content } = await render(post);
				const html = absolutizeUrls(await container.renderToString(Content));

				return {
					title: post.data.title,
					description: post.data.description,
					pubDate: post.data.publishDate,
					link: `posts/${post.id}/`,
					// RSS 2.0 的 <author> 要求是邮箱，作者名放 dc:creator
					customData: [
						`<dc:creator><![CDATA[${siteConfig.author}]]></dc:creator>`,
						post.data.updatedDate &&
							`<atom:updated>${post.data.updatedDate.toISOString()}</atom:updated>`,
					]
						.filter(Boolean)
						.join(""),
					categories: post.data.tags,
					content: html,
				};
			}),
		),

		xmlns: {
			atom: "http://www.w3.org/2005/Atom",
			dc: "http://purl.org/dc/elements/1.1/",
		},
	});
};
