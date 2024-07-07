/**
 * Transforms an array of objects with `id` and `parentId` properties into a tree structure.
 *
 * `idProp` and `parentIdProp` must return the same types, e.g. String or Number.
 * `sortBy` typically resolves to a title or timestamp.
 *
 * @param {Array<Object>} objects Objects to transform
 * @param {function(Object): Any>} idProp Function how to extract the `id` property from an object
 * @param {function(Object): String|null>} parentIdProp Function how to extract the `parentId` property from an object
 * @param {function(Object): String>} sortBy Function how to extract a string to which objects are sorted by
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

export {arrayToTree, treeToFlatArray};
