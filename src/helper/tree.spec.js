import {describe, expect, it} from 'vitest';
import {Tree} from './tree.js';

describe('Tree', () => {

    describe('construction', () => {

        describe('successful construction', () => {

            it('constructs from an empty input', () => {
                const tree = new Tree({ items: [] });

                expect(tree.rootNode).toHaveProperty("root", true);
                expect(Object.keys(tree.nodesById)).toEqual([]);
                expect(tree.nodesCount).toBe(0);
            });

            it('constructs a simple tree with no parent at all', () => {
                const items = [
                    { id: 1, label: 'A' },
                    { id: 2, label: 'B' },
                    { id: 3, label: 'C' },
                    { id: 4, label: 'D' }
                ];
                const tree = new Tree({ items });

                expect(tree.rootNode).toHaveProperty("root", true);
                expect(Object.keys(tree.nodesById)).toEqual(["1", "2", "3", "4"]);
                expect(tree.nodesCount).toBe(4);
            });

            it('constructs all parentNode/childrenNodes and level correctly', () => {
                const items = [
                    { id: 1, label: 'A' },
                    { id: 2, label: 'B' },
                    { id: 3, label: 'C' },
                    { id: 11, label: 'AA', parentId: 1 },
                    { id: 12, label: 'AB', parentId: 1 },
                    { id: 21, label: 'BA', parentId: 2 },
                    { id: 22, label: 'BB', parentId: 2 },
                    { id: 221, label: 'BBA', parentId: 22 },
                    { id: 13, label: 'AC', parentId: 1 },
                    { id: 131, label: 'ACA', parentId: 13 },
                    { id: 1311, label: 'ACAA', parentId: 131 },
                    { id: 132, label: 'ACB', parentId: 13 }
                ];
                const tree = new Tree({ items });
                const root = tree.rootNode;

                expect(tree.nodesCount).toBe(12);

                // Level 0
                expect(root.parentNode).toBeNull();
                expect(root.level).toBe(0);

                // Level 1
                expect(root.childrenNodes.map(node => node.label)).toEqual(["A", "B", "C"]);
                expect(root.childrenNodes.every(node => node.level === 1)).toBe(true);
                expect(root.childrenNodes.every(node => node.parentNode === root)).toBe(true);

                // Level 2
                expect(root.childrenNodes[0].childrenNodes.map(node => node.label)).toEqual(["AA", "AB", "AC"]);
                expect(root.childrenNodes[0].childrenNodes.every(node => node.level === 2)).toBe(true);
                expect(root.childrenNodes[0].childrenNodes.every(node => node.parentNode === root.childrenNodes[0])).toBe(true);

                expect(root.childrenNodes[1].childrenNodes.map(node => node.label)).toEqual(["BA", "BB"]);
                expect(root.childrenNodes[1].childrenNodes.every(node => node.level === 2)).toBe(true);
                expect(root.childrenNodes[1].childrenNodes.every(node => node.parentNode === root.childrenNodes[1])).toBe(true);

                expect(root.childrenNodes[2].childrenNodes).toEqual([]);

                // Level 3
                expect(root.childrenNodes[0].childrenNodes[0].childrenNodes).toEqual([]);
                expect(root.childrenNodes[0].childrenNodes[1].childrenNodes).toEqual([]);

                expect(root.childrenNodes[0].childrenNodes[2].childrenNodes.map(node => node.label)).toEqual(["ACA", "ACB"]);
                expect(root.childrenNodes[0].childrenNodes[2].childrenNodes.every(node => node.level === 3)).toBe(true);
                expect(root.childrenNodes[0].childrenNodes[2].childrenNodes.every(node => node.parentNode === root.childrenNodes[0].childrenNodes[2])).toBe(true);

                expect(root.childrenNodes[1].childrenNodes[0].childrenNodes).toEqual([]);

                expect(root.childrenNodes[1].childrenNodes[1].childrenNodes.map(node => node.label)).toEqual(["BBA"]);
                expect(root.childrenNodes[1].childrenNodes[1].childrenNodes.every(node => node.level === 3)).toBe(true);
                expect(root.childrenNodes[1].childrenNodes[1].childrenNodes.every(node => node.parentNode === root.childrenNodes[1].childrenNodes[1])).toBe(true);

                // Level 4
                expect(root.childrenNodes[0].childrenNodes[2].childrenNodes[0].childrenNodes.map(node => node.label)).toEqual(["ACAA"]);
                expect(root.childrenNodes[0].childrenNodes[2].childrenNodes[0].childrenNodes.every(node => node.level === 4)).toBe(true);
                expect(root.childrenNodes[0].childrenNodes[2].childrenNodes[0].childrenNodes.every(node => node.parentNode === root.childrenNodes[0].childrenNodes[2].childrenNodes[0])).toBe(true);
            });

            it('can construct the tree even if children are defined before their parent', () => {
                const items = [
                    { id: 4711, role: 'CHILD', parentId: 42 },
                    { id: 42, role: 'PARENT' }
                ];
                const tree = new Tree({ items });

                expect(tree.nodesCount).toBe(2);
                expect(tree.rootNode.childrenNodes.map(node => node.role)).toEqual(["PARENT"]);
                expect(tree.rootNode.childrenNodes[0].childrenNodes.map(node => node.role)).toEqual(["CHILD"]);
            });
        });

        // TODO implement cycles and orphan detection. For now, this suffices.
        describe.skip('fails when cycles are detected', () => {

            it('fails for a simple cycle', () => {
                const items = [
                    { id: 1, title: "Boooom", parentId: 1 }
                ];
                const testBody = () => new Tree({ items });

                expect(testBody).toThrow("Cannot construct the tree, items contain a cycle: ID 1 --> ID 1");
            });

            it('fails for a cycle over 2 objects', () => {
                const items = [
                    { id: 1, title: "Chicken", parentId: 2 },
                    { id: 2, title: "Egg", parentId: 1 }
                ];
                const testBody = () => new Tree({ items });

                expect(testBody).toThrow("Cannot construct the tree, items contain a cycle: ID 2 --> ID 1 --> ID 2");
            });

            it('fails for a complex cycle hidden in multiple objects', () => {
                const items = [
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
                ];
                const testBody = () => new Tree({ items });

                expect(testBody).toThrow(
                    "Cannot construct the tree, items contain a cycle: ID 4 --> ID 83 --> ID 82 --> ID 81 --> ID 80 --> ID 8 --> ID 4"
                );
            });
        });

        // TODO implement cycles and orphan detection. For now, this suffices.
        describe.skip('fails when orphans are detected', () => {

            it('fails for a simple orphan', () => {
                const items = [
                    { id: 1, title: "Boooom", parentId: 2 }
                ];
                const testBody = () => new Tree({ items });

                expect(testBody).toThrow("Cannot construct the tree, items contain an orphan: ID 1 --> ID 2 (not existing)");
            });

            it('fails for an orphan over multiple levels', () => {
                const items = [
                    { id: 1, title: "Level 1", parentId: 2 },
                    { id: 2, title: "Level 2", parentId: 3 },
                    { id: 3, title: "Level 3", parentId: 4 }
                ];
                const testBody = () => new Tree({ items });

                expect(testBody).toThrow(
                    "Cannot construct the tree, items contain an orphan: ID 1 --> ID 2 --> ID 3 --> ID 4 (not existing)"
                );
            });
        });
    });

    describe('sorting', () => {

        describe('simple cases without any parents', () => {

            const items = [
                {id: 42, label: 'A', sort: 10},
                {id: 117, label: 'X', sort: 40},
                {id: 99, label: 'B', sort: 30},
                {id: 0, label: 'Y', sort: 25}
            ];

            it('takes the items in the order as-is when no sort function is supplied', () => {
                const tree = new Tree({items});
                expect(tree.rootNode.childrenNodes.map(node => node.label)).toEqual(["A", "X", "B", "Y"]);
            });

            it('sorts according to the sort function', () => {
                const tree = new Tree({items, sortFunction: (a, b) => a.sort - b.sort});
                expect(tree.rootNode.childrenNodes.map(node => node.label)).toEqual(["A", "Y", "B", "X"]);
            });
        });

        describe('complex cases with parents', () => {

            const items = [
                { id: 2, label: 'B' },
                { id: 132, label: 'ACB', parentId: 13 },
                { id: 3, label: 'C' },
                { id: 12, label: 'AB', parentId: 1 },
                { id: 11, label: 'AA', parentId: 1 },
                { id: 21, label: 'BA', parentId: 2 },
                { id: 1, label: 'A' },
                { id: 22, label: 'BB', parentId: 2 },
                { id: 1311, label: 'ACAA', parentId: 131 },
                { id: 131, label: 'ACA', parentId: 13 },
                { id: 13, label: 'AC', parentId: 1 },
                { id: 221, label: 'BBA', parentId: 22 }
            ];

            it('takes the items in the order as-is when no sort function is supplied', () => {
                const tree = new Tree({items});
                const root = tree.rootNode;

                expect(root.childrenNodes.map(node => node.label)).toEqual(["B", "C", "A"]);
                expect(root.childrenNodes[0].childrenNodes.map(node => node.label)).toEqual(["BA", "BB"]);
                expect(root.childrenNodes[2].childrenNodes.map(node => node.label)).toEqual(["AB", "AA", "AC"]);
                expect(root.childrenNodes[0].childrenNodes[1].childrenNodes.map(node => node.label)).toEqual(["BBA"]);
                expect(root.childrenNodes[2].childrenNodes[2].childrenNodes.map(node => node.label)).toEqual(["ACB", "ACA"]);
                expect(root.childrenNodes[2].childrenNodes[2].childrenNodes[1].childrenNodes.map(node => node.label)).toEqual(["ACAA"]);
            });

            it('sorts according to the sort function', () => {
                const tree = new Tree({items, sortFunction: (a, b) => a.label.localeCompare(b.label) });
                const root = tree.rootNode;

                expect(root.childrenNodes.map(node => node.label)).toEqual(["A", "B", "C"]);
                expect(root.childrenNodes[0].childrenNodes.map(node => node.label)).toEqual(["AA", "AB", "AC"]);
                expect(root.childrenNodes[1].childrenNodes.map(node => node.label)).toEqual(["BA", "BB"]);
                expect(root.childrenNodes[0].childrenNodes[2].childrenNodes.map(node => node.label)).toEqual(["ACA", "ACB"]);
                expect(root.childrenNodes[0].childrenNodes[2].childrenNodes[0].childrenNodes.map(node => node.label)).toEqual(["ACAA"]);
                expect(root.childrenNodes[1].childrenNodes[1].childrenNodes.map(node => node.label)).toEqual(["BBA"]);
            });
        });
    });

    describe('relationship functions', () => {

        const items = [
            { id: 1, title: "A", parentId: null },
            { id: 10, title: "A1", parentId: 1 },
            { id: 100, title: "A11", parentId: 10 },
            { id: 101, title: "A12", parentId: 10 },
            { id: 2, title: "B", parentId: null },
            { id: 3, title: "C", parentId: null },
            { id: 30, title: "C1", parentId: 3 },
            { id: 4, title: "D", parentId: null },
            { id: 41, title: "D1", parentId: 4 },
            { id: 42, title: "D2", parentId: 4 },
            { id: 420, title: "D21", parentId: 42 },
            { id: 421, title: "D22", parentId: 42 },
            { id: 422, title: "D23", parentId: 42 },
            { id: 4220, title: "D231", parentId: 422 },
            { id: 4221, title: "D232", parentId: 422 },
            { id: 40, title: "D3", parentId: 4 }
        ];
        const tree = new Tree({items});

        describe('isParent(), isAncestor(), isChild(), isDescendant(), isSibling() functions', () => {

            it('general cases', () => {
                expect(tree.isParent(1, 10)).toBe(true);
                expect(tree.isParent(1, 100)).toBe(false);
                expect(tree.isParent(1, 2)).toBe(false);

                expect(tree.isAncestor(1, 10)).toBe(true);
                expect(tree.isAncestor(1, 100)).toBe(true);
                expect(tree.isAncestor(1, 2)).toBe(false);
                expect(tree.isAncestor(4, 4221)).toBe(true);

                expect(tree.isChild(421, 42)).toBe(true);
                expect(tree.isChild(4221, 42)).toBe(false);
                expect(tree.isChild(2, 42)).toBe(false);

                expect(tree.isDescendant(421, 42)).toBe(true);
                expect(tree.isDescendant(4221, 42)).toBe(true);
                expect(tree.isDescendant(2, 42)).toBe(false);

                expect(tree.isSibling(1, 2)).toBe(true);
                expect(tree.isSibling(4220, 4221)).toBe(true);
                expect(tree.isSibling(41, 10)).toBe(false);
            });

            it('comparing with itself returns false', () => {
                expect(tree.isParent(42, 42)).toBe(false);
                expect(tree.isAncestor(42, 42)).toBe(false);
                expect(tree.isChild(42, 42)).toBe(false);
                expect(tree.isDescendant(42, 42)).toBe(false);
                expect(tree.isSibling(42, 42)).toBe(false);
            });

            it('works comparing with null representing the synthetic root node', () => {
                expect(tree.isParent(null, 1)).toBe(true);
                expect(tree.isParent(null, 100)).toBe(false);
                expect(tree.isParent(1, null)).toBe(false);

                expect(tree.isAncestor(null, 1)).toBe(true);
                expect(tree.isAncestor(null, 100)).toBe(true);
                expect(tree.isAncestor(1, null)).toBe(false);
                expect(tree.isAncestor(null, 4221)).toBe(true);

                expect(tree.isChild(4, null)).toBe(true);
                expect(tree.isChild(4221, null)).toBe(false);
                expect(tree.isChild(null, 4)).toBe(false);

                expect(tree.isDescendant(4, null)).toBe(true);
                expect(tree.isDescendant(4221, null)).toBe(true);
                expect(tree.isDescendant(null, 4)).toBe(false);

                expect(tree.isSibling(1, null)).toBe(false);
                expect(tree.isSibling(null, 1)).toBe(false);

                expect(tree.isParent(null, null)).toBe(false);
                expect(tree.isAncestor(null, null)).toBe(false);
                expect(tree.isChild(null, null)).toBe(false);
                expect(tree.isDescendant(null, null)).toBe(false);
                expect(tree.isSibling(null, null)).toBe(false);
            });
        });

        describe('getParent(), getAncestors(), getChildren(), getDescendants(), getSiblings() functions', () => {

            it('general cases', () => {
                expect(tree.getParent(1)).toBeNull(); // the synthetic root node is never returned
                expect(tree.getParent(100)).toMatchObject({ id: 10, title: "A1", parentId: 1 });

                expect(tree.getAncestors(4221)).toEqual([
                    expect.objectContaining({ id: 422, title: "D23", parentId: 42 }),
                    expect.objectContaining({ id: 42, title: "D2", parentId: 4 }),
                    expect.objectContaining({ id: 4, title: "D", parentId: null })
                ]);
                expect(tree.getAncestors(422)).toEqual([
                    expect.objectContaining({ id: 42, title: "D2", parentId: 4 }),
                    expect.objectContaining({ id: 4, title: "D", parentId: null })
                ]);
                expect(tree.getAncestors(42)).toEqual([
                    expect.objectContaining({ id: 4, title: "D", parentId: null })
                ]);
                expect(tree.getAncestors(4)).toEqual([]);

                expect(tree.getChildren(42)).toEqual([
                    expect.objectContaining({ id: 420, title: "D21", parentId: 42 }),
                    expect.objectContaining({ id: 421, title: "D22", parentId: 42 }),
                    expect.objectContaining({ id: 422, title: "D23", parentId: 42 })
                ]);
                expect(tree.getChildren(40)).toEqual([]);

                expect(tree.getDescendants(42)).toEqual([
                    expect.objectContaining({ id: 420, title: "D21", parentId: 42 }),
                    expect.objectContaining({ id: 421, title: "D22", parentId: 42 }),
                    expect.objectContaining({ id: 422, title: "D23", parentId: 42 }),
                    expect.objectContaining({ id: 4220, title: "D231", parentId: 422 }),
                    expect.objectContaining({ id: 4221, title: "D232", parentId: 422 })
                ]);
                expect(tree.getDescendants(4221)).toEqual([]);

                expect(tree.getSiblings(42)).toEqual([
                    expect.objectContaining({ id: 41, title: "D1", parentId: 4 }),
                    expect.objectContaining({ id: 40, title: "D3", parentId: 4 })
                ]);
                expect(tree.getSiblings(10)).toEqual([]);
            });

            it('works with null representing the synthetic root node', () => {
                expect(tree.getParent(null)).toBeNull(); // root has no parent (i.e. it's NOT its own parent)

                expect(tree.getAncestors(null)).toEqual([]);

                expect(tree.getChildren(null)).toEqual([
                    expect.objectContaining({ id: 1, title: "A", parentId: null }),
                    expect.objectContaining({ id: 2, title: "B", parentId: null }),
                    expect.objectContaining({ id: 3, title: "C", parentId: null }),
                    expect.objectContaining({ id: 4, title: "D", parentId: null })
                ]);

                expect(tree.getDescendants(null)).toEqual(items.map(i => expect.objectContaining(i)));

                expect(tree.getSiblings(null)).toEqual([]); // root has no sibling (i.e. it's NOT its own sibling)
            });
        });
    });

    describe('iterating', () => {

        const items = [
            { id: 2, label: 'B' },
            { id: 132, label: 'ACB', parentId: 13 },
            { id: 3, label: 'C' },
            { id: 12, label: 'AB', parentId: 1 },
            { id: 11, label: 'AA', parentId: 1 },
            { id: 21, label: 'BA', parentId: 2 },
            { id: 1, label: 'A' },
            { id: 22, label: 'BB', parentId: 2 },
            { id: 1311, label: 'ACAA', parentId: 131 },
            { id: 131, label: 'ACA', parentId: 13 },
            { id: 13, label: 'AC', parentId: 1 },
            { id: 221, label: 'BBA', parentId: 22 }
        ];

        it('can iterate', () => {
            const tree = new Tree({items, sortFunction: (a, b) => a.label.localeCompare(b.label) });
            const result = [];

            tree.forEach((node, index) => {
                result.push(`Level ${node.level}: ${node.label} (${index})`);
            });

            expect(result).toEqual([
                "Level 1: A (0)",
                "Level 1: B (1)",
                "Level 1: C (2)",
                "Level 2: AA (0)",
                "Level 2: AB (1)",
                "Level 2: AC (2)",
                "Level 3: ACA (0)",
                "Level 3: ACB (1)",
                "Level 4: ACAA (0)",
                "Level 2: BA (0)",
                "Level 2: BB (1)",
                "Level 3: BBA (0)"
            ]);
        });

        it('can iterate depth-first', () => {
            const tree = new Tree({items, sortFunction: (a, b) => a.label.localeCompare(b.label) });
            const result = [];

            tree.forEachDepthFirst((node, index) => {
                result.push(`Level ${node.level}: ${node.label} (${index})`);
            });

            expect(result).toEqual([
                "Level 1: A (0)",
                "Level 2: AA (0)",
                "Level 2: AB (1)",
                "Level 2: AC (2)",
                "Level 3: ACA (0)",
                "Level 4: ACAA (0)",
                "Level 3: ACB (1)",
                "Level 1: B (1)",
                "Level 2: BA (0)",
                "Level 2: BB (1)",
                "Level 3: BBA (0)",
                "Level 1: C (2)"
            ]);
        });

        it('can iterate breadth-first', () => {
            const tree = new Tree({items, sortFunction: (a, b) => a.label.localeCompare(b.label) });
            const result = [];

            tree.forEachBreadthFirst((node, index) => {
                result.push(`Level ${node.level}: ${node.label} (${index})`);
            });

            expect(result).toEqual([
                "Level 1: A (0)",
                "Level 1: B (1)",
                "Level 1: C (2)",
                "Level 2: AA (0)",
                "Level 2: AB (1)",
                "Level 2: AC (2)",
                "Level 2: BA (0)",
                "Level 2: BB (1)",
                "Level 3: ACA (0)",
                "Level 3: ACB (1)",
                "Level 3: BBA (0)",
                "Level 4: ACAA (0)"
            ]);
        });
    });

    describe('transforms the tree into a linear array', () => {

        describe('flat hierarchies', () => {

            it('works for a linear tree with no children', () => {
                const items = [
                    { id: 1, title: "Hello", parentId: null },
                    { id: 2, title: "Foo", parentId: null },
                    { id: 3, title: "Bar", parentId: null },
                    { id: 4, title: "Zzz", parentId: null },
                    { id: 5, title: "Aaa", parentId: null }
                ];
                const tree = new Tree({items, sortFunction: (a, b) => a.title.localeCompare(b.title) });

                expect(tree.toLinearArray()).toEqual([
                    expect.objectContaining({ level: 1, lines: '┌', title: "Aaa", id: 5 }),
                    expect.objectContaining({ level: 1, lines: '├', title: "Bar", id: 3 }),
                    expect.objectContaining({ level: 1, lines: '├', title: "Foo", id: 2 }),
                    expect.objectContaining({ level: 1, lines: '├', title: "Hello", id: 1 }),
                    expect.objectContaining({ level: 1, lines: '└', title: "Zzz", id: 4 })
                ]);
            });

            it('a tree with only one element has no lines', () => {
                const items = [
                    { id: 1, title: "Single", parentId: null }
                ];
                const tree = new Tree({items});

                expect(tree.toLinearArray()).toEqual([
                    expect.objectContaining({ level: 1, lines: ' ', title: "Single", id: 1 })
                ]);
            });
        });

        describe('deep hierarchies', () => {

            it('works for a complex tree (example 1)', () => {
                const items = [
                    { id: 2, label: 'B' },
                    { id: 132, label: 'ACB', parentId: 13 },
                    { id: 3, label: 'C' },
                    { id: 12, label: 'AB', parentId: 1 },
                    { id: 11, label: 'AA', parentId: 1 },
                    { id: 21, label: 'BA', parentId: 2 },
                    { id: 1, label: 'A' },
                    { id: 22, label: 'BB', parentId: 2 },
                    { id: 1311, label: 'ACAA', parentId: 131 },
                    { id: 131, label: 'ACA', parentId: 13 },
                    { id: 13, label: 'AC', parentId: 1 },
                    { id: 221, label: 'BBA', parentId: 22 }
                ];
                const tree = new Tree({items, sortFunction: (a, b) => a.label.localeCompare(b.label) });

                expect(tree.toLinearArray()).toEqual([
                    expect.objectContaining({ level: 1, lines: '┌', label: 'A', id: 1 }),
                    expect.objectContaining({ level: 2, lines: '│├', label: 'AA', id: 11 }),
                    expect.objectContaining({ level: 2, lines: '│├', label: 'AB', id: 12 }),
                    expect.objectContaining({ level: 2, lines: '│└', label: 'AC', id: 13 }),
                    expect.objectContaining({ level: 3, lines: '│ ├', label: 'ACA', id: 131 }),
                    expect.objectContaining({ level: 4, lines: '│ │└', label: 'ACAA', id: 1311 }),
                    expect.objectContaining({ level: 3, lines: '│ └', label: 'ACB', id: 132 }),
                    expect.objectContaining({ level: 1, lines: '├', label: 'B', id: 2 }),
                    expect.objectContaining({ level: 2, lines: '│├', label: 'BA', id: 21 }),
                    expect.objectContaining({ level: 2, lines: '│└', label: 'BB', id: 22 }),
                    expect.objectContaining({ level: 3, lines: '│ └', label: 'BBA', id: 221 }),
                    expect.objectContaining({ level: 1, lines: '└', label: 'C', id: 3 })
                ]);
            });

            it('works for a complex tree (example 2)', () => {
                const items = [
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
                ];
                const tree = new Tree({items, sortFunction: (a, b) => a.title.localeCompare(b.title) });

                expect(tree.toLinearArray()).toEqual([
                    expect.objectContaining({ level: 1, lines: '┌' , title: "A", id: 1, parentId: null }),
                    expect.objectContaining({ level: 2, lines: '│└' , title: "A1", id: 10, parentId: 1 }),
                    expect.objectContaining({ level: 3, lines: '│ ├' , title: "A11", id: 100, parentId: 10 }),
                    expect.objectContaining({ level: 3, lines: '│ └' , title: "A12", id: 101, parentId: 10 }),
                    expect.objectContaining({ level: 1, lines: '├' , title: "B", id: 2, parentId: null }),
                    expect.objectContaining({ level: 1, lines: '├' , title: "C", id: 3, parentId: null }),
                    expect.objectContaining({ level: 2, lines: '│└' , title: "C1", id: 30, parentId: 3 }),
                    expect.objectContaining({ level: 1, lines: '└' , title: "D", id: 4, parentId: null }),
                    expect.objectContaining({ level: 2, lines: ' ├' , title: "D1", id: 41, parentId: 4 }),
                    expect.objectContaining({ level: 2, lines: ' ├' , title: "D2", id: 42, parentId: 4 }),
                    expect.objectContaining({ level: 3, lines: ' │├' , title: "D21", id: 420, parentId: 42 }),
                    expect.objectContaining({ level: 3, lines: ' │├' , title: "D22", id: 421, parentId: 42 }),
                    expect.objectContaining({ level: 3, lines: ' │└' , title: "D23", id: 422, parentId: 42 }),
                    expect.objectContaining({ level: 4, lines: ' │ ├' , title: "D231", id: 4220, parentId: 422 }),
                    expect.objectContaining({ level: 4, lines: ' │ └' , title: "D232", id: 4221, parentId: 422 }),
                    expect.objectContaining({ level: 2, lines: ' └' , title: "D3", id: 40, parentId: 4 })
                ]);
            });
        });
    })
});
