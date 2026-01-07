function serializeEnumValue(symbol, enumObject) {
    if (typeof enumObject !== 'object' || !enumObject) {
        throw new Error('Illegal enumObject');
    }

    const key = Object
        .keys(enumObject)
        .find(k => enumObject[k] === symbol);

    if (key) {
        return key.toLowerCase().replaceAll('_', '-');
    } else {
        return null;
    }
}

function deserializeEnumValue(string, enumObject) {
    if (typeof enumObject !== 'object' || !enumObject) {
        throw new Error('Illegal enumObject');
    }
    if (typeof string !== 'string') {
        throw new Error(`Invalid value "${string}".`);
    }

    const key = string.toUpperCase().replaceAll('-', '_');

    return enumObject[key] || null;
}

export { serializeEnumValue, deserializeEnumValue };
