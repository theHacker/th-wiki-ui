import {describe, expect, it} from 'vitest';
import {sortTags, toSortedTags} from './sort-tags.js';

describe('sortTags()', () => {

    /**
     * Performs the test, testing both sortTags() and toSortedTags().
     * @param {Array<Object>} tags tags to be sorted
     * @param {Array<Object>} expectedSortedTags expected array of sorted tags
     */
    function test(tags, expectedSortedTags) {
        it('sortTags() has correct result', () => {
            sortTags(tags);

            expect(tags).toEqual(expectedSortedTags);
        });

        it('toSortedTags() has correct result and does not change the original array', () => {
            const copyOfTags = [...tags];

            const result = toSortedTags(copyOfTags);

            expect(result).toEqual(expectedSortedTags);
            expect(copyOfTags).toEqual(tags); // input must not been changed
        });
    }

    describe('sorts alphabetically by title', () => {
        const tags = [
            { scope: '', title: 'Development', titleColor: 'green' },
            { scope: '', title: 'Production', titleColor: 'red' },
            { scope: '', title: 'Testing', titleColor: 'yellow' },
            { scope: '', title: 'Edit', titleColor: 'info' },
            { scope: '', title: 'TODO', titleColor: 'blue' },
            { scope: '', title: 'Make', titleColor: 'pink' },
            { scope: '', title: 'C++', titleColor: 'cyan' },
            { scope: '', title: 'New', titleColor: 'success' }
        ];

        test(tags, [
            { scope: '', title: 'C++', titleColor: 'cyan' },
            { scope: '', title: 'Development', titleColor: 'green' },
            { scope: '', title: 'Edit', titleColor: 'info' },
            { scope: '', title: 'Make', titleColor: 'pink' },
            { scope: '', title: 'New', titleColor: 'success' },
            { scope: '', title: 'Production', titleColor: 'red' },
            { scope: '', title: 'Testing', titleColor: 'yellow' },
            { scope: '', title: 'TODO', titleColor: 'blue' }
        ]);
    });

    describe('sorts case-insensitive', () => {
        const tags = [
            { scope: '', title: 'C++', titleColor: '#00f' },
            { scope: '', title: 'make', titleColor: '#f00' },
            { scope: '', title: ' leading space', titleColor: '#000' },
            { scope: '', title: 'aaaaaa', titleColor: '#aaa' },
            { scope: '', title: 'ZZZZZZ', titleColor: '#fff' },
            { scope: '', title: '    moooore leading spaces', titleColor: '#001' },
            { scope: '', title: 'a', titleColor: '#aa0' },
            { scope: '', title: 'aaaaaaaaaaa', titleColor: '#aaf' },
            { scope: '', title: 'AAAAAAAAAAA', titleColor: '#faa' }
        ];

        test(tags, [
            { scope: '', title: '    moooore leading spaces', titleColor: '#001' },
            { scope: '', title: ' leading space', titleColor: '#000' },
            { scope: '', title: 'a', titleColor: '#aa0' },
            { scope: '', title: 'aaaaaa', titleColor: '#aaa' },
            { scope: '', title: 'aaaaaaaaaaa', titleColor: '#aaf' },
            { scope: '', title: 'AAAAAAAAAAA', titleColor: '#faa' },
            { scope: '', title: 'C++', titleColor: '#00f' },
            { scope: '', title: 'make', titleColor: '#f00' },
            { scope: '', title: 'ZZZZZZ', titleColor: '#fff' }
        ]);
    });

    describe('sorts alphabetically by scope first (no scope first)', () => {
        const tags = [
            { scope: 'Repository', title: 'Backend', scopeColor: 'aqua', titleColor: 'yellow' },
            { scope: 'Component', title: 'Issues', scopeColor: 'green', titleColor: 'white' },
            { scope: '', title: 'XXX', titleColor: '#000' },
            { scope: 'Environment', title: 'Production', scopeColor: 'white', titleColor: 'red' },
            { scope: 'Component', title: 'Wiki', scopeColor: 'green', titleColor: 'blue' },
            { scope: '', title: 'TODO', titleColor: '#f50' },
            { scope: 'Repository', title: 'Frontend', scopeColor: 'aqua', titleColor: 'brown' },
            { scope: 'Environment', title: 'Development', scopeColor: 'white', titleColor: 'green' },
            { scope: '', title: 'Refactoring', titleColor: '#79f' },
            { scope: 'Component', title: 'Administration', scopeColor: 'green', titleColor: 'orange' }
        ];

        test(tags, [
            { scope: '', title: 'Refactoring', titleColor: '#79f' },
            { scope: '', title: 'TODO', titleColor: '#f50' },
            { scope: '', title: 'XXX', titleColor: '#000' },
            { scope: 'Component', title: 'Administration', scopeColor: 'green', titleColor: 'orange' },
            { scope: 'Component', title: 'Issues', scopeColor: 'green', titleColor: 'white' },
            { scope: 'Component', title: 'Wiki', scopeColor: 'green', titleColor: 'blue' },
            { scope: 'Environment', title: 'Development', scopeColor: 'white', titleColor: 'green' },
            { scope: 'Environment', title: 'Production', scopeColor: 'white', titleColor: 'red' },
            { scope: 'Repository', title: 'Backend', scopeColor: 'aqua', titleColor: 'yellow' },
            { scope: 'Repository', title: 'Frontend', scopeColor: 'aqua', titleColor: 'brown' }
        ]);
    });

    describe('keeps the properties (even with additional non-tag-y ones)', () => {
        const tags = [
            {
                id: '12345678-0000-0000-0000-fedcba987654',
                scope: 'Foo',
                scopeColor: 'green',
                scopeIcon: 'check',
                title: 'any string',
                titleColor: 'danger',
                titleIcon: 'check-double',
                description: 'some description to write sth here ;-)'
            },
            {
                id: 'ffeeddcc-2222-4444-8888-001122334455',
                scope: 'Bar',
                scopeColor: 'red',
                scopeIcon: 'egg',
                title: 'some other string',
                titleColor: 'success',
                titleIcon: 'chess-king',
                description: 'yet another description',
                even: 'more properties',
                answer: 42,
                should: {
                    be: 'untouched'
                }
            }
        ];

        test(tags, [
            {
                id: 'ffeeddcc-2222-4444-8888-001122334455',
                scope: 'Bar',
                scopeColor: 'red',
                scopeIcon: 'egg',
                title: 'some other string',
                titleColor: 'success',
                titleIcon: 'chess-king',
                description: 'yet another description',
                even: 'more properties',
                answer: 42,
                should: {
                    be: 'untouched'
                }
            },
            {
                id: '12345678-0000-0000-0000-fedcba987654',
                scope: 'Foo',
                scopeColor: 'green',
                scopeIcon: 'check',
                title: 'any string',
                titleColor: 'danger',
                titleIcon: 'check-double',
                description: 'some description to write sth here ;-)'
            }
        ]);
    });
});
