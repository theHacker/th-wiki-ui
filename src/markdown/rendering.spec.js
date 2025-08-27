import {beforeAll, describe, expect, it, vi} from 'vitest';
import MarkdownRenderer from './rendering.js';
import {trimIndent} from "@/helper/string.js";
import {createAttachmentsImageResolver, createBlobImageResolver} from "@/markdown/images.js";

describe('MarkdownRenderer', () => {

    beforeAll(() => {
        Object.defineProperty(window, "env", {
            value: {API_URL: "http://localhost:8080/api"}
        });
    });

    describe('renderPlain()', () => {

        it('renders Markdown', async () => {
            const renderer = new MarkdownRenderer();
            const markdown = trimIndent`
                # Hello Markdown

                This is a **test** paragraph.
            `;
            const expectedHtml = trimIndent`
                <h1>Hello Markdown</h1>
                <p>This is a <strong>test</strong> paragraph.</p>
                
            `;

            expect(await renderer.renderPlain(markdown)).toEqual(expectedHtml);
        });
    });

    describe('renderRich()', () => {

        describe('issue links', () => {

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

                expect(await renderer.renderRich(markdown)).toEqual(expectedHtml);
            });

            it('correctly escapes everything, so the tooltip does not break', async () => {
                const allProjectsSupplier = () => Promise.resolve([
                    { prefix: "FOO" }
                ]);
                const issuesSupplier = () => Promise.resolve([
                    {
                        id: "00001111-2222-3333-4444-555566667777",
                        issueKey: 'FOO-42',
                        title: 'This "Issue" has \'bad\' content <|> ;-)',
                        issueType: { title: '"Layer 8" problem' },
                        issuePriority: { title: '<<<Lowest&Lower' },
                        issueStatus: { title: '<testing>' },
                    },
                ]);

                const renderer = new MarkdownRenderer(allProjectsSupplier, issuesSupplier);
                const markdown = trimIndent`
                    Let FOO-42 not break everything.
                `;
                const expectedHtml = trimIndent`
                    <p>Let <a href="/issues/00001111-2222-3333-4444-555566667777" class="issue-link" title="FOO-42&#10;This &quot;Issue&quot; has &#39;bad&#39; content &lt;|&gt; ;-)&#10;&#10;Type: &quot;Layer 8&quot; problem&#10;Priority: &lt;&lt;&lt;Lowest&amp;Lower&#10;Status: &lt;testing&gt;"><span>FOO-42</span><i class="fas fa-square-up-right fa-sm"></i></a> not break everything.</p>
                    
                `;

                expect(await renderer.renderRich(markdown)).toEqual(expectedHtml);
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

                    expect(await renderer.renderRich(markdown)).toEqual(expectedHtml);
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

                    expect(await renderer.renderRich(markdown)).toEqual(expectedHtml);
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

                    expect(await renderer.renderRich(markdown)).toEqual(expectedHtml);
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

                expect(await renderer.renderRich(markdown)).toEqual(expectedHtml);
            });
        });

        describe('images from attachments', () => {

            it('replaces images', async () => {
                const allProjectsSupplier = () => Promise.resolve([]);
                const issuesSupplier = () => Promise.resolve([]);

                const attachments = [
                    {
                        id: "c4efc11d-a1bb-42e5-a74e-ab979c283107",
                        filename: "image1.png",
                        description: "Description of image 1"
                    },
                    {
                        id: "d735738b-270c-4674-836a-1bf7717fe211",
                        filename: "image2.jpeg",
                        description: "Description of image 2"
                    },
                    {
                        id: "52fb6ddc-b7d8-4d9a-bf13-2c84bc79c6d9",
                        filename: "image3.png",
                        description: "unused image"
                    },
                ];
                const imageResolver = createAttachmentsImageResolver(attachments);

                const renderer = new MarkdownRenderer(allProjectsSupplier, issuesSupplier, imageResolver);
                const markdown = trimIndent`
                    Should be replaced:
                    ![Image 1](image1.png)
                    
                    Should also be replaced:
                    ![Image 2](./image2.jpeg)
                    
                    Should not be replaced:
                    ![Image 3](https://example.com/image3.png)
                    
                    Should also not be replaced:
                    ![Image 3](/api/imaginary-future-api-from-thwiki/random.png?s=640x480)
                `;
                const expectedHtml = trimIndent`
                    <p>Should be replaced:
                    <img src="http://localhost:8080/api/attachments/c4efc11d-a1bb-42e5-a74e-ab979c283107" alt="Image 1" title="Image 1" /></p>
                    <p>Should also be replaced:
                    <img src="http://localhost:8080/api/attachments/d735738b-270c-4674-836a-1bf7717fe211" alt="Image 2" title="Image 2" /></p>
                    <p>Should not be replaced:
                    <img src="https://example.com/image3.png" alt="Image 3"></p>
                    <p>Should also not be replaced:
                    <img src="/api/imaginary-future-api-from-thwiki/random.png?s=640x480" alt="Image 3"></p>
                    
                `;

                expect(await renderer.renderRich(markdown)).toEqual(expectedHtml);
            });

            it('allows overriding title and description/alt by markdown, title defaults to alt, empty title is omitted', async () => {
                const allProjectsSupplier = () => Promise.resolve([]);
                const issuesSupplier = () => Promise.resolve([]);

                const attachments = [
                    {
                        id: "4349e0c5-f2cb-4990-8f17-c525554794a8",
                        filename: "foo.webp",
                        description: "Dummy image"
                    },
                    {
                        id: "b5657e8b-8e40-4ed3-b4a1-c44b20433580",
                        filename: "no-description.gif",
                        description: ""
                    }
                ];
                const imageResolver = createAttachmentsImageResolver(attachments);

                const renderer = new MarkdownRenderer(allProjectsSupplier, issuesSupplier, imageResolver);
                const markdown = trimIndent`
                    Override all
                    ![My description](foo.webp "My title")
                    
                    Override title only
                    ![](foo.webp "My title")
                    
                    Override alt only
                    ![My description](foo.webp)
                    
                    Override none
                    ![](foo.webp)
                    
                    ---
                    
                    Override all
                    ![My description](no-description.gif "My title")
                    
                    Override title only
                    ![](no-description.gif "My title")
                    
                    Override alt only
                    ![My description](no-description.gif)
                    
                    Override none
                    ![](no-description.gif)
                `;
                const expectedHtml = trimIndent`
                    <p>Override all
                    <img src="http://localhost:8080/api/attachments/4349e0c5-f2cb-4990-8f17-c525554794a8" alt="My description" title="My title" /></p>
                    <p>Override title only
                    <img src="http://localhost:8080/api/attachments/4349e0c5-f2cb-4990-8f17-c525554794a8" alt="Dummy image" title="My title" /></p>
                    <p>Override alt only
                    <img src="http://localhost:8080/api/attachments/4349e0c5-f2cb-4990-8f17-c525554794a8" alt="My description" title="My description" /></p>
                    <p>Override none
                    <img src="http://localhost:8080/api/attachments/4349e0c5-f2cb-4990-8f17-c525554794a8" alt="Dummy image" title="Dummy image" /></p>
                    <hr>
                    <p>Override all
                    <img src="http://localhost:8080/api/attachments/b5657e8b-8e40-4ed3-b4a1-c44b20433580" alt="My description" title="My title" /></p>
                    <p>Override title only
                    <img src="http://localhost:8080/api/attachments/b5657e8b-8e40-4ed3-b4a1-c44b20433580" alt="" title="My title" /></p>
                    <p>Override alt only
                    <img src="http://localhost:8080/api/attachments/b5657e8b-8e40-4ed3-b4a1-c44b20433580" alt="My description" title="My description" /></p>
                    <p>Override none
                    <img src="http://localhost:8080/api/attachments/b5657e8b-8e40-4ed3-b4a1-c44b20433580" alt="" /></p>
                    
                `;

                expect(await renderer.renderRich(markdown)).toEqual(expectedHtml);
            });

            it('correctly escapes', async () => {
                const allProjectsSupplier = () => Promise.resolve([]);
                const issuesSupplier = () => Promise.resolve([]);

                const attachments = [
                    {
                        id: "111c426d-88de-46bf-a787-ef1c23105f2f",
                        filename: "my-image.gif",
                        description: "'Dangerous' <|> \"Description\" & &amp;"
                    }
                ];
                const imageResolver = createAttachmentsImageResolver(attachments);

                const renderer = new MarkdownRenderer(allProjectsSupplier, issuesSupplier, imageResolver);
                const markdown = trimIndent`
                    From attachment
                    ![](my-image.gif)
                    
                    From markdown
                    ![My \\[optional\\] & "alt" <|> 'test'](my-image.gif "'My' \\"cool\\" & <title>")
                `;
                const expectedHtml = trimIndent`
                    <p>From attachment
                    <img src="http://localhost:8080/api/attachments/111c426d-88de-46bf-a787-ef1c23105f2f" alt="&#39;Dangerous&#39; &lt;|&gt; &quot;Description&quot; &amp; &amp;amp;" title="&#39;Dangerous&#39; &lt;|&gt; &quot;Description&quot; &amp; &amp;amp;" /></p>
                    <p>From markdown
                    <img src="http://localhost:8080/api/attachments/111c426d-88de-46bf-a787-ef1c23105f2f" alt="My [optional] &amp; &quot;alt&quot; &lt;|&gt; &#39;test&#39;" title="&#39;My&#39; &quot;cool&quot; &amp; &lt;title&gt;" /></p>
                    
                `;

                expect(await renderer.renderRich(markdown)).toEqual(expectedHtml);
            });

            it('displays error boxes for attachments not found', async () => {
                const allProjectsSupplier = () => Promise.resolve([]);
                const issuesSupplier = () => Promise.resolve([]);

                const attachments = [
                    {
                        id: "75cc421b-ac29-4959-b188-9dc2a8ac96cd",
                        filename: "foooooo.png",
                        description: ""
                    }
                ];
                const imageResolver = createAttachmentsImageResolver(attachments);

                const renderer = new MarkdownRenderer(allProjectsSupplier, issuesSupplier, imageResolver);
                const markdown = trimIndent`
                    Not found
                    ![](not-found.gif)
                    
                    Found
                    ![](foooooo.png)
                    
                    Not found
                    ![Some image](not-found.webp "hover me")
                `;
                const expectedHtml = trimIndent`
                    <p>Not found
                    <div class="card bg-danger-subtle text-danger-emphasis mb-4">
                        <div class="card-header">
                            <i class="fas fa-bug pe-1"></i>
                            Attachment not found
                        </div>
                        <p class="card-body bg-transparent mb-0">There is no attachment with filename <code>not-found.gif</code>.</p>
                    </div></p>
                    <p>Found
                    <img src="http://localhost:8080/api/attachments/75cc421b-ac29-4959-b188-9dc2a8ac96cd" alt="" /></p>
                    <p>Not found
                    <div class="card bg-danger-subtle text-danger-emphasis mb-4">
                        <div class="card-header">
                            <i class="fas fa-bug pe-1"></i>
                            Attachment not found
                        </div>
                        <p class="card-body bg-transparent mb-0">There is no attachment with filename <code>not-found.webp</code>.</p>
                    </div></p>
                    
                `;

                expect(await renderer.renderRich(markdown)).toEqual(expectedHtml);
            });

            it('works with spaces in filenames, they are %20 in markdown', async () => {
                const allProjectsSupplier = () => Promise.resolve([]);
                const issuesSupplier = () => Promise.resolve([]);

                const attachments = [
                    {
                        id: "b981484a-a376-4962-8799-61158b3598d7",
                        filename: "Screenshot 2025-08-26 14:55:23.png",
                        description: ""
                    }
                ];
                const imageResolver = createAttachmentsImageResolver(attachments);

                const renderer = new MarkdownRenderer(allProjectsSupplier, issuesSupplier, imageResolver);
                const markdown = trimIndent`
                    ![](Screenshot%202025-08-26%2014:55:23.png)
                `;
                const expectedHtml = trimIndent`
                    <p><img src="http://localhost:8080/api/attachments/b981484a-a376-4962-8799-61158b3598d7" alt="" /></p>
                    
                `;

                expect(await renderer.renderRich(markdown)).toEqual(expectedHtml);
            });
        });

        describe('images from blob URLs', () => {

            it('replaces images', async () => {
                const allProjectsSupplier = () => Promise.resolve([]);
                const issuesSupplier = () => Promise.resolve([]);

                const attachments = [
                    {
                        path: "/foo/bar/image1.png",
                        url: "blob:http://localhost:5173/0f6127a7-79a7-4e5e-aa6a-4452d2583579"
                    },
                    {
                        path: "/foo/bar/image2.jpeg",
                        url: "blob:http://localhost:5173/f8778276-9536-4576-9df5-b9af44484ce9"
                    },
                    {
                        path: "/foo/bar/unused-image.png",
                        url: "blob:http://localhost:5173/db66b60a-a2f4-4388-b571-974a73664c5d"
                    },
                ];
                const imageResolver = createBlobImageResolver("/foo/bar/my-markdown.md", attachments);

                const renderer = new MarkdownRenderer(allProjectsSupplier, issuesSupplier, imageResolver);
                const markdown = trimIndent`
                    Should be replaced:
                    ![Image 1](image1.png)

                    Should also be replaced:
                    ![Image 2](./image2.jpeg)

                    Should not be replaced:
                    ![Image 3](https://example.com/image3.png)

                    Should also not be replaced:
                    ![Image 4](/api/imaginary-future-api-from-thwiki/random.png?s=640x480)
                `;
                const expectedHtml = trimIndent`
                    <p>Should be replaced:
                    <img src="blob:http://localhost:5173/0f6127a7-79a7-4e5e-aa6a-4452d2583579" alt="Image 1" title="Image 1" /></p>
                    <p>Should also be replaced:
                    <img src="blob:http://localhost:5173/f8778276-9536-4576-9df5-b9af44484ce9" alt="Image 2" title="Image 2" /></p>
                    <p>Should not be replaced:
                    <img src="https://example.com/image3.png" alt="Image 3"></p>
                    <p>Should also not be replaced:
                    <img src="/api/imaginary-future-api-from-thwiki/random.png?s=640x480" alt="Image 4"></p>

                `;

                expect(await renderer.renderRich(markdown)).toEqual(expectedHtml);
            });

            it('does NOT fully support resolving images between directories', async () => {
                const allProjectsSupplier = () => Promise.resolve([]);
                const issuesSupplier = () => Promise.resolve([]);

                const attachments = [
                    {
                        path: "/root.png",
                        url: "blob:http://localhost:5173/0f6127a7-79a7-4e5e-aa6a-4452d2583579"
                    },
                    {
                        path: "/sub/image.jpeg",
                        url: "blob:http://localhost:5173/f8778276-9536-4576-9df5-b9af44484ce9"
                    },
                    {
                        path: "/sub/sub2/image.gif",
                        url: "blob:http://localhost:5173/db66b60a-a2f4-4388-b571-974a73664c5d"
                    },
                ];
                const imageResolver = createBlobImageResolver("/sub/content.md", attachments);

                const renderer = new MarkdownRenderer(allProjectsSupplier, issuesSupplier, imageResolver);
                const markdown = trimIndent`
                    Should be replaced:
                    ![Same directory](image.jpeg)

                    NOT replaced despite existing:
                    ![Parent directory](./../root.png)
                    
                    NOT replaced despite existing (technically not a relative path in our implementation):
                    ![Parent directory](../root.png)

                    Replaced because it's just a string replacement:
                    ![Child directory](./sub2/image.gif)
                `;
                const expectedHtml = trimIndent`
                    <p>Should be replaced:
                    <img src="blob:http://localhost:5173/f8778276-9536-4576-9df5-b9af44484ce9" alt="Same directory" title="Same directory" /></p>
                    <p>NOT replaced despite existing:
                    <div class="card bg-danger-subtle text-danger-emphasis mb-4">
                        <div class="card-header">
                            <i class="fas fa-bug pe-1"></i>
                            Image not found
                        </div>
                        <p class="card-body bg-transparent mb-0">
                            There is no image with path: <code>/sub/../root.png</code>.<br />
                            <code>currentPath = "/sub/content.md"</code>, <code>filename = "../root.png"</code>
                        </p>
                    </div></p>
                    <p>NOT replaced despite existing (technically not a relative path in our implementation):
                    <img src="../root.png" alt="Parent directory"></p>
                    <p>Replaced because it&#39;s just a string replacement:
                    <img src="blob:http://localhost:5173/db66b60a-a2f4-4388-b571-974a73664c5d" alt="Child directory" title="Child directory" /></p>

                `;

                expect(await renderer.renderRich(markdown)).toEqual(expectedHtml);
            });
        });
    });

    describe('extractTitle()', () => {

        it('extracts the h1 heading', () => {
            const renderer = new MarkdownRenderer(null, null);
            const markdown = trimIndent`
                # This is the title
                ## This is the subtitle
                
                Some text
            `;

            expect(renderer.extractTitle(markdown)).toEqual("This is the title");
        });

        it('returns the first h1 heading if there is more', () => {
            const renderer = new MarkdownRenderer();
            const markdown = trimIndent`
                # This is the first title
                ## This is the first subtitle
                
                Some text
                
                # This is the second title
                ## This is the second subtitle
                
                Some more text
            `;

            expect(renderer.extractTitle(markdown)).toEqual("This is the first title");
        });

        it('returns null if there is no h1 heading', () => {
            const renderer = new MarkdownRenderer();
            const markdown = trimIndent`
                ## H2 heading
                
                There is no h1 heading.
            `;

            expect(renderer.extractTitle(markdown)).toBeNull();
        });

        it("returns the h1 heading even if it's in the middle", () => {
            const renderer = new MarkdownRenderer();
            const markdown = trimIndent`
                sub heading
                ------------
                
                Foo bar text.
                
                real h1 heading
                ====================
                
                Txet rab oof.
                
                ##### h5 ?!
            `;

            expect(renderer.extractTitle(markdown)).toEqual("real h1 heading");
        });

        it("returns rendered HTML", () => {
            const renderer = new MarkdownRenderer();
            const markdown = trimIndent`
                # **This** heading has \`formatting\`. Should **be _parsed_**.
            `;

            expect(renderer.extractTitle(markdown))
                .toEqual("<strong>This</strong> heading has <code>formatting</code>. Should <strong>be <em>parsed</em></strong>.");
        });
    });
});
