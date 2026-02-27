/**
 * Remark plugin to transform mermaid code blocks into raw HTML
 * that Mermaid.js can render client-side.
 *
 * This runs BEFORE Expressive Code, so mermaid blocks won't get
 * syntax-highlighted. Instead they become <pre class="mermaid"> elements.
 */
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

export function remarkMermaid() {
    return (tree: Root) => {
        visit(tree, "code", (node, index, parent) => {
            if (node.lang !== "mermaid" || !parent || index === undefined) return;

            // Replace the code node with raw HTML that Mermaid.js will pick up
            parent.children[index] = {
                type: "html",
                value: `<pre class="mermaid">${escapeHtml(node.value)}</pre>`,
            };
        });
    };
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
