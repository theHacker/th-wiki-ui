import {Marked} from 'marked';
import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';

const marked = new Marked();

hljs.registerLanguage('markdown', markdown);

function renderMarkdown(markdown) {
    return marked.parse(markdown); // TODO Warning: We don't have any protection against malicious HTML! See https://marked.js.org/#installation
}

function highlightMarkdown(markdown) {
    return hljs.highlight(markdown, { language: 'markdown' }).value;
}

export {renderMarkdown, highlightMarkdown};
