import {describe, expect, it} from 'vitest';
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
    });
});
