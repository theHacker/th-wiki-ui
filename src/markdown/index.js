import {Marked} from 'marked';
import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';
import mermaidExtension from "./mermaid";
import hljsExtension from "./hljs";
import axios from "@/axios.js";

hljs.registerLanguage('markdown', markdown);

async function renderMarkdown(markdown) {
    const marked = new Marked();
    marked.use(mermaidExtension);
    marked.use(hljsExtension);

    return marked.parse(markdown); // TODO Warning: We don't have any protection against malicious HTML! See https://marked.js.org/#installation
}

/**
 * Renders markdown, finds all valid issue keys in the text,
 * and replaces it each with a link and tooltip.
 *
 * This function needs two API requests (all project prefixes, found issues),
 * and will parse the markdown twice.
 *
 * @param {string} markdown Markdown
 * @returns {Promise<string>} Rendered Markdown as HTML code
 */
async function renderMarkdownAndReplaceIssueLinks(markdown) {
    // First find all project prefixes

    const allProjects = await axios
        .graphql(`
            query AllProjectsWithPrefixes {
                projects {
                    prefix
                }
            }
        `)
        .then(data => data.projects);

    // First pass:
    // Tokenize the markdown.
    // We use the renderer to walk the token tree recursively without the need to re-implement that.

    const issueKeys = [];

    const marked1 = new Marked();
    marked1.use({
        async: true, // -> activate async mode, so we can call Mermaid which only works asynchronous
        renderer: {
            text(token) {
                for (const project of allProjects) {
                    const regExp = new RegExp(`${project.prefix}-\\d+`, "g");

                    for (const match of token.text.matchAll(regExp)) {
                        issueKeys.push(match[0]);
                    }
                }

                return false;
            }
        }
    });
    await marked1.parse(markdown);

    // Load information for the issues

    const issues = await axios
        .graphql(
            `
                query FoundIssues($issueKeys: [String!]!) {
                    issuesByIssueKey(issueKeys: $issueKeys) {
                        id
                        issueKey
                        title
                        issueType {
                            title
                        }
                        issuePriority {
                            title
                        }
                        issueStatus {
                            title
                        }
                    }
                }
            `,
            { issueKeys }
        )
        .then(data => {
            return new Map(
                data.issuesByIssueKey
                    .map(issue => [issue.issueKey, issue])
            );
        });

    // Second pass:
    // Render the markdown and replace any found issues with link+tooltip.

    const marked2 = new Marked();
    marked2.use(mermaidExtension);
    marked2.use(hljsExtension);
    marked2.use({
        async: true, // -> activate async mode, so we can call Mermaid which only works asynchronous
        renderer: {
            text(token) {
                let text = token.text;
                let replaced = false;
                const NL = "&#10;";

                for (const [issueKey, issue] of issues) {
                    const regExp = new RegExp(`\\b${issueKey}\\b`, "g"); // Use "\b" to not cut a number, e.g. "FOO-4" will not be replaced, when there is "FOO-42"

                    text = text.replaceAll(regExp, () => {
                        const link = '/issues/' + issue.id;
                        const tooltip =
                            `${issue.issueKey}${NL}` +
                            `${issue.title}${NL}${NL}` +
                            `Type: ${issue.issueType.title}${NL}` +
                            `Priority: ${issue.issuePriority.title}${NL}` +
                            `Status: ${issue.issueStatus.title}`;

                        replaced = true;
                        return `<a href="${link}" class="issue-link" title="${tooltip}">` +
                            `<span>${issueKey}</span><i class="fas fa-square-up-right fa-sm"></i>` +
                            '</a>';
                    });
                }

                return replaced ? text : false; // if nothing was replaced, use the default renderer, that converts URL to links for example
            }
        }
    });

    return marked2.parse(markdown); // TODO Warning: We don't have any protection against malicious HTML! See https://marked.js.org/#installation
}

function highlightMarkdown(markdown) {
    return hljs.highlight(markdown, { language: 'markdown' }).value;
}

export {renderMarkdown, renderMarkdownAndReplaceIssueLinks, highlightMarkdown};
