/**
 * Generates the extension.
 *
 * @param {Array} outlineReceiver receives the outline with the generated IDs
 * @returns {{renderer: {heading(*): string}}} Marked.js extension
 */
const headingsExtension = (outlineReceiver = []) => ({
    renderer: {
        heading(token) {
            const {tokens, depth} = token;

            const parsedText = this.parser.parseInline(tokens);
            const plainText = parsedText
                .replace(/<[^>]+>/g, '') // remove HTML tags
                .replace(/&([a-z]+)|(#[0-9]+);/gi, ''); // remove HTML entities

            // Lowercase, replace spaces with hyphens, and remove all unwanted characters
            let id = plainText
                .toLowerCase()
                .replaceAll(' ', '-')
                .replace(/[^a-z0-9-]/g, '');

            // Trimming
            id = id
                .replace(/-+/g, '-') // eliminate multiple hyphens in a row
                .replace(/^-/, '') // remove hyphens at beginning...
                .replace(/-$/, ''); // ...and end

            // Empty ID will be replaced
            if (id === '') {
                id = 'empty';
            }

            // Don't generate duplicates
            if (!this.alreadyGeneratedHeadingIds) {
                this.alreadyGeneratedHeadingIds = new Set();
            }

            let uniqueId = id;
            let counter = 1;
            while (this.alreadyGeneratedHeadingIds.has(uniqueId)) {
                uniqueId = `${id}-${++counter}`;
            }
            this.alreadyGeneratedHeadingIds.add(uniqueId);

            // Note down the outline, so the caller can access it
            this.currentLevel = (this.currentLevel !== undefined) ? this.currentLevel : 1;

            const outlineEntry = {
                titleHtml: parsedText,
                titlePlain: plainText,
                id: uniqueId
            };

            if (depth < this.currentLevel || depth === this.currentLevel || depth === this.currentLevel + 1) {
                outlineEntry.level = depth;
            } else {
                outlineEntry.level = this.currentLevel + 1;
                outlineEntry.hadIncorrectLevel = depth;
            }
            this.currentLevel = outlineEntry.level;

            outlineReceiver.push(outlineEntry);

            // Render
            return `<h${depth} id="${uniqueId}">${parsedText}</h${depth}>` + '\n';
        }
    }
});

export {headingsExtension};
