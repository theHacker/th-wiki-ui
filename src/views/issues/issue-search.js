/*
 * Rudimentary client-side search.
 *
 * ...until GraphQL API provides search on server-side.
 */

import {BailErrorStrategy, CharStream, CommonTokenStream} from "antlr4";
import SearchQueryLexer from "@/antlr/SearchQueryLexer.js";
import SearchQueryParser from "@/antlr/SearchQueryParser.js";
import SearchQueryVisitor from "@/antlr/SearchQueryVisitor.js";

const defaultSortFunctionKey = 'modificationTime';

/**
 * Visitor traversing the search query AST and performing the filtering and ordering.
 */
class ExecutingQueryVisitor extends SearchQueryVisitor {

    constructor(allIssues) {
        super();
        this.allIssues = allIssues;
        this.orderBy = [];
        this.includeDone = false;
    }

    visitQueryConcatenated(ctx) {
        const left = this.visit(ctx.query(0));
        const right = this.visit(ctx.query(1));

        // If either side is a noOp (ordering) result, return the other
        if (left.noOp && !right.noOp) {
            return right;
        } else if (!left.noOp && right.noOp) {
            return left;
        }
        // Two noOp (ordering) next to each other
        else if (left.noOp && right.noOp) {
            return {
                noOp: true
            };
        }

        const conjunction = left.issues.filter(leftItem =>
            right.issues.some(rightItem => leftItem.id === rightItem.id));

        return {
            issues: conjunction
        }
    }

    visitQueryParens(ctx) {
        return this.visit(ctx.query());
    }

    visitQueryByAttribute(ctx) {
        const attributeQuery = this.visit(ctx.attributeQuery());

        const attribute = attributeQuery.attribute.toLowerCase();
        const string = attributeQuery.string.toLowerCase();

        let matchingIssues = [];
        switch (attribute) {
            case 'project':
                matchingIssues = this.allIssues
                    .filter(it => it.project.prefix.toLowerCase() === string);
                break;

            case 'type':
                matchingIssues = this.allIssues
                    .filter(it => it.issueType.title.toLowerCase() === string);
                break;

            case 'priority':
                matchingIssues = this.allIssues
                    .filter(it => it.issuePriority.title.toLowerCase() === string);
                break;

            case 'status':
                matchingIssues = this.allIssues
                    .filter(it => it.issueStatus.title.toLowerCase() === string);
                break;

            case 'hastags':
                if (string === 'true' || string === 'yes' || string === '1') {
                    matchingIssues = this.allIssues
                        .filter(it => it.tags.length > 0);
                } else if (string === 'false' || string === 'no' || string === '0') {
                    matchingIssues = this.allIssues
                        .filter(it => it.tags.length === 0);
                } else {
                    throw `Unknown value '${string}' for 'hastags:'.`;
                }
                break;

            case 'tag':
                matchingIssues = this.allIssues
                    .filter(issue => issue.tags
                        .some(tag => (tag.title.toLowerCase() === string || tag.scope.toLowerCase() === string))
                    );
                break;

            case 'tagscope':
                matchingIssues = this.allIssues
                    .filter(issue => issue.tags
                        .some(tag => tag.scope.toLowerCase() === string)
                    );
                break;

            case 'tagtitle':
                matchingIssues = this.allIssues
                    .filter(issue => issue.tags
                        .some(tag => tag.title.toLowerCase() === string)
                    );
                break;

            case 'filter':
                if (string === 'due') {
                    matchingIssues = this.allIssues.filter(it => it.dueDate);
                    break;
                }
                throw `Unknown value '${string}' for 'filter:'.`;

            case 'include':
                if (string === 'done') {
                    this.includeDone = true;

                    return {
                        noOp: true
                    };
                }
                throw `Unknown value '${string}' for 'include:'.`;

            case 'orderby': {
                let order;
                if (string.startsWith('~')) {
                    order = {
                        key: attributeQuery.string.substring(1),
                        inverse: true
                    };
                } else {
                    order = {
                        key: attributeQuery.string,
                        inverse: false
                    };
                }
                this.orderBy.push(order);

                return {
                    noOp: true
                };
            }

            default:
                throw `Unknown attribute '${attribute}:'.`;
        }

        return {
            issues: matchingIssues
        };
    }

    visitQueryByText(ctx) {
        const text = ctx.getText().toLowerCase();
        const matchingIssues = this.allIssues
            .filter(it => (
                it.title.toLowerCase().includes(text) ||
                it.description.toLowerCase().includes(text) ||
                it.issueKey.toLowerCase() === text ||
                it.issueNumber.toString() === text
            ));

        return {
            issues: matchingIssues
        };
    }

