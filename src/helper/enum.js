function enumSymbolToString(symbol, enumObject) {
    if (typeof enumObject !== 'object' || !enumObject) {
        throw new Error('Illegal enumObject');
    }

    return Object.keys(enumObject)
        .find(key => enumObject[key] === symbol) || null;
}

function stringToEnumSymbolToString(string, enumObject) {
    if (typeof enumObject !== 'object' || !enumObject) {
        throw new Error('Illegal enumObject');
    }

    return enumObject[string] || null;
}

export { enumSymbolToString, stringToEnumSymbolToString };
