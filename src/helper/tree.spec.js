import {describe, it, expect} from 'vitest';
import {treeifyArray} from './tree.js';

describe('treeifyArray()', () => {

    describe('flat hierarchies', () => {

        it('returns an empty list in case of empty input', () => {
            const noop = (_object) => "";
            const result = treeifyArray([], noop, noop, noop);

            expect(result).toStrictEqual([]);
        });

        it('returns all objects sorted linearly, when there is no parentId set anywhere', () => {
            const objects = [
                { id: 1, title: "Hello", parentId: null },
                { id: 2, title: "Foo", parentId: null },
                { id: 3, title: "Bar", parentId: null },
                { id: 4, title: "Zzz", parentId: null },
                { id: 5, title: "Aaa", parentId: null }
            ]
            const result = treeifyArray(objects, obj => obj.id, obj => obj.parentId, obj => obj.title);

            expect(result).toStrictEqual([
                { id: 5, title: "Aaa", parentId: null, level: 1, lines: '┌' },
                { id: 3, title: "Bar", parentId: null, level: 1, lines: '├' },
                { id: 2, title: "Foo", parentId: null, level: 1, lines: '├' },
                { id: 1, title: "Hello", parentId: null, level: 1, lines: '├' },
                { id: 4, title: "Zzz", parentId: null, level: 1, lines: '└' }
            ]);
        });

        it('returns all properties the objects have, plus level and lines', () => {
            const objects = [
                { id: 1, title: "Foo", parentId: null, foo: true, bar: 42 },
                { id: 2, title: "Bar", parentId: null, foo: false, bazzzz: "4711", tags: ['red', 'green'] }
            ]
            const result = treeifyArray(objects, obj => obj.id, obj => obj.parentId, obj => obj.title);

            expect(result).toStrictEqual([
                {
                    id: 2, title: "Bar", parentId: null, foo: false, bazzzz: "4711", tags: ['red', 'green'],
                    level: 1, lines: '┌'
                },
                {
                    id: 1, title: "Foo", parentId: null, foo: true, bar: 42,
                    level: 1, lines: '└'
                }
            ]);
        });

        it('a tree with only one element has no lines', () => {
            const objects = [
                { id: 1, title: "Single", parentId: null }
            ]
            const result = treeifyArray(objects, obj => obj.id, obj => obj.parentId, obj => obj.title);

            expect(result).toStrictEqual([
                { id: 1, title: "Single", parentId: null, level: 1, lines: ' ' }
            ]);
        });
    });

    describe('deep hierarchies', () => {

        it('sorted all items correctly into the tree structure correctly, one level only', () => {
            const objects = [
                { id: 1, title: "Hello", parentId: 5 },
                { id: 2, title: "Foo", parentId: 4 },
                { id: 3, title: "Bar", parentId: 5 },
                { id: 4, title: "Zzz", parentId: null },
                { id: 5, title: "Aaa", parentId: null }
            ]
            const result = treeifyArray(objects, obj => obj.id, obj => obj.parentId, obj => obj.title);

            /*
             * ┌ Aaa
             * │ ├ Bar
             * │ └ Hello
             * └ Zzz
             *   └ Foo
             */
            expect(result).toStrictEqual([
                { id: 5, title: "Aaa", parentId: null, level: 1, lines: '┌' },
                { id: 3, title: "Bar", parentId: 5, level: 2, lines: '│├' },
                { id: 1, title: "Hello", parentId: 5, level: 2, lines: '│└' },
                { id: 4, title: "Zzz", parentId: null, level: 1, lines: '└' },
                { id: 2, title: "Foo", parentId: 4, level: 2, lines: ' └' }
            ]);
        });

        it('creates the tree structure correctly, multiple levels', () => {
            const objects = [
                { id: 1, title: "A", parentId: null },
                { id: 2, title: "B", parentId: null },
                { id: 3, title: "C", parentId: null },
                { id: 4, title: "D", parentId: null },
                { id: 40, title: "D3", parentId: 4 },
                { id: 41, title: "D1", parentId: 4 },
                { id: 42, title: "D2", parentId: 4 },
                { id: 30, title: "C1", parentId: 3 },
                { id: 420, title: "D21", parentId: 42 },
                { id: 421, title: "D22", parentId: 42 },
                { id: 422, title: "D23", parentId: 42 },
                { id: 4220, title: "D231", parentId: 422 },
                { id: 4221, title: "D232", parentId: 422 },
                { id: 10, title: "A1", parentId: 1 },
                { id: 100, title: "A11", parentId: 10 },
                { id: 101, title: "A12", parentId: 10 }
            ]
            const result = treeifyArray(objects, obj => obj.id, obj => obj.parentId, obj => obj.title);

            /*
             * ┌ A
             * │ └ A1
             * │   ├ A11
             * │   └ A12
             * ├ B
             * ├ C
             * │ └ C1
             * └ D
             *   ├ D1
             *   ├ D2
             *   │ ├ D21
             *   │ ├ D22
             *   │ └ D23
             *   │   ├ D231
             *   │   └ D232
             *   └ D3
             */
            expect(result).toStrictEqual([
                { id: 1, title: "A", parentId: null, level: 1, lines: '┌' },
                { id: 10, title: "A1", parentId: 1, level: 2, lines: '│└' },
                { id: 100, title: "A11", parentId: 10, level: 3, lines: '│ ├' },
                { id: 101, title: "A12", parentId: 10, level: 3, lines: '│ └' },
                { id: 2, title: "B", parentId: null, level: 1, lines: '├' },
                { id: 3, title: "C", parentId: null, level: 1, lines: '├' },
                { id: 30, title: "C1", parentId: 3, level: 2, lines: '│└' },
                { id: 4, title: "D", parentId: null, level: 1, lines: '└' },
                { id: 41, title: "D1", parentId: 4, level: 2, lines: ' ├' },
                { id: 42, title: "D2", parentId: 4, level: 2, lines: ' ├' },
                { id: 420, title: "D21", parentId: 42, level: 3, lines: ' │├' },
                { id: 421, title: "D22", parentId: 42, level: 3, lines: ' │├' },
                { id: 422, title: "D23", parentId: 42, level: 3, lines: ' │└' },
                { id: 4220, title: "D231", parentId: 422, level: 4, lines: ' │ ├' },
                { id: 4221, title: "D232", parentId: 422, level: 4, lines: ' │ └' },
                { id: 40, title: "D3", parentId: 4, level: 2, lines: ' └' }
            ]);
        });
    });

    // TODO implement cycles and orphan detection. For now, this suffices.
    describe.skip('cycles', () => {

        it('fails for a simple cycle', () => {
            const objects = [
                { id: 1, title: "Boooom", parentId: 1 }
            ]
            const testBody = () => treeifyArray(objects, obj => obj.id, obj => obj.parentId, obj => obj.title);

            expect(testBody).toThrow("Cycle detected: ID 1 --> ID 1");
        });

        it('fails for a cycle over 2 objects', () => {
            const objects = [
                { id: 1, title: "Chicken", parentId: 2 },
                { id: 2, title: "Egg", parentId: 1 }
            ]
            const testBody = () => treeifyArray(objects, obj => obj.id, obj => obj.parentId, obj => obj.title);

            expect(testBody).toThrow("Cycle detected: ID 2 --> ID 1 --> ID 2");
        });

        it('fails for a complex cycle hidden in multiple objects', () => {
            const objects = [
                { id: 1, title: "A", parentId: null },
                { id: 2, title: "B", parentId: null },
                { id: 3, title: "C", parentId: null },
                { id: 4, title: "D", parentId: 83 }, // <- problem
                { id: 5, title: "C1", parentId: 3 },
                { id: 6, title: "C2", parentId: 3 },
                { id: 7, title: "D1", parentId: 4 },
                { id: 8, title: "D2", parentId: 4 },
                { id: 80, title: "Cycle 1", parentId: 8 },
                { id: 81, title: "Cycle 2", parentId: 80 },
                { id: 82, title: "Cycle 3", parentId: 81 },
                { id: 83, title: "Cycle 4", parentId: 82 }
            ]
            const testBody = () => treeifyArray(objects, obj => obj.id, obj => obj.parentId, obj => obj.title);

            expect(testBody).toThrow("Cycle detected: ID 4 --> ID 83 --> ID 82 --> ID 81 --> ID 80 --> ID 8 --> ID 4");
        });
    });

    // TODO implement cycles and orphan detection. For now, this suffices.
    describe.skip('orphans', () => {

        it('fails for a simple orphan', () => {
            const objects = [
                { id: 1, title: "Boooom", parentId: 2 }
            ]
            const testBody = () => treeifyArray(objects, obj => obj.id, obj => obj.parentId, obj => obj.title);

            expect(testBody).toThrow("Orphan detected: ID 1 --> ID 2 (not existing)");
        });

        it('fails for an orphan over multiple levels', () => {
            const objects = [
                { id: 1, title: "Level 1", parentId: 2 },
                { id: 2, title: "Level 2", parentId: 3 },
                { id: 3, title: "Level 3", parentId: 4 }
            ]
            const testBody = () => treeifyArray(objects, obj => obj.id, obj => obj.parentId, obj => obj.title);

            expect(testBody).toThrow("Orphan detected: ID 1 --> ID 2 --> ID 3 --> ID 4 (not existing)");
        });
    });
});
