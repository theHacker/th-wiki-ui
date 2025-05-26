import {Marked} from 'marked';
import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';
import mermaidExtension from "./mermaid";
import hljsExtension from "./hljs";
import createReplacingLinksExtension from "./replaceLinks";
import axios from "@/axios.js";

hljs.registerLanguage('markdown', markdown);

async function renderMarkdown(markdown) {
    const marked = new Marked();
    marked.use(mermaidExtension);
    marked.use(hljsExtension);

    return marked.parse(markdown); // TODO Warning: We don't have any protection against malicious HTML! See https://marked.js.org/#installation
}

async function renderMarkdownAndReplaceIssueLinks(markdown) {
    const allProjects = await axios
        .graphql(`
            query AllProjectsWithPrefixes {
                projects {
                    prefix
                    nextIssueNumber
                }
            }
        `)
        .then(data => data.projects);

    const marked = new Marked();
    marked.use(mermaidExtension);
    marked.use(hljsExtension);
    marked.use(createReplacingLinksExtension(allProjects));

    return marked.parse(markdown); // TODO Warning: We don't have any protection against malicious HTML! See https://marked.js.org/#installation
}

function highlightMarkdown(markdown) {
    return hljs.highlight(markdown, { language: 'markdown' }).value;
}

export {renderMarkdown, renderMarkdownAndReplaceIssueLinks, highlightMarkdown};
