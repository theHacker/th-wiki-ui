/**
 * Generic tree structure, helping us with array vs. tree conversions.
 * It works with a synthetic root node.
 *
 * Note: This implementation is rudimentary, and directly exposes its internals,
 * so don't tinker with them 😉
 */
class Tree {

    /**
     * @param {Object} options
     * @param {Array<Object>} options.items input items to form the tree from
     * @param {(function(Object): String) | undefined} options.idFunction function to extract an items ID, defaults to `id` property
     * @param {(function(Object): String|null) | undefined} options.parentIdFunction function to extract an items parentId,
     *                                                                               defaults to `parentId` property
     * @param {(function(Object, Object): Number) | undefined} options.sortFunction sort function to sort two nodes,
     *                                                                              if not supplied there is no sorting
     */
    constructor(options) {
        if (!options.idFunction) {
            options.idFunction = (item) => item.id;
        }
        if (!options.parentIdFunction) {
            options.parentIdFunction = (item) => item.parentId;
        }

        this._initTree(options);
    }

    _initTree(options) {
        // this.nodesCount = objectsAsArray.length;
        const rootNode = {
            root: true,
            level: 0,
            childrenNodes: [],
            parentNode: null
        };

        // holds items still to process, i.e. not inside the finished tree
        const openList = new Set([...options.items]);

        // gives a "by id" reference into the finished tree, i.e. contains all nodes inside the tree
        const closedMap = { null: rootNode };

        // Build the tree level by level; O(n^2) – for sure, could be improved ;-)
        for (let level = 1; openList.size > 0; level++) {
            if (level > options.items.length || openList.size === 0) break;

            openList.forEach(item => {
                const id = options.idFunction(item);
                const parentId = options.parentIdFunction(item) || null;

                // When the parent is already inside the tree, attach yourselves as child there.
                const parentNode = closedMap[parentId];

                if (parentNode && parentNode.level + 1 === level) {
                    const childNode = {
                        ...item,
                        level,
                        childrenNodes: [],
                        parentNode
                    };

                    parentNode.childrenNodes.push(childNode);

                    openList.delete(item);
                    closedMap[id] = childNode;
                }
            });
        }

        // Sort each nodes children
        if (options.sortFunction) {
            Object.values(closedMap).forEach(node => {
                node.childrenNodes.sort((a, b) => options.sortFunction(a, b));
            });
        }

        // Remove rootNode from closedMap, then the closedMap contains all nodes.
        delete closedMap[null];

        // Expose results
        this.rootNode = rootNode;
        this.nodesById = closedMap;
        this.nodesCount = Object.keys(closedMap).length;

        // TODO implement cycles and orphan detection. For now, this suffices.
    }

    /**
     * Checks if a node is the parent of another.
     *
     * @param {*} nodeId ID of node to check
     * @param {*} otherNodeId ID of the other node
     * @returns {boolean} `true` if `node` is the parent of `otherNode`
     */
    isParent(nodeId, otherNodeId) {
        const node = this._getNodeOrThrow(nodeId);
        const otherNode = this._getNodeOrThrow(otherNodeId);

        return (node === otherNode.parentNode);
    }

    /**
     * Checks if a node is a child of another.
     *
     * @param {*} nodeId ID of node to check
     * @param {*} otherNodeId ID of the other node
     * @returns {boolean} `true` if `node` is a child of `otherNode`
     */
    isChild(nodeId, otherNodeId) {
        return this.isParent(otherNodeId, nodeId);
    }

    /**
     * Checks if a node is a descendant of another.
     *
     * @param {*} nodeId ID of node to check
     * @param {*} otherNodeId ID of the other node
     * @returns {boolean} `true` if `node` is a descendant of `otherNode`
     */
    isDescendant(nodeId, otherNodeId) {
        let node = this._getNodeOrThrow(nodeId);
        const otherNode = this._getNodeOrThrow(otherNodeId);

        if (node === otherNode) {
            return false;
        }

        while (node.parentNode !== null) {
            if (node === otherNode) {
                return true;
            }

            node = node.parentNode;
        }

        return (node === otherNode);
    }

