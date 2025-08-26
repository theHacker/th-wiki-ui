import mermaid from "mermaid";

// used to generate different IDs so Mermaid CSS does not clash
// when there is multiple charts (rendered at the same time)
let mermaidIdCounter = 0;

// noinspection JSUnusedGlobalSymbols - walkTokens is called by Marked
const mermaidExtension = {
    async: true, // -> activate async mode, so we can call Mermaid which only works asynchronous

    // Overwrite walkTokens. When we encounter a mermaid code block, render it.
    // Note: Usually you want to do that in the renderer, however, Marked.js does not support async renderer functions.
    // See https://github.com/markedjs/marked/issues/458 and https://github.com/markedjs/marked/pull/2474 for details.
    async walkTokens(token) {
        if (token.type === 'code') {
            const langString = (token.lang || '').match(/^\S*/)?.[0];
            if (langString === 'mermaid') {
                const svgId = 'mermaid-' + Date.now() + '-' + (++mermaidIdCounter);
                try {
                    const renderResult = await mermaid.render(svgId, token.text);
                    const {svg} = renderResult;

                    token.mermaidSvg = svg;
                } catch (e) {
                    token.mermaidSvg = `
                        <div class="card bg-danger-subtle text-danger-emphasis mb-4">
                            <div class="card-header">
                                <i class="fas fa-bug pe-1"></i>
                                Mermaid could not render
                            </div>
                            <pre class="card-body bg-transparent mb-0">${e}</pre>
                        </div>
                    `;
                }
            }
        }
    },
    renderer: {
        code(token) {
            if (token.mermaidSvg) {
                return token.mermaidSvg;
            }

            return false;
        }
    }
};

export default mermaidExtension;
