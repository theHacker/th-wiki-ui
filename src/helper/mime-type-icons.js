/**
 * Returns a Font Awesome icon for a given MIME Type.
 *
 * @param {?String} mimeType MIME Type
 * @returns {String} Icon name
 */
function getIconForMimeType(mimeType) {
    // None

    if (!mimeType) return 'file';

    // Concrete MIME Types

    if (mimeType === 'text/css') return 'file-code';
    if (mimeType === 'text/markdown') return 'file-code';
    if (mimeType === 'text/html') return 'file-code';
    if (mimeType === 'text/xml') return 'file-code';

    if (mimeType === 'text/csv') return 'file-csv';
    if (mimeType === 'application/pdf') return 'file-pdf';
    if (mimeType === 'application/zip') return 'file-zipper';

    // Fallbacks by MIME Types

    if (mimeType.startsWith('audio/')) return 'file-audio';
    if (mimeType.startsWith('image/')) return 'file-image';
    if (mimeType.startsWith('message/')) return 'envelope';
    if (mimeType.startsWith('text/')) return 'file-lines';
    if (mimeType.startsWith('video/')) return 'file-video';

    // Final fallback

    return 'file';
}

export {getIconForMimeType};
