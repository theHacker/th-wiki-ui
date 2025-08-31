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

/**
 * Escapes special characters for usage inside an HTML tag (`&`, `<`, `>`).
 *
 * @param {string} str input string
 * @returns {string} escaped string
 */
function escapeHtmlText(str) {
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
 */
function escapeHtmlAttribute(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Capitalizes the first letter of a string and lowercases the rest.
 *
 * @param {string} str input string
 * @returns {string} capitalized string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export { trimIndent, escapeHtmlText, escapeHtmlAttribute, capitalize };