    /**
     * Checks if a node is an ancestor of another.
     *
     * @param {*} nodeId ID of node to check
     * @param {*} otherNodeId ID of the other node
     * @returns {boolean} `true` if `node` is an ancestor of `otherNode`
     */
    isAncestor(nodeId, otherNodeId) {
        return this.isDescendant(otherNodeId, nodeId);
    }

    /**
     * Checks if a node is a sibling of another.
     *
     * @param {*} nodeId ID of node to check
     * @param {*} otherNodeId ID of the other node
     * @returns {boolean} `true` if `node` is a sibling of `otherNode`
     */
    isSibling(nodeId, otherNodeId) {
        const node = this._getNodeOrThrow(nodeId);
        const otherNode = this._getNodeOrThrow(otherNodeId);

        return ((node.parentNode === otherNode.parentNode) && (node !== otherNode));
    }

    _getNodeOrThrow(nodeId) {
        if (nodeId === null) {
            return this.rootNode;
        }

        const node = this.nodesById[nodeId];
        if (!node) {
            throw new Error(`There is no node '${nodeId}' in the tree.`);
        }

        return node;
    }

    /**
     * Iterates the tree. Starting from the root node node, each child node is visited, then their children.
     *
     * @param {function(*, Number)} callbackFunction Function to be called. Gets the node, and an index
     */
    forEach(callbackFunction) {
        this._forEach(this.rootNode, callbackFunction);
    }

    _forEach(startNode, callbackFunction) {
        for (let i = 0; i < startNode.childrenNodes.length; i++) {
            const childNode = startNode.childrenNodes[i];
            callbackFunction(childNode, i);
        }

        for (let i = 0; i < startNode.childrenNodes.length; i++) {
            const childNode = startNode.childrenNodes[i];
            this._forEach(childNode, callbackFunction);
        }
    }

    /**
     * Iterates the tree depth-first (DFS).
     *
     * @param {function(*, Number)} callbackFunction Function to be called. Gets the node, and an index
     */
    forEachDepthFirst(callbackFunction) {
        this._forEachDepthFirst(this.rootNode, callbackFunction);
    }

    _forEachDepthFirst(startNode, callbackFunction) {
        for (let i = 0; i < startNode.childrenNodes.length; i++) {
            const childNode = startNode.childrenNodes[i];

            callbackFunction(childNode, i);
            this._forEachDepthFirst(childNode, callbackFunction);
        }
    }

    /**
     * Iterates the tree breadth-first (BFS).
     *
     * @param {function(*, Number)} callbackFunction Function to be called. Gets the node, and an index
     */
    forEachBreadthFirst(callbackFunction) {
        const queue = [[this.rootNode, 0]];

        while (queue.length > 0) {
            const [node, index] = queue.shift();
            if (node !== this.rootNode) {
                callbackFunction(node, index);
            }

            for (let i = 0; i < node.childrenNodes.length; i++) {
                const childNode = node.childrenNodes[i];
                queue.push([childNode, i]);
            }
        }
    }

    /**
     * Transforms the tree into a linear array, applicable for example to render into a dropdown list.
     */
    toLinearArray() {
        const result = [];

        this.forEachDepthFirst(node => result.push({...node}));
        this._addTreeLines(result);

        return result;
    }

    /**
     * Add the `lines` properties to a linear array representing the tree (calculated by `toLinearArray()`).
     * The `lines` properties contains a character (from the CP437 border characters) for each level how to render
     * the tree visually. Possible characters are: empty (' '), branching ('├'), ending ('└') or parallel ('│').
     *
     * @param {Array<*>} array Tree structure as linear array
     * @returns {*[]} `array` (input will be altered) with lines
     */
    _addTreeLines(array) {
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
}

export {Tree};
