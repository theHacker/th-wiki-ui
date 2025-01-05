import {Marked} from 'marked';
import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';
import mermaid from "mermaid";

const marked = new Marked();
const defaultRenderer = new marked.Renderer;

// used to generate different IDs so Mermaid CSS does not clash
// when there is multiple charts (rendered at the same time)
let mermaidIdCounter = 0;

// noinspection JSUnusedGlobalSymbols - walkTokens is called by Marked
const mermaidExtension = {
    async: true, // -> activate async mode, so we can call Mermaid which only works asynchronous
    useNewRenderer: true, // -> renderer gets token as object (with all/additional properties), instead of fixed parameters

    // Overwrite walkTokens. When we encounter a mermaid code block, render it.
    // Note: Usually you want to do that in the renderer, however, Marked.js does not support async renderer functions.
    // See https://github.com/markedjs/marked/issues/458 and https://github.com/markedjs/marked/pull/2474 for details.
    async walkTokens(token) {
        if (token.type === 'code') {
            const langString = (token.lang || '').match(/^\S*/)?.[0];
            if (langString === 'mermaid') {
                const svgId = 'mermaid-' + Date.now() + '-' + (++mermaidIdCounter);
                const renderResult = await mermaid.render(svgId, token.text);
                const {svg} = renderResult;

                token.mermaidSvg = svg;
            }
        }
    },
    renderer: {
        code(token) {
            if (token.mermaidSvg) {
                return token.mermaidSvg;
            }

            return defaultRenderer.code(token);
        }
    }
};
marked.use(mermaidExtension);

hljs.registerLanguage('markdown', markdown);

async function renderMarkdown(markdown) {
    return marked.parse(markdown); // TODO Warning: We don't have any protection against malicious HTML! See https://marked.js.org/#installation
}

function highlightMarkdown(markdown) {
    return hljs.highlight(markdown, { language: 'markdown' }).value;
}

export {renderMarkdown, highlightMarkdown};
