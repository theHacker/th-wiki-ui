import {Marked} from 'marked';
import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';
import mermaidExtension from "./mermaid";
import hljsExtension from "./hljs";
import {escapeHtmlAttribute} from "@/helper/string.js";
import {createAttachmentsImageResolver, createBlobImageResolver, imageExtension} from "./images.js";
import {gfmAlertExtension} from "./gfm-alert.js";

hljs.registerLanguage('markdown', markdown);

/**
 * Encapsulates rendering of Markdown.
 *
 * Enables testability of our output, what was not so easy when calling library functions directly.
 */
class MarkdownRenderer {

    /**
     * Function to lookup all existing projects
     *
     * @type {?function(): Promise<any[]>}
     */
    allProjectsSupplier = null;

    /**
     * Function to lookup the issues for the tooltip and whether they exist
     *
     * @type {?function(issueKeys: string[]): Promise<any[]>}
     */
    issuesSupplier = null;

    /**
     * Function to render images with relative paths
     *
     * @type {?function(filename: string, href: string, title: string, text: string): string}
     */
    imageResolver = null;


    constructor(allProjectsSupplier = null, issuesSupplier = null, imageResolver = null) {
        this.allProjectsSupplier = allProjectsSupplier;
        this.issuesSupplier = issuesSupplier;
        this.imageResolver = imageResolver;
    }

    // Configuration ///////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Enables the feature to find all valid issue keys in the text, and replace them each with a link and tooltip.
     * Issues and projects are looked up by Axios doing GraphQL requests.
     *
     * @param {AxiosInstance} axios
     */
    enableIssueLookupByAxios(axios) {
        this.allProjectsSupplier = async () => {
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

        this.issuesSupplier = async (issueKeys) => {
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
    }

    /**
     * Enables the feature to replace images having relative paths with attachments.
     * Attachments need to provide `id`, `filename`, and `description`. The images are then
     * fetched by GET requests by the API.
     *
     * @param {{id: string, filename: string, description: string}[]} attachments
     */
    enableAttachmentByGetRequest(attachments) {
        this.imageResolver = createAttachmentsImageResolver(attachments);
    }

    /**
     * Enables the feature to replace images having relative paths with attachments from Blobs.
     * Attachments need to provide `path` and a `url` to a prepared Blob.
     *
     * Paths span a filesystem-like directory structure.
     * We *only* support images in the same directory (for now, this is enough for us).
     *
     * @param {string} currentPath
     * @param {{path: string, url: string}[]} attachments
     */
    enableAttachmentByBlobs(currentPath, attachments) {
        this.imageResolver = createBlobImageResolver(currentPath, attachments);
    }

    // Render functions ////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Renders Markdown code to HTML, "plain" i.e. in a single pass.
     *
     * Works with attachments, but not with issue lookup.
     *
     * @param {string} markdown Markdown code
     * @returns {Promise<string>} rendered HTML
     */
    async renderPlain(markdown) {
        const marked = new Marked();
        marked.use(mermaidExtension);
        marked.use(hljsExtension);
        marked.use(gfmAlertExtension);

        if (this.imageResolver) {
            marked.use(imageExtension(this.imageResolver));
        }

        return marked.parse(markdown); // TODO Warning: We don't have any protection against malicious HTML! See https://marked.js.org/#installation
    }

    /**
     * Renders markdown "rich" with all our features.
     *
     * This function does two passes to collect issue keys first.
     * Call only, after you set at least allProjectsSupplier and issuesSupplier.

     *
     * @param {string} markdown Markdown
     * @returns {Promise<string>} Rendered Markdown as HTML code
     */
    async renderRich(markdown) {
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
        marked2.use(gfmAlertExtension);

        if (this.imageResolver) {
            marked2.use(imageExtension(this.imageResolver));
        }

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

                        const e = escapeHtmlAttribute;
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
                }
            }
        });

        return marked2.parse(markdown); // TODO Warning: We don't have any protection against malicious HTML! See https://marked.js.org/#installation
    }

    highlightMarkdown(markdown) {
        return hljs.highlight(markdown, { language: 'markdown' }).value;
    }

    // Other functions /////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Extract's the title (h1 heading) from Markdown code.
     *
     * If there is multiple h1 headings, the first is returned.
     * Returns `null` if there is no h1 heading.
     *
     * Returns HTML parsed, in case the heading has inline tags, like e.g. strong or code.
     *
     * @param {string} markdown Markdown code
     * @returns {string | null} h1 heading
     */
    extractTitle(markdown) {
        const marked = new Marked();
        let title = null;

        marked.parse(markdown);
        marked.use({
            renderer: {
                heading({tokens, depth}) {
                    if (depth === 1 && title === null) {
                        title = this.parser.parseInline(tokens);
                    }
                }
            }
        });
        marked.parse(markdown);

        return title;
    }
}

export default MarkdownRenderer;