    visitQueryNot(ctx) {
        const right = this.visit(ctx.query(0));

        const complement = this.allIssues.filter(leftItem =>
            right.issues.every(rightItem => leftItem.id !== rightItem.id));

        return {
            issues: complement
        }
    }

    visitQueryAnd(ctx) {
        const left = this.visit(ctx.query(0));
        const right = this.visit(ctx.query(1));

        const conjunction = left.issues.filter(leftItem =>
            right.issues.some(rightItem => leftItem.id === rightItem.id));

        return {
            issues: conjunction
        }
    }

    visitQueryOr(ctx) {
        const left = this.visit(ctx.query(0));
        const right = this.visit(ctx.query(1));

        const disjunction = [...left.issues];
        right.issues.forEach(rightItem => {
            if (!disjunction.some(leftItem => leftItem.id === rightItem.id)) {
                disjunction.push(rightItem);
            }
        });

        return {
            issues: disjunction
        }
    }

    visitString(ctx) {
        if (ctx.WORD()) {
            return ctx.WORD().getText();
        }
        else if (ctx.QUOTED_STRING()) {
            const withQuotes = ctx.QUOTED_STRING().getText();

            return withQuotes.substring(1, withQuotes.length - 1);
        }
    }

    visitAttributeQuery(ctx) {
        const attribute = this.visit(ctx.attribute());
        const string = this.visit(ctx.string());

        return {
            attribute,
            string: string || ""
        };
    }

    visitAttribute(ctx) {
        return ctx.WORD().getText();
    }
}

/**
 * Performs a search query on the given issues.
 * Returns matching issues.
 *
 * @param {string} query query string
 * @param {Array<*>} issues issues inclusive their description loaded
 * @param {Array<{key: string, title: string, func: function}>} sortFunctions sort functions
 * @returns {Array<*>} resulting search hits
 * @throws {string} in case of any error, we will just return a string with the error message (poor, but enough ;-))
 */
function executeQuery(query, issues, sortFunctions) {
    let issuesResult;
    let includeDone;
    let orderBy;

    // No filter? Take all (not done) issues
    if (query === '') {
        issuesResult = issues;
        includeDone = false;
        orderBy = [];
    }
    else {
        // Initialize lexing and parsing

        const charStream = new CharStream(query);
        const lexer = new SearchQueryLexer(charStream);
        const tokens = new CommonTokenStream(lexer);
        const parser = new SearchQueryParser(tokens);

        // We throw errors to the caller to process them. No logging onto the console.
        // Not perfect, but for now enough.

        const errorListener = {
            syntaxError(recognizer, offendingSymbol, line, column, msg, _e) {
                throw `Lexer error: ${msg} @${line}:${column}`;
            }
        };

        lexer.removeErrorListeners();
        lexer.addErrorListener(errorListener);

        parser.removeErrorListeners();
        parser.addErrorListener(errorListener);

        parser._errHandler = new BailErrorStrategy();

        // Parse

        const tree = parser.query();

        const visitor = new ExecutingQueryVisitor(issues);
        const result = visitor.visit(tree);

        issuesResult = [...(result.noOp ? issues : result.issues)];
        includeDone = visitor.includeDone;
        orderBy = visitor.orderBy;
    }

    if (!includeDone) {
        issuesResult = issuesResult.filter(it => !it.issueStatus.doneStatus);
    }

    // If no explicit ordering was specified, we use a default sorting.
    // Never return an unsorted list.
    if (orderBy.length === 0) {
        orderBy.push(
            {
                key: defaultSortFunctionKey,
                inverse: false
            }
        );
    }

    if (orderBy.length > 0) {
        // Build summary sort function
        const summarySortFunction = (a, b) => {
            for (const order of orderBy) {
                const sortFunction = sortFunctions.find(it => it.key === order.key);
                if (!sortFunction) {
                    throw `Sorting function '${order.key}' unknown.`;
                }

                let compareResult = sortFunction.func(a, b);
                if (order.inverse) {
                    compareResult = -compareResult;
                }

                if (compareResult !== 0) {
                    return compareResult;
                }
            }

            return 0;
        }

        issuesResult.sort(summarySortFunction);
    }

    return issuesResult;
}

/**
 * Converts the quick search to a quick string.
 *
 * @param {Object} quickSearch Quick search options
 * @param {Array<*>} projects (context information)
 * @param {Array<*>} issueTypes (context information)
 * @param {Array<*>} issuePriorities (context information)
 * @param {Array<*>} issueStatuses (context information)
 * @returns {String} query string to represent the quick search
 */
