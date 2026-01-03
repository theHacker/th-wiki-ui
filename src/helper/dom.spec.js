import {describe, expect, it} from "vitest";
import {JSDOM} from "jsdom";
import {findSibling} from "@/helper/dom.js";

describe('findSibling()', () => {

    const dom = new JSDOM(`
        <div id="root">
            <span>TOP</span>
            <span>Find me top</span>
            <ul>
                <li>1</li>
                <li style="color: red;">2</li>
                <li>3</li>
                <li data-x="cool">4</li>
                <li class="foo">5</li>
            </ul>
            <span>Find me bottom</span>
            <span>BOTTOM</span>
        </div>
    `);
    const { document } = dom.window;

    it('returns null when there is no sibling at all', () => {
        const root = document.getElementById('root');

        expect(findSibling(root, '*')).toBeNull();
    });

    it('returns null when there is no matching sibling', () => {
        const firstLi = document.querySelector('ul').firstChild;

        expect(findSibling(firstLi, '#doesnt-exist')).toBeNull();
    });

    it('finds the correctly sibling per direction', () => {
        const ul = document.querySelector('ul');

        expect(findSibling(ul, 'span', 'previous')?.textContent).toBe('Find me top');
        expect(findSibling(ul, 'span', 'next')?.textContent).toBe('Find me bottom');
    });

    it('finds the correct node by selector', () => {
        const firstLi = document.querySelector('ul').firstChild;

        expect(findSibling(firstLi, '[style]')?.textContent).toBe('2');
        expect(findSibling(firstLi, '[data-x]')?.textContent).toBe('4');
        expect(findSibling(firstLi, '.foo')?.textContent).toBe('5');

        expect(findSibling(firstLi, '#doesnt-exist')).toBeNull();
    });
});
