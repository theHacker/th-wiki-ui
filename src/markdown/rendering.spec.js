import {describe, expect, it, vi} from 'vitest';
import MarkdownRenderer from './rendering.js';

/**
 * Kotlin-style motivated trimIndent tag function to remove leading and trailing blank line,
 * cutting off a common indent.
 *
 * That way we can use JavaScript's template literals without the need to misplace the content for correctness
 * when using multiple lines, but rather have it like we want AND nicely readable.
 *
 * @param {string[]} strings - Template literal string parts.
 * @param {...any} values - Interpolated values inside the template.
 * @returns {string} The processed string with trimmed indentation
 */
function trimIndent(strings, ...values) {
    const str = String.raw({ raw: strings }, ...values);
    const lines = str.split('\n');

    // Remove first and last line
    if (lines[0].trim() === '') lines.shift();
    if (lines[lines.length - 1].trim() === '') lines.pop();

    const indentLengths = lines
        .filter(line => line.trim())
        .map(line => line.match(/^(\s*)/)[0].length);

    const minIndent = Math.min(...indentLengths);

    return lines.map(line => line.slice(minIndent)).join('\n');
}

describe('MarkdownRenderer', () => {

    describe('render()', () => {

        it('renders Markdown', async () => {
            const renderer = new MarkdownRenderer(null, null);
            const markdown = trimIndent`
                # Hello Markdown

                This is a **test** paragraph.
            `;
            const expectedHtml = trimIndent`
                <h1>Hello Markdown</h1>
                <p>This is a <strong>test</strong> paragraph.</p>
                
            `;

            expect(await renderer.render(markdown)).toEqual(expectedHtml);
        });
    });

    describe('renderWithIssueLinks()', () => {

        it('replaces issue links', async () => {
            const allProjectsSupplier = () => Promise.resolve([
                { prefix: "FOO" },
                { prefix: "BAR" },
            ]);
            const issuesSupplier = () => Promise.resolve([
                {
                    id: "00001111-2222-3333-4444-555566667777",
                    issueKey: 'FOO-42',
                    title: 'Tests for Markdown',
                    issueType: { title: 'Task' },
                    issuePriority: { title: 'Normal' },
                    issueStatus: { title: 'Open' },
                },
            ]);

            const renderer = new MarkdownRenderer(allProjectsSupplier, issuesSupplier);
            const markdown = trimIndent`
                This is a text with BAR-1, FOO-42, and FOO-BAR-4711.
            `;
            const expectedHtml = trimIndent`
                <p>This is a text with BAR-1, <a href="/issues/00001111-2222-3333-4444-555566667777" class="issue-link" title="FOO-42&#10;Tests for Markdown&#10;&#10;Type: Task&#10;Priority: Normal&#10;Status: Open"><span>FOO-42</span><i class="fas fa-square-up-right fa-sm"></i></a>, and FOO-BAR-4711.</p>
                
            `;

            expect(await renderer.renderWithIssueLinks(markdown)).toEqual(expectedHtml);
        });

        describe("does not replace issue keys within links", () => {

            const allProjectsSupplier = () => Promise.resolve([
                { prefix: "THWIKI" },
            ]);
            const issuesSupplier = () => Promise.resolve([
                {
                    id: "3dc6e51f-4502-4bfd-bca7-eab5930a8da4",
                    issueKey: 'THWIKI-29',
                    title: '"Jump to source"-like function in the tree"',
                    issueType: { title: 'Feature' },
                    issuePriority: { title: 'Low' },
                    issueStatus: { title: 'Open' }
                },
                {
                    id: "b91a9fd9-e852-4be4-b6c9-c20b52221a71",
                    issueKey: 'THWIKI-160',
                    title: 'Show tags in the wiki navigation tree',
                    issueType: { title: 'Feature' },
                    issuePriority: { title: 'Normal' },
                    issueStatus: { title: 'Open' }
                },
            ]);

            it("works", async () => {
                const renderer = new MarkdownRenderer(allProjectsSupplier, issuesSupplier);
                const markdown = trimIndent`
                    Possible buttons
                    - "Jump to source" (see [THWIKI-29](/issues/3dc6e51f-4502-4bfd-bca7-eab5930a8da4))
                    - "Expand all"
                    - "Collapse all"
                    - "Show tags" (see THWIKI-160)
                    
                    Toolbar optic, see ButtonGroup in the Markdown "Content" text field
                `;
                const expectedHtml = trimIndent`
                    <p>Possible buttons</p>
                    <ul>
                    <li>&quot;Jump to source&quot; (see <a href="/issues/3dc6e51f-4502-4bfd-bca7-eab5930a8da4">THWIKI-29</a>)</li>
                    <li>&quot;Expand all&quot;</li>
                    <li>&quot;Collapse all&quot;</li>
                    <li>"Show tags" (see <a href="/issues/b91a9fd9-e852-4be4-b6c9-c20b52221a71" class="issue-link" title="THWIKI-160&#10;Show tags in the wiki navigation tree&#10;&#10;Type: Feature&#10;Priority: Normal&#10;Status: Open"><span>THWIKI-160</span><i class="fas fa-square-up-right fa-sm"></i></a>)</li>
                    </ul>
                    <p>Toolbar optic, see ButtonGroup in the Markdown &quot;Content&quot; text field</p>
                    
                `;

                expect(await renderer.renderWithIssueLinks(markdown)).toEqual(expectedHtml);
            });

            it("parses other inline code correctly", async () => {
                const renderer = new MarkdownRenderer(allProjectsSupplier, issuesSupplier);
                const markdown = trimIndent`
                    Possible buttons
                    - "Jump to source" (see [issue \`THWIKI-29\` **important**](/issues/3dc6e51f-4502-4bfd-bca7-eab5930a8da4))
                    - "Expand all"
                    - "Collapse all"
                    - "Show tags" (see THWIKI-160)
                    
                    Toolbar optic, see ButtonGroup in the Markdown "Content" text field
                `;
                const expectedHtml = trimIndent`
                    <p>Possible buttons</p>
                    <ul>
                    <li>&quot;Jump to source&quot; (see <a href="/issues/3dc6e51f-4502-4bfd-bca7-eab5930a8da4">issue <code>THWIKI-29</code> <strong>important</strong></a>)</li>
                    <li>&quot;Expand all&quot;</li>
                    <li>&quot;Collapse all&quot;</li>
                    <li>"Show tags" (see <a href="/issues/b91a9fd9-e852-4be4-b6c9-c20b52221a71" class="issue-link" title="THWIKI-160&#10;Show tags in the wiki navigation tree&#10;&#10;Type: Feature&#10;Priority: Normal&#10;Status: Open"><span>THWIKI-160</span><i class="fas fa-square-up-right fa-sm"></i></a>)</li>
                    </ul>
                    <p>Toolbar optic, see ButtonGroup in the Markdown &quot;Content&quot; text field</p>
                    
                `;

                expect(await renderer.renderWithIssueLinks(markdown)).toEqual(expectedHtml);
            });

            it("still looks up issue keys in links, only does not render", async () => {
                const allProjectsSupplier = () => Promise.resolve([
                    { prefix: "FOO" },
                ]);
                const issuesSupplier = vi.fn(() => Promise.resolve([
                    {
                        id: "00000000-0000-0000-0000-000000000000",
                        issueKey: 'FOO-43',
                        title: 'Does not matter',
                        issueType: { title: 'Feature' },
                        issuePriority: { title: 'Normal' },
                        issueStatus: { title: 'Open' }
                    },
                ]));

                const renderer = new MarkdownRenderer(allProjectsSupplier, issuesSupplier);
                const markdown = trimIndent`
                    FOO is a project, so FOO-1 will be looked up.
                    \`FOO-42\` is code, and [FOO-43](https://th-wiki.org/) is a link.
                `;
                const expectedHtml = trimIndent`
                    <p>FOO is a project, so FOO-1 will be looked up.
                    <code>FOO-42</code> is code, and <a href="https://th-wiki.org/">FOO-43</a> is a link.</p>
                    
                `;

                expect(await renderer.renderWithIssueLinks(markdown)).toEqual(expectedHtml);
                expect(issuesSupplier).toHaveBeenCalledWith(['FOO-1', 'FOO-43']);
            });
        });

        it("does not replace issue keys within code ticks", async () => {
            const allProjectsSupplier = () => Promise.resolve([
                { prefix: "FOO" },
            ]);
            const issuesSupplier = () => Promise.resolve([
                {
                    id: "76c0a474-96f9-464b-aa2b-636a7445a0a2",
                    issueKey: 'FOO-1234',
                    title: 'Any issue',
                    issueType: { title: 'Feature' },
                    issuePriority: { title: 'High' },
                    issueStatus: { title: 'Open' }
                },
            ]);

            const renderer = new MarkdownRenderer(allProjectsSupplier, issuesSupplier);
            const markdown = trimIndent`
                - Should be replaced: FOO-1234
                - Should **not** be replaced: \`FOO-1234\`
                
                Outside of list items, analog FOO-1234 vs. \`FOO-1234\`.
            `;
            const expectedHtml = trimIndent`
                <ul>
                <li>Should be replaced: <a href="/issues/76c0a474-96f9-464b-aa2b-636a7445a0a2" class="issue-link" title="FOO-1234&#10;Any issue&#10;&#10;Type: Feature&#10;Priority: High&#10;Status: Open"><span>FOO-1234</span><i class="fas fa-square-up-right fa-sm"></i></a></li>
                <li>Should <strong>not</strong> be replaced: <code>FOO-1234</code></li>
                </ul>
                <p>Outside of list items, analog <a href="/issues/76c0a474-96f9-464b-aa2b-636a7445a0a2" class="issue-link" title="FOO-1234&#10;Any issue&#10;&#10;Type: Feature&#10;Priority: High&#10;Status: Open"><span>FOO-1234</span><i class="fas fa-square-up-right fa-sm"></i></a> vs. <code>FOO-1234</code>.</p>
                
            `;

            expect(await renderer.renderWithIssueLinks(markdown)).toEqual(expectedHtml);
        });
    });
});
