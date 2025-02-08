/**
 * Transforms an array of objects with `id` and `parentId` properties into a tree structure.
 * The result will still be a flat array, however the items are properly ordered and assign additional `level`
 * and `lines` properties to be rendered as a tree.
 *
 * `idProp` and `parentIdProp` must return the same types, e.g. String or Number.
 * `sortBy` typically resolves to a title or timestamp.
 *
 * @param {Array<Object>} objects Objects to transform
 * @param {function(Object): String} idProp Function how to extract the `id` property from an object
 * @param {function(Object): String|null} parentIdProp Function how to extract the `parentId` property from an object
 * @param {function(Object): String} sortBy Function how to extract a string to which objects are sorted by
 * @returns {Array<*>} Flat array with additional properties
 */
function treeifyArray(objects, idProp, parentIdProp, sortBy) {
    const root = arrayToTree(objects, idProp, parentIdProp, sortBy);
    const array = treeToFlatArray(root);

    return addTreeLines(array);
}

/**
 * Transforms an array of objects with `id` and `parentId` properties into a tree structure.
 *
 * `idProp` and `parentIdProp` must return the same types, e.g. String or Number.
 * `sortBy` typically resolves to a title or timestamp.
 *
 * @param {Array<Object>} objects Objects to transform
 * @param {function(Object): String} idProp Function how to extract the `id` property from an object
 * @param {function(Object): String|null} parentIdProp Function how to extract the `parentId` property from an object
 * @param {function(Object): String} sortBy Function how to extract a string to which objects are sorted by
 * @returns {{root: Boolean|null, level: Number, children: Array<*>}} Tree structure
 */
function arrayToTree(objects, idProp, parentIdProp, sortBy) {
    const root = {
        root: true,
        level: 0,
        children: []
    };

    // holds objects still to process, i.e. not inside the finished tree
    const openList = new Set([...objects]);

    // gives a "by id" reference into the finished tree, i.e. contains all nodes inside the tree
    const closedMap = { null: root };

    // Build the tree level by level; O(n^2) – for sure, could be improved ;-)
    for (let level = 1; openList.size > 0; level++) {
        if (level > objects.length || openList.size === 0) break;

        openList.forEach(item => {
            const id = idProp(item);
            const parentId = parentIdProp(item);

            // When the parent is already inside the tree, attach yourselves as child there.
            const parentNode = closedMap[parentId];

            if (parentNode && parentNode.level + 1 === level) {
                const childNode = {
                    ...item,
                    level,
                    children: []
                };

                parentNode.children.push(childNode);

                openList.delete(item);
                closedMap[id] = childNode;
            }
        });
    }

    // Sort each nodes children
    Object.values(closedMap).forEach(node => {
        node.children.sort((a, b) => sortBy(a).localeCompare(sortBy(b)));
    });

    // TODO implement cycles and orphan detection. For now, this suffices.

    return root;
}

/**
 * Transforms a tree (calculated by `arrayToTree()`) to a flat list
 * which can easily be iterated.
 *
 * @param {{root: Boolean|null, level: Number, children: Array<*>}} tree Tree structure
 * @param {Array<*>} flatList input structure (used internally for recursion, start with an empty array)
 * @returns {*[]} flat array
 */
function treeToFlatArray(tree, flatList = []) {
    const { children, ...item } = tree;

    if (!item.root) {
        flatList.push(item);
    }

    for (const child of children) {
        treeToFlatArray(child, flatList);
    }

    return flatList;
}

/**
 * Add the `lines` properties to a flat array representing a tree (calculated by `treeToFlatArray()`).
 * The `lines` properties contains a character (from the CP437 border characters) for each level how to render
 * the tree visually. Possible characters are: empty (' '), branching ('├'), ending ('└') or parallel ('│').
 *
 * @param {Array<*>} array Tree structure as flat array
 * @returns {*[]} `array` (input will be altered) with lines
 */
function addTreeLines(array) {
    // Initial pass-through: Find max level and initialize lines string
    let maxLevel = 0;
    for (const item of array) {
        if (item.level > maxLevel) {
            maxLevel = item.level;
        }

        item.lines = '';
    }

    // Go by each level
    for (let level = 1; level <= maxLevel; level++) {
        for (let itemIndex = 0; itemIndex < array.length; itemIndex++){
            const item = array[itemIndex];

            // Skip if the item is not that deep
            if (item.level < level) {
                continue;
            }

            // First level upper bound is special
            if (itemIndex === 0 && level === 1) {
                if (array.length === 1) {
                    item.lines += ' '; // no line if there is exactly one item on the whole tree
                } else {
                    item.lines += '┌';
                }
                continue;
            }

            // Determine if we are the last item on this parent.
            // For this we need to iterate to the next item on our current level.
            let nextItemIndex = itemIndex + 1;
            let last;
            while (true) {
                const nextItem = nextItemIndex < array.length ? array[nextItemIndex] : null;
                if (nextItem === null) {
                    // end of tree -> so we are last
                    last = true;
                    break;
                }

                if (nextItem.level > level) {
                    // still inside the parent sub-tree -> continue
                    nextItemIndex++;
                    continue;
                }

                if (nextItem.level < level) {
                    // left the current sub-tree -> so we are last
                    last = true;
                    break;
                }

                // item on the same level -> so we are not last
                last = false;
                break;
            }

            if (item.level === level) {
                if (last) {
                    item.lines += '└';
                } else {
                    item.lines += '├';
                }
            } else {
                if (last) {
                    item.lines += ' ';
                } else {
                    item.lines += '│';
                }
            }
        }
    }

    // Invariant: array.forEach(item => assert(item.level === item.lines.length))

    return array;
}

export {treeifyArray};
