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

        const mermaid = generateDependencyGraphMermaid('just-me', issues, [], issueLinkTypes);

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

        const mermaid = generateDependencyGraphMermaid('i1', issues, issueLinks, issueLinkTypes);

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
});
