import {describe, expect, it} from 'vitest';
import {generateDependencyGraphMermaid} from "@/components/issues/dependency-graph.js";
import {trimIndent} from "@/helper/string.js";

describe('generateDependencyGraphMermaid()', () => {

    // These are constant for now
    const issueLinkTypes = [
        { id: '1', type: 'subtask' },
        { id: '2', type: 'blocker' },
        { id: '3', type: 'cause' },
        { id: '4', type: 'relates' },
        { id: '5', type: 'duplicate' }
    ];

    it('single issue', () => {
        const issues = {
            'just-me': {
                id: 'just-me',
                issueKey: 'FOO-42',
                issueType: { iconColor: 'success' },
                issuePriority: { showIconInList: false, iconColor: 'warning' },
                issueStatus: { doneStatus: false },
                title: 'Just a single issue'
            }
        };

        const mermaid = generateDependencyGraphMermaid('just-me', issues, [], issueLinkTypes, false);

        expect(mermaid).toEqual(trimIndent`
            flowchart LR
              FOO-42["<small>FOO-42</small>
            Just a single issue"]
              style FOO-42 stroke: #00ff00, fill: #0f1f0f
            
        `);
    });

    // Note:
    // Multiple *non-connected* issues are not specified yet.
    // We might want to allow that for a project-wide dependency graph (THWIKI-76).

    it('different issue types, issue priorities, issue link types', () => {
        const issues = {
            'i1': {
                id: 'i1',
                issueKey: 'PRJ-1',
                issueType: { iconColor: 'success' },
                issuePriority: { showIconInList: false, iconColor: 'warning-emphasis' },
                issueStatus: { doneStatus: false },
                title: 'Centered issue'
            },
            'i2': {
                id: 'i2',
                issueKey: 'PRJ-2',
                issueType: { iconColor: 'success' },
                issuePriority: { showIconInList: true, iconColor: 'info-emphasis' },
                issueStatus: { doneStatus: false },
                title: 'Low prio, feature, not done'
            },
            'i3': {
                id: 'i3',
                issueKey: 'PRJ-3',
                issueType: { iconColor: 'danger-emphasis' },
                issuePriority: { showIconInList: true, iconColor: 'danger' },
                issueStatus: { doneStatus: true },
                title: 'Very high prio, bug, done'
            },
            'i4': {
                id: 'i4',
                issueKey: 'PRJ-4',
                issueType: { iconColor: 'warning' },
                issuePriority: { showIconInList: true, iconColor: 'info' },
                issueStatus: { doneStatus: false },
                title: 'Very low prio, idea, not done'
            },
            'i5': {
                id: 'i5',
                issueKey: 'PRJ-5',
                issueType: { iconColor: 'danger' },
                issuePriority: { showIconInList: true, iconColor: 'danger-emphasis' },
                issueStatus: { doneStatus: false },
                title: 'High prio, exception, not done'
            },
            'i6': {
                id: 'i6',
                issueKey: 'PRJ-6',
                issueType: { iconColor: 'info' },
                issuePriority: { showIconInList: false, iconColor: 'warning-emphasis' },
                issueStatus: { doneStatus: true },
                title: 'Normal prio, task, done'
            },
        };

        const issueLinks = [
            { issue1: { id: 'i1' }, issue2: { id: 'i2' }, issueLinkType: { id: '1' } },
            { issue1: { id: 'i4' }, issue2: { id: 'i3' }, issueLinkType: { id: '2' } },
            { issue1: { id: 'i5' }, issue2: { id: 'i1' }, issueLinkType: { id: '3' } },
            { issue1: { id: 'i2' }, issue2: { id: 'i3' }, issueLinkType: { id: '4' } },
            { issue1: { id: 'i3' }, issue2: { id: 'i5' }, issueLinkType: { id: '5' } },
            { issue1: { id: 'i3' }, issue2: { id: 'i6' }, issueLinkType: { id: '3' } },
        ];

        const mermaid = generateDependencyGraphMermaid('i1', issues, issueLinks, issueLinkTypes, false);

        expect(mermaid).toEqual(trimIndent`
            flowchart LR
              PRJ-1["<small>PRJ-1</small>
            Centered issue"]
              style PRJ-1 stroke: #00ff00, fill: #0f1f0f
              PRJ-2["<small>PRJ-2</small>
            Low prio, feature, not done"]
              style PRJ-2 stroke: #6edff6, fill: #062215
              PRJ-1 -- is subtask for --> PRJ-2
              linkStyle 0 stroke: limegreen, color: limegreen
              PRJ-4["<small>PRJ-4</small>
            Very low prio, idea, not done"]
              style PRJ-4 stroke: #0dcaf0, fill: #403002
              PRJ-3["<small>PRJ-3</small>
            <s>Very high prio, bug, done</s>"]
              style PRJ-3 stroke: #dc3545, fill: #3b2224
              PRJ-4 -- blocks --> PRJ-3
              linkStyle 1 stroke: crimson, color: crimson
              PRJ-5["<small>PRJ-5</small>
            High prio, exception, not done"]
              style PRJ-5 stroke: #ea868f, fill: #370d11
              PRJ-5 -- causes --> PRJ-1
              linkStyle 2 stroke: yellow, color: yellow
              PRJ-2 <-. relates to .-> PRJ-3
              linkStyle 3 stroke: aqua, color: aqua
              PRJ-3 -. duplicates .-> PRJ-5
              linkStyle 4 stroke: violet, color: violet
              PRJ-6["<small>PRJ-6</small>
            <s>Normal prio, task, done</s>"]
              style PRJ-6 stroke: #ccc, fill: #03333c
              PRJ-3 -- causes --> PRJ-6
              linkStyle 5 stroke: yellow, color: yellow
            
        `);
    });

    describe('pruning of done issues', () => {

        it("does not trim the centered issue even when it's done", () => {
            const issues = {
                'center': {
                    id: 'center',
                    issueKey: 'FOO-1000',
                    issueType: { iconColor: 'success' },
                    issuePriority: { showIconInList: false, iconColor: 'warning' },
                    issueStatus: { doneStatus: true },
                    title: 'I am done'
                },
                'other': {
                    id: 'other',
                    issueKey: 'FOO-1001',
                    issueType: { iconColor: 'success' },
                    issuePriority: { showIconInList: false, iconColor: 'warning' },
                    issueStatus: { doneStatus: false },
                    title: 'Not done'
                }
            };

            const issueLinks = [
                { issue1: { id: 'center' }, issue2: { id: 'other' }, issueLinkType: { id: '1' } }
            ];

            const mermaid = generateDependencyGraphMermaid('center', issues, issueLinks, issueLinkTypes, true);

            expect(mermaid).toEqual(trimIndent`
                flowchart LR
                  FOO-1000["<small>FOO-1000</small>
                <s>I am done</s>"]
                  style FOO-1000 stroke: #00ff00, fill: #0f1f0f
                  FOO-1001["<small>FOO-1001</small>
                Not done"]
                  style FOO-1001 stroke: #ccc, fill: #062215
                  FOO-1000 -- is subtask for --> FOO-1001
                  linkStyle 0 stroke: limegreen, color: limegreen
                
            `);
        });

        it('does not include a done issue and its links', () => {
            const issues = {
                'center': {
                    id: 'center',
                    issueKey: 'FOO-1000',
                    issueType: { iconColor: 'success' },
                    issuePriority: { showIconInList: false, iconColor: 'warning' },
                    issueStatus: { doneStatus: true },
                    title: 'I am done'
                },
                'other': {
                    id: 'other',
                    issueKey: 'FOO-1001',
                    issueType: { iconColor: 'success' },
                    issuePriority: { showIconInList: false, iconColor: 'warning' },
                    issueStatus: { doneStatus: true },
                    title: 'Also done'
                }
            };

            const issueLinks = [
                { issue1: { id: 'center' }, issue2: { id: 'other' }, issueLinkType: { id: '1' } },
                { issue1: { id: 'center' }, issue2: { id: 'other' }, issueLinkType: { id: '5' } },
                { issue1: { id: 'center' }, issue2: { id: 'other' }, issueLinkType: { id: '4' } }
            ];

            const mermaid = generateDependencyGraphMermaid('center', issues, issueLinks, issueLinkTypes, true);

            expect(mermaid).toEqual(trimIndent`
                flowchart LR
                  FOO-1000["<small>FOO-1000</small>
                <s>I am done</s>"]
                  style FOO-1000 stroke: #00ff00, fill: #0f1f0f
                
            `);
        });

        it('prunes recursive, but only full done sub-trees', () => {
            const createIssue = (id, issueKey, title, done) => {
                return {
                    [id]: {
                        id,
                        issueKey,
                        issueType: { iconColor: 'success' },
                        issuePriority: { showIconInList: false, iconColor: 'warning' },
                        issueStatus: { doneStatus: done },
                        title
                    }
                }
            };

            const issues = {
                ...createIssue('201', 'ISS-201', 'My Feature', false),

                ...createIssue('202', 'ISS-202', 'complete direct task', true),
                ...createIssue('203', 'ISS-203', 'incomplete direct task', false),

                ...createIssue('211', 'ISS-211', 'blocker 1 for X', false),
                ...createIssue('212', 'ISS-212', 'blocker 2 for X', true),
                ...createIssue('213', 'ISS-213', 'X (partially done deps)', false),

                ...createIssue('221', 'ISS-221', 'blocker 1 for Y', true),
                ...createIssue('222', 'ISS-222', 'blocker 2 for Y', true),
                ...createIssue('223', 'ISS-223', 'Y (complete done deps)', false),

                ...createIssue('231', 'ISS-231', 'blocker 1 for Z', true),
                ...createIssue('232', 'ISS-232', 'blocker 2 for Z', true),
                ...createIssue('233', 'ISS-233', 'Y (everything done)', true),

                ...createIssue('241', 'ISS-241', 'blocker 1 for R (not done)', false),
                ...createIssue('242', 'ISS-242', 'blocker 2 for R (done)', true),
                ...createIssue('243', 'ISS-243', 'R (done, but has undone deps)', true)
            };

            const issueLinks = [
                { issue1: { id: '201' }, issue2: { id: '202' }, issueLinkType: { id: '2' } },
                { issue1: { id: '201' }, issue2: { id: '203' }, issueLinkType: { id: '2' } },

                { issue1: { id: '211' }, issue2: { id: '213' }, issueLinkType: { id: '2' } },
                { issue1: { id: '212' }, issue2: { id: '213' }, issueLinkType: { id: '2' } },
                { issue1: { id: '213' }, issue2: { id: '201' }, issueLinkType: { id: '2' } },

                { issue1: { id: '221' }, issue2: { id: '223' }, issueLinkType: { id: '2' } },
                { issue1: { id: '222' }, issue2: { id: '223' }, issueLinkType: { id: '2' } },
                { issue1: { id: '223' }, issue2: { id: '201' }, issueLinkType: { id: '2' } },

                { issue1: { id: '231' }, issue2: { id: '233' }, issueLinkType: { id: '2' } },
                { issue1: { id: '232' }, issue2: { id: '233' }, issueLinkType: { id: '2' } },
                { issue1: { id: '233' }, issue2: { id: '201' }, issueLinkType: { id: '2' } },

                { issue1: { id: '241' }, issue2: { id: '243' }, issueLinkType: { id: '2' } },
                { issue1: { id: '242' }, issue2: { id: '243' }, issueLinkType: { id: '2' } },
                { issue1: { id: '243' }, issue2: { id: '201' }, issueLinkType: { id: '2' } },
            ];

            const mermaid = generateDependencyGraphMermaid('201', issues, issueLinks, issueLinkTypes, true);

            // Expect:
            // - 202 cut
            // - 212 cut
            // - 221, 222 cut; 223 not cut
            // - 231, 232 cut; 233 also cut
            // - 243 NOT cut, 241 not cut, 242 cut

            expect(mermaid).toEqual(trimIndent`
                flowchart LR
                  ISS-201["<small>ISS-201</small>
                My Feature"]
                  style ISS-201 stroke: #00ff00, fill: #0f1f0f
                  ISS-203["<small>ISS-203</small>
                incomplete direct task"]
                  style ISS-203 stroke: #ccc, fill: #062215
                  ISS-201 -- blocks --> ISS-203
                  linkStyle 0 stroke: crimson, color: crimson
                  ISS-211["<small>ISS-211</small>
                blocker 1 for X"]
                  style ISS-211 stroke: #ccc, fill: #062215
                  ISS-213["<small>ISS-213</small>
                X (partially done deps)"]
                  style ISS-213 stroke: #ccc, fill: #062215
                  ISS-211 -- blocks --> ISS-213
                  linkStyle 1 stroke: crimson, color: crimson
                  ISS-213 -- blocks --> ISS-201
                  linkStyle 2 stroke: crimson, color: crimson
                  ISS-223["<small>ISS-223</small>
                Y (complete done deps)"]
                  style ISS-223 stroke: #ccc, fill: #062215
                  ISS-223 -- blocks --> ISS-201
                  linkStyle 3 stroke: crimson, color: crimson
                  ISS-241["<small>ISS-241</small>
                blocker 1 for R (not done)"]
                  style ISS-241 stroke: #ccc, fill: #062215
                  ISS-243["<small>ISS-243</small>
                <s>R (done, but has undone deps)</s>"]
                  style ISS-243 stroke: #ccc, fill: #062215
                  ISS-241 -- blocks --> ISS-243
                  linkStyle 4 stroke: crimson, color: crimson
                  ISS-243 -- blocks --> ISS-201
                  linkStyle 5 stroke: crimson, color: crimson
                
            `);
        });

        describe('cycle containing the centered issue', () => {

            function setup(middlePartInChainDone) {
                const createIssue = (id, issueKey, title, done) => {
                    return {
                        [id]: {
                            id,
                            issueKey,
                            issueType: { iconColor: 'danger' },
                            issuePriority: { showIconInList: false, iconColor: 'warning-emphasis' },
                            issueStatus: { doneStatus: done },
                            title
                        }
                    }
                };

                const issues = {
                    ...createIssue('201', 'C-201', 'Main', true),

                    ...createIssue('211', 'C-211', 'done 1', true),
                    ...createIssue('221', 'C-221', 'middle part in chain', middlePartInChainDone),
                    ...createIssue('231', 'C-231', 'done 2', true),
                };

                const issueLinks = [
                    // full cycle
                    { issue1: { id: '201' }, issue2: { id: '211' }, issueLinkType: { id: '4' } },
                    { issue1: { id: '211' }, issue2: { id: '221' }, issueLinkType: { id: '4' } },
                    { issue1: { id: '221' }, issue2: { id: '231' }, issueLinkType: { id: '4' } },
                    { issue1: { id: '231' }, issue2: { id: '201' }, issueLinkType: { id: '4' } },
                ];

                return { issues, issueLinks };
            }

            it('cycles cannot be pruned when there is a non-done issue in it', () => {
                const { issues, issueLinks } = setup(false);

                const mermaid = generateDependencyGraphMermaid('201', issues, issueLinks, issueLinkTypes, true);

                expect(mermaid).toEqual(trimIndent`
                    flowchart LR
                      C-201["<small>C-201</small>
                    <s>Main</s>"]
                      style C-201 stroke: #00ff00, fill: #0f1f0f
                      C-211["<small>C-211</small>
                    <s>done 1</s>"]
                      style C-211 stroke: #ccc, fill: #370d11
                      C-201 <-. relates to .-> C-211
                      linkStyle 0 stroke: aqua, color: aqua
                      C-221["<small>C-221</small>
                    middle part in chain"]
                      style C-221 stroke: #ccc, fill: #370d11
                      C-211 <-. relates to .-> C-221
                      linkStyle 1 stroke: aqua, color: aqua
                      C-231["<small>C-231</small>
                    <s>done 2</s>"]
                      style C-231 stroke: #ccc, fill: #370d11
                      C-221 <-. relates to .-> C-231
                      linkStyle 2 stroke: aqua, color: aqua
                      C-231 <-. relates to .-> C-201
                      linkStyle 3 stroke: aqua, color: aqua
                    
                `);
            });

            it('a cycle containing the centered issue will be cut to the centered issue only', () => {
                const { issues, issueLinks } = setup(true);

                const mermaid = generateDependencyGraphMermaid('201', issues, issueLinks, issueLinkTypes, true);

                expect(mermaid).toEqual(trimIndent`
                    flowchart LR
                      C-201["<small>C-201</small>
                    <s>Main</s>"]
                      style C-201 stroke: #00ff00, fill: #0f1f0f
                    
                `);
            });
        });

        describe('cycle outside of the centered issue', () => {

            function setup(middlePartInChainDone) {
                const createIssue = (id, issueKey, title, done) => {
                    return {
                        [id]: {
                            id,
                            issueKey,
                            issueType: { iconColor: 'success' },
                            issuePriority: { showIconInList: false, iconColor: 'warning-emphasis' },
                            issueStatus: { doneStatus: done },
                            title
                        }
                    }
                };

                const issues = {
                    ...createIssue('201', 'C-201', 'Main', true),

                    ...createIssue('211', 'C-211', 'done 1', true),
                    ...createIssue('221', 'C-221', 'middle part in chain', middlePartInChainDone),
                    ...createIssue('231', 'C-231', 'done 2', true),
                };

                const issueLinks = [
                    { issue1: { id: '201' }, issue2: { id: '211' }, issueLinkType: { id: '4' } },

                    // full cycle
                    { issue1: { id: '211' }, issue2: { id: '221' }, issueLinkType: { id: '4' } },
                    { issue1: { id: '221' }, issue2: { id: '231' }, issueLinkType: { id: '4' } },
                    { issue1: { id: '231' }, issue2: { id: '211' }, issueLinkType: { id: '4' } },
                ];

                return { issues, issueLinks };
            }

            it('cycles cannot be pruned when there is a non-done issue in it', () => {
                const { issues, issueLinks } = setup(false);

                const mermaid = generateDependencyGraphMermaid('201', issues, issueLinks, issueLinkTypes, true);

                expect(mermaid).toEqual(trimIndent`
                    flowchart LR
                      C-201["<small>C-201</small>
                    <s>Main</s>"]
                      style C-201 stroke: #00ff00, fill: #0f1f0f
                      C-211["<small>C-211</small>
                    <s>done 1</s>"]
                      style C-211 stroke: #ccc, fill: #062215
                      C-201 <-. relates to .-> C-211
                      linkStyle 0 stroke: aqua, color: aqua
                      C-221["<small>C-221</small>
                    middle part in chain"]
                      style C-221 stroke: #ccc, fill: #062215
                      C-211 <-. relates to .-> C-221
                      linkStyle 1 stroke: aqua, color: aqua
                      C-231["<small>C-231</small>
                    <s>done 2</s>"]
                      style C-231 stroke: #ccc, fill: #062215
                      C-221 <-. relates to .-> C-231
                      linkStyle 2 stroke: aqua, color: aqua
                      C-231 <-. relates to .-> C-211
                      linkStyle 3 stroke: aqua, color: aqua
                    
                `);
            });

            it('a cycle can be cut completely', () => {
                const { issues, issueLinks } = setup(true);

                const mermaid = generateDependencyGraphMermaid('201', issues, issueLinks, issueLinkTypes, true);

                expect(mermaid).toEqual(trimIndent`
                    flowchart LR
                      C-201["<small>C-201</small>
                    <s>Main</s>"]
                      style C-201 stroke: #00ff00, fill: #0f1f0f
                    
                `);
            });
        });
    });
});
