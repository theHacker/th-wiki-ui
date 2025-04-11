/**
 * Converts bytes to a human-readable string using IEC units (KiB, MiB, etc).
 * Automatically formats decimals based on size.
 *
 * @param {number} bytes Number of bytes
 * @returns {string | null} Human-readable string (e.g. "4.50 MiB", "1 Byte", "0.9 KiB"), or `null` for invalid input
 */
function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return null;
    if (!Number.isInteger(bytes)) return null;
    if (bytes < 0) return null;

    const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB'];
    const k = 1024;
    const threshold = 0.9;

    if (bytes === 0) return '0 bytes';
    if (bytes === 1) return '1 byte';
    if (bytes < threshold * k) return `${bytes} bytes`;

    let value = bytes;
    let unitIndex;

    for (unitIndex = 0; unitIndex < units.length - 1; unitIndex++) {
        const nextValue = value / k;
        if (nextValue < threshold) break;

        value = nextValue;
    }

    const decimals = unitIndex === 1 ? 1 : 2;
    return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}

export {formatBytes};
