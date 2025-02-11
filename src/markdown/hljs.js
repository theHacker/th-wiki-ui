import hljs from 'highlight.js/lib/core';

import apache from 'highlight.js/lib/languages/apache';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import css from 'highlight.js/lib/languages/css';
import diff from 'highlight.js/lib/languages/diff';
import dns from 'highlight.js/lib/languages/dns';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import gradle from 'highlight.js/lib/languages/gradle';
import graphql from 'highlight.js/lib/languages/graphql';
import http from 'highlight.js/lib/languages/http';
import ini from 'highlight.js/lib/languages/ini';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import kotlin from 'highlight.js/lib/languages/kotlin';
import lua from 'highlight.js/lib/languages/lua';
import makefile from 'highlight.js/lib/languages/makefile';
import markdown from 'highlight.js/lib/languages/markdown';
import nginx from 'highlight.js/lib/languages/nginx';
import php from 'highlight.js/lib/languages/php';
import properties from 'highlight.js/lib/languages/properties';
import python from 'highlight.js/lib/languages/python';
import scss from 'highlight.js/lib/languages/scss';
import shell from 'highlight.js/lib/languages/shell';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import vim from 'highlight.js/lib/languages/vim';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

// Register interesting languages
//
// Alternative: We could replace the import
//              import hljs from 'highlight.js/lib/core';
//              with
//              import hljs from 'highlight.js/lib/common';
//
//              This would register all languages at once.
//
// We make it manually, to
// a) exclude boring languages
// b) keep options open to add user-defined/other languages

const interestingLanguages = {
    'apache': apache,
    'bash': bash,
    'c': c,
    'css': css,
    'diff': diff,
    'dns': dns,
    'dockerfile': dockerfile,
    'gradle': gradle,
    'graphql': graphql,
    'http': http,
    'ini': ini,
    'java': java,
    'javascript': javascript,
    'json': json,
    'kotlin': kotlin,
    'lua': lua,
    'makefile': makefile,
    'markdown': markdown,
    'nginx': nginx,
    'php': php,
    'properties': properties,
    'python': python,
    'scss': scss,
    'shell': shell,
    'sql': sql,
    'typescript': typescript,
    'vim': vim,
    'xml': xml,
    'yaml': yaml
};

for (const [languageName, language] of Object.entries(interestingLanguages)) {
    hljs.registerLanguage(languageName, language);
}

// noinspection JSUnusedGlobalSymbols - walkTokens is called by Marked
const hljsExtension = {
    useNewRenderer: true, // -> renderer gets token as object (with all/additional properties), instead of fixed parameters

    // Overwrite walkTokens. When we encounter a known code block, we highlight it.
    // Note: Usually you want to do that in the renderer, however, Marked.js does not support async renderer functions.
    // See https://github.com/markedjs/marked/issues/458 and https://github.com/markedjs/marked/pull/2474 for details.
    walkTokens(token) {
        if (token.type === 'code') {
            const langString = (token.lang || '').match(/^\S*/)?.[0];

            const language = hljs.getLanguage(langString);
            if (language) {
                token.langString = langString;
                token.langDisplay = language.name;
                token.highlightedCode = hljs.highlight(token.text, {language: langString}).value;
            }
        }
    },
    renderer: {
        code(token) {
            if (token.highlightedCode) {
                // Note: Usually, the root container (the <code> tag) should have class="hljs" to apply hljs's
                //       themes. As we already have good styling, we omit that deliberately.
                return '' +
                    '<div class="highlightedCode">\n' +
                    `   <span class="language">${token.langDisplay}</span>\n` +
                    `   <pre><code class="language-${token.langString}">${token.highlightedCode}</code></pre>\n` +
                    '</div>';
            }

            return false;
        }
    }
};

export default hljsExtension;
