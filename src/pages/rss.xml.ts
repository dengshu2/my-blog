import { getAllPosts, sortMDByDate } from "@/data/post";
import { siteConfig } from "@/site-config";
import rss from "@astrojs/rss";

export const GET = async () => {
	const posts = await getAllPosts();
	const sortedPosts = sortMDByDate(posts);

	return rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,

		// 添加自定义元数据
		customData: `<language>${siteConfig.lang}</language>
		<copyright>Copyright ${new Date().getFullYear()} ${siteConfig.author}</copyright>
		<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,

		items: await Promise.all(
			sortedPosts.map(async (post) => {
				return {
					title: post.data.title,
					description: post.data.description,
					pubDate: post.data.publishDate,
					link: `posts/${post.slug}`,

					// 添加作者
					author: siteConfig.author,

					// 添加分类（使用标签）
					categories: post.data.tags,

					// 添加完整文章内容
					content: post.body,

					// 添加更新日期（如果存在）
					...(post.data.updatedDate && {
						customData: `<atom:updated>${post.data.updatedDate.toISOString()}</atom:updated>`,
					}),
				};
			})
		),

		// 添加 Atom 命名空间（用于更新日期）
		xmlns: {
			atom: "http://www.w3.org/2005/Atom",
		},
	});
};
