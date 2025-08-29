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
            const firstToken = tokens[0];
            if (firstToken.type !== 'paragraph') {
                return false;
            }

            const match = firstToken.text.match(/^\[!(\w+)]\s*\n?(.*)/);
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

            // Render tokens. First token is replaced
            let replacedFirstToken = null;
            if (match[2].trim() !== '') {
                replacedFirstToken = {
                    type: 'paragraph',
                    raw: match[2],
                    text: match[2],
                    tokens: [
                        {
                            type: 'text',
                            raw: match[2],
                            text: match[2]
                        }
                    ]
                };
            }

            const replacedTokens = [
                ...(replacedFirstToken ? [replacedFirstToken] : []),
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
