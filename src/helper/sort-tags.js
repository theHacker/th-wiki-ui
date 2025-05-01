/** Compare function for sorting tags */
const tagCompareFn = (a, b) => {
    if (a.scope === '' && b.scope !== '') return -1;
    if (b.scope === '' && a.scope !== '') return 1;

    let c = a.scope.localeCompare(b.scope);
    if (c !== 0) {
        return c;
    }

    return a.title.localeCompare(b.title);
};

/**
 * Sorts an array of tags in place.
 *
 * @param {Array<{scope: String, title: String}>} tags Tags to be sorted
 */
function sortTags(tags) {
    tags.sort(tagCompareFn);
}

/**
 * Sorts an array of tag and returns the result as a copy, i.e. not changing the original array.
 *
 * @param {Array<{scope: String, title: String}>} tags Tags to be sorted
 * @returns {Array<*>} Sorted tags
 */
function toSortedTags(tags) {
    return tags.toSorted(tagCompareFn);
}

export {sortTags, toSortedTags};
