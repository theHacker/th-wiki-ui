/**
 * Finds a sibling node with a CSS selector (like closest() but "sideways" in the tree)
 *
 * @param {Element} element - Reference element
 * @param {string} selector - CSS selector to match
 * @param {'next'|'previous'} [direction='next'] - Search direction
 * @returns {Element|null} First matching sibling or `null` if there none
 */
function findSibling(element, selector, direction = 'next') {
    let sibling = direction === 'next'
        ? element.nextElementSibling
        : element.previousElementSibling;

    while (sibling) {
        if (sibling.matches(selector)) return sibling;

        sibling = direction === 'next'
            ? sibling.nextElementSibling
            : sibling.previousElementSibling;
    }

    return null;
}

export { findSibling };