function quickSearchToQuery(quickSearch, projects, issueTypes, issuePriorities, issueStatuses) {
    const quoteStringIfNeeded = (string) => string.includes(' ') ? `"${string}"` : string;

    const queryParts = [];

    if (quickSearch.projectId) {
        const project = projects
            .find(project => project.id === quickSearch.projectId);

        queryParts.push('project:' + quoteStringIfNeeded(project.prefix));
    }
    if (quickSearch.issueTypeId) {
        const issueType = issueTypes
            .find(issueType => issueType.id === quickSearch.issueTypeId);

        queryParts.push('type:' + quoteStringIfNeeded(issueType.title));
    }
    if (quickSearch.issuePriorityId) {
        const issuePriority = issuePriorities
            .find(issuePriority => issuePriority.id === quickSearch.issuePriorityId);

        queryParts.push('priority:' + quoteStringIfNeeded(issuePriority.title));
    }
    if (quickSearch.issueStatusId) {
        const issueStatus = issueStatuses.find(issueStatus => issueStatus.id === quickSearch.issueStatusId);

        queryParts.push('status:' + quoteStringIfNeeded(issueStatus.title));
    }

    if (quickSearch.showDone) {
        queryParts.push('include:done');
    }
    if (quickSearch.showOnlyDue) {
        queryParts.push('filter:due');
    }

    if (quickSearch.sortInverse || quickSearch.sortFunctionKey !== defaultSortFunctionKey) {
        const inverse = quickSearch.sortInverse ? '~' : ''
        queryParts.push('orderby:' + inverse + quickSearch.sortFunctionKey);
    }

    if (quickSearch.search) {
        queryParts.push(quickSearch.search);
    }

    return queryParts.join(' ');
}

/**
 * Since sorting functions have dependencies, this function builds them.
 *
 * @param {Array<*>} issuePriorities all issue priorities
 * @param {Array<*>} issueStatuses all issue statuses
 * @param {Array<*>} issueTypes all issue types
 * @returns {Array<{key: string, title: string, func: function}>}
 */
function buildSortFunctions(issuePriorities, issueStatuses, issueTypes) {
    return [
        {
            key: 'modificationTime',
            title: 'Modification time',
            func: (a, b) => -a.modificationTime.localeCompare(b.modificationTime)
        },
        {
            key: 'dueDate',
            title: 'Due date',
            func: (a, b) => {
                if (a.dueDate && !b.dueDate) {
                    return -1;
                }
                else if (!a.dueDate && b.dueDate) {
                    return +1;
                }
                else if (!a.dueDate && !b.dueDate) {
                    return 0;
                }

                return a.dueDate.localeCompare(b.dueDate);
            }
        },
        {
            key: 'key',
            title: 'Key',
            func: (a, b) => {
                const projectCmp = a.project.prefix.localeCompare(b.project.prefix);
                if (projectCmp !== 0) {
                    return projectCmp;
                }

                return -(a.issueNumber - b.issueNumber);
            }
        },
        {
            key: 'priority',
            title: 'Priority',
            func: (a, b) => {
                const priorityToNumber = issuePriorityId => issuePriorities.findIndex(it => it.id === issuePriorityId);

                const aPriority = priorityToNumber(a.issuePriority.id);
                const bPriority = priorityToNumber(b.issuePriority.id);
                return -(aPriority - bPriority);
            }
        },
        {
            key: 'status',
            title: 'Status',
            func: (a, b) => {
                const statusToNumber = issueStatusId => issueStatuses.findIndex(it => it.id === issueStatusId);

                const aStatus = statusToNumber(a.issueStatus.id);
                const bStatus = statusToNumber(b.issueStatus.id);
                return aStatus - bStatus;
            }
        },
        {
            key: 'type',
            title: 'Type',
            func: (a, b) => {
                const typeToNumber = issueTypeId => issueTypes.findIndex(it => it.id === issueTypeId);

                const aType = typeToNumber(a.issueType.id);
                const bType = typeToNumber(b.issueType.id);
                return aType - bType;
            }
        },
        {
            key: 'title',
            title: 'Title',
            func: (a, b) => a.title.localeCompare(b.title)
        },
        {
            key: 'creationTime',
            title: 'Creation time',
            func: (a, b) => -a.creationTime.localeCompare(b.creationTime)
        }
    ];
}

export {executeQuery, quickSearchToQuery, buildSortFunctions, defaultSortFunctionKey};
