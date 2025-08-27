import {Marked} from 'marked';
import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';
import mermaidExtension from "./mermaid";
import hljsExtension from "./hljs";
import {trimIndent} from "@/helper/string.js";

const apiUrl = () => window?.env?.API_URL || import.meta.env.VITE_API_URL;

hljs.registerLanguage('markdown', markdown);

/**
 * Encapsulates rendering of Markdown.
 *
 * Enables testability of our output, what was not so easy when calling library functions directly.
 */
class MarkdownRenderer {

    /**
     * @param {function(): Promise<any[]>} allProjectsSupplier Function to lookup all existing projects
     * @param {function(issueKeys: string[]): Promise<any[]>} issuesSupplier Function to lookup the issues for the tooltip
     *                                                                       and whether they exist
     */
    constructor(allProjectsSupplier, issuesSupplier) {
        this.allProjectsSupplier = allProjectsSupplier;
        this.issuesSupplier = issuesSupplier;
    }

    static withAxios(axios) {
        const allProjectsSupplier = async () => {
            return await axios
                .graphql(`
                    query AllProjectsWithPrefixes {
                        projects {
                            prefix
                        }
                    }
                `)
                .then(data => data.projects);
        };

        const issuesSupplier = async (issueKeys) => {
            return await axios
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
                .then(data => data.issuesByIssueKey);
        };

        return new MarkdownRenderer(allProjectsSupplier, issuesSupplier);
    }

    /**
     * Renders Markdown code to HTML, "plain" without any additional features.
     *
     * @param {string} markdown Markdown code
     * @returns {Promise<string>} rendered HTML
     */
    async renderPlain(markdown) {
        const marked = new Marked();
        marked.use(mermaidExtension);
        marked.use(hljsExtension);

        return marked.parse(markdown); // TODO Warning: We don't have any protection against malicious HTML! See https://marked.js.org/#installation
    }

    /**
     * Escapes special characters for usage inside an HTML tag (`&`, `<`, `>`).
     *
     * @param {string} str input string
     * @returns {string} escaped string
     * @private
     */
    static _escapeHtmlText(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /**
     * Escapes special characters for usage in an HTML attribute (`&`, `"`, `'`, `<`, `>`).
     *
     * @param {string} str input string
     * @returns {string} escaped string
     * @private
     */
    static _escapeHtmlAttribute(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /**
     * Renders markdown "rich" with all our features.
     *
     * Finds all valid issue keys in the text, and replaces it each with a link and tooltip.
     * Images with relative paths are taken from attachments.
     *
     * This function needs two API requests (all project prefixes, found issues),
     * and will parse the markdown twice.
     *
     * Attachments need to be loaded by the caller. They cannot be loaded by us, because
     * there is no information in the markdown how to access them (wiki page vs. issue?, which ID?).
     *
     * @param {string} markdown Markdown
     * @param {{id: string, filename: string, description: string}[]} [attachments] Attachments for rendering inline images
     * @returns {Promise<string>} Rendered Markdown as HTML code
     */
    async renderRich(markdown, attachments) {
        // First find all project prefixes

        const allProjects = await this.allProjectsSupplier();

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

        const issues = await this.issuesSupplier(issueKeys)
            .then(data => {
                return new Map(
                    data.map(issue => [issue.issueKey, issue])
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
                link({href, title, tokens}) {
                    this._insideALink = true;
                    const text = this.constructor.prototype.link.call(this, {href, title, tokens});
                    this._insideALink = false;

                    return text;
                },
                text(token) {
                    if (this._insideALink) {
                        return token.text;
                    }

                    if (token.tokens) {
                        return this.parser.parseInline(token.tokens);
                    }

                    let text = token.text;
                    let replaced = false;
                    const NL = "&#10;";

                    for (const [issueKey, issue] of issues) {
                        const regExp = new RegExp(`\\b${issueKey}\\b`, "g"); // Use "\b" to not cut a number, e.g. "FOO-4" will not be replaced, when there is "FOO-42"

                        const e = MarkdownRenderer._escapeHtmlAttribute;
                        text = text.replaceAll(regExp, () => {
                            const link = '/issues/' + issue.id;
                            const tooltip =
                                `${issue.issueKey}${NL}` +
                                `${e(issue.title)}${NL}${NL}` +
                                `Type: ${e(issue.issueType.title)}${NL}` +
                                `Priority: ${e(issue.issuePriority.title)}${NL}` +
                                `Status: ${e(issue.issueStatus.title)}`;

                            replaced = true;
                            return `<a href="${link}" class="issue-link" title="${tooltip}">` +
                                `<span>${issueKey}</span><i class="fas fa-square-up-right fa-sm"></i>` +
                                '</a>';
                        });
                    }

                    return replaced ? text : false; // if nothing was replaced, use the default renderer, that converts URL to links for example
                },
                image({href, title, text}) {
                    if (href.includes("/") && !href.startsWith("./")) {
                        return false;
                    }

                    // local image from attachments

                    let filename;
                    if (href.startsWith("./")) {
                        filename = href.substring(2);
                    } else {
                        filename = href;
                    }

                    const attachment = attachments?.find(a => a.filename === filename);
                    if (attachment) {
                        const e = MarkdownRenderer._escapeHtmlAttribute;
                        const src = `${apiUrl()}/attachments/${attachment.id}`;

                        // No override from Markdown, take strings from the attachment
                        if (!text && attachment.description) {
                            text = attachment.description;
                        }

                        // No title? Then default to alt/description
                        if (!title && text) {
                            title = text;
                        }

                        // Include title attribute only if there is content
                        let titleAttr = '';
                        if (title) {
                            titleAttr = ` title="${e(title)}"`;
                        }

                        return `<img src="${src}" alt="${e(text)}"${titleAttr} />`;
                    } else {
                        const e = MarkdownRenderer._escapeHtmlText;

                        return trimIndent`
                            <div class="card bg-danger-subtle text-danger-emphasis mb-4">
                                <div class="card-header">
                                    <i class="fas fa-bug pe-1"></i>
                                    Attachment not found
                                </div>
                                <p class="card-body bg-transparent mb-0">There is no attachment with filename <code>${e(filename)}</code>.</p>
                            </div>
                        `;
                    }
                }
            }
        });

        return marked2.parse(markdown); // TODO Warning: We don't have any protection against malicious HTML! See https://marked.js.org/#installation
    }

    highlightMarkdown(markdown) {
        return hljs.highlight(markdown, { language: 'markdown' }).value;
    }
}

export default MarkdownRenderer;
