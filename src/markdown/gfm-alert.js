import {capitalize, escapeHtmlText, trimIndent} from "@/helper/string.js";

// Note: There is https://github.com/bent10/marked-extensions/blob/main/packages/alert/src/index.ts,
//       however, it's not so flexible on the output markup, so we just code our own.

const alertTypes = {
    'NOTE': {
        colorClass: 'info',
        icon: 'circle-info'
    },
    'TIP': {
        colorClass: 'success',
        icon: 'lightbulb'
    },
    'IMPORTANT': {
        colorClass: 'primary',
        icon: 'thumbtack'
    },
    'WARNING': {
        colorClass: 'warning',
        icon: 'triangle-exclamation'
    },
    'CAUTION': {
        colorClass: 'danger',
        icon: 'circle-exclamation'
    }
}

const gfmAlertExtension = {
    renderer: {
        blockquote({ tokens }) {
            const paragraphToken = tokens[0];
            if (paragraphToken.type !== 'paragraph' || paragraphToken.tokens[0].type !== 'text') {
                return false;
            }

            const regExp = /^\[!(\w+)]\s*\n*(.*)$/s;
            const match = paragraphToken.text.match(regExp);
            if (!match) {
                return false;
            }

            const alertTypeName = match[1];
            const definedAlertType = alertTypes[alertTypeName.toUpperCase()];
            const alertType = definedAlertType || {
                colorClass: 'secondary',
                icon: 'question'
            };
            const header = definedAlertType ? capitalize(alertTypeName) : `(Unsupported alert type ${alertTypeName})`;

            // Render tokens. First token (= paragraph, and its tokens) are changed or deleted
            let replacedParagraphToken;
            if (match[2].trim() !== '') {
                const textToken = paragraphToken.tokens[0];

                replacedParagraphToken = {
                    ...paragraphToken,
                    raw: match[2],
                    text: match[2],
                    tokens: [
                        {
                            type: 'text',
                            raw: textToken.raw.replace(regExp, '$2'),
                            text: textToken.text.replace(regExp, '$2')
                        },
                        ...paragraphToken.tokens.slice(1)
                    ]
                };
            } else {
                replacedParagraphToken = null;
            }

            const replacedTokens = [
                ...(replacedParagraphToken ? [replacedParagraphToken] : []),
                ...tokens.slice(1)
            ];
            const content = this.parser.parse(replacedTokens)
                .replace(/\n$/, '') // remove last \n the parser generates
                .split('\n')
                .map(line => `    ${line}`) // indent
                .join('\n');

            const e = escapeHtmlText;

            return trimIndent`
                <div class="alert alert-${alertType.colorClass}">
                    <p class="alert-header"><i class="fas fa-${alertType.icon}"></i> <b>${e(header)}</b></p>
            ` + '\n' + content + '\n</div>\n';
        }
    }
};

export {gfmAlertExtension};
