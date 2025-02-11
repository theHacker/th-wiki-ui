import {Marked} from 'marked';
import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';
import mermaidExtension from "./mermaid";
import hljsExtension from "./hljs";

const marked = new Marked();
marked.use(mermaidExtension);
marked.use(hljsExtension);

hljs.registerLanguage('markdown', markdown);

async function renderMarkdown(markdown) {
    return marked.parse(markdown); // TODO Warning: We don't have any protection against malicious HTML! See https://marked.js.org/#installation
}

function highlightMarkdown(markdown) {
    return hljs.highlight(markdown, { language: 'markdown' }).value;
}

export {renderMarkdown, highlightMarkdown};
