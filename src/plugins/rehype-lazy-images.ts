import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";

// 文章正文里的图片（多为图床上的大图）默认懒加载、异步解码，
// 已显式设置 loading 的图片保持原样
export function rehypeLazyImages() {
	return (tree: Root) => {
		visit(tree, "element", (node: Element) => {
			if (node.tagName !== "img") return;
			node.properties.loading ??= "lazy";
			node.properties.decoding ??= "async";
		});
	};
}
