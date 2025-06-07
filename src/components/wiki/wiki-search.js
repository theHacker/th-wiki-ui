// noinspection DuplicatedCode // sharing a lot of code between issue-search.js and wiki-search.js

/*
 * Rudimentary client-side search.
 *
 * ...until GraphQL API provides search on server-side.
 */

import {BailErrorStrategy, CharStream, CommonTokenStream} from "antlr4";
import SearchQueryLexer from "@/antlr/SearchQueryLexer.js";
import SearchQueryParser from "@/antlr/SearchQueryParser.js";
import SearchQueryVisitor from "@/antlr/SearchQueryVisitor.js";

/**
 * Visitor traversing the search query AST and performing the filtering and ordering.
 */
class ExecutingQueryVisitor extends SearchQueryVisitor {

    constructor(allWikiPages) {
        super();
        this.allWikiPages = allWikiPages;
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

        const conjunction = left.wikiPages.filter(leftItem =>
            right.wikiPages.some(rightItem => leftItem.id === rightItem.id));

        return {
            wikiPages: conjunction
        }
    }

    visitQueryParens(ctx) {
        return this.visit(ctx.query());
    }

    visitQueryByAttribute(ctx) {
        const attributeQuery = this.visit(ctx.attributeQuery());

        const attribute = attributeQuery.attribute.toLowerCase();
        const string = attributeQuery.string.toLowerCase();

        let matchingWikiPages = [];
        switch (attribute) {
            case 'hasattachments':
                if (string === 'true' || string === 'yes' || string === '1') {
                    matchingWikiPages = this.allWikiPages
                        .filter(it => it.attachmentsCount > 0);
                } else if (string === 'false' || string === 'no' || string === '0') {
                    matchingWikiPages = this.allWikiPages
                        .filter(it => it.attachmentsCount === 0);
                } else {
                    throw `Unknown value '${string}' for 'hasattachments:'.`;
                }
                break;

            case 'hastags':
                if (string === 'true' || string === 'yes' || string === '1') {
                    matchingWikiPages = this.allWikiPages
                        .filter(it => it.tags.length > 0);
                } else if (string === 'false' || string === 'no' || string === '0') {
                    matchingWikiPages = this.allWikiPages
                        .filter(it => it.tags.length === 0);
                } else {
                    throw `Unknown value '${string}' for 'hastags:'.`;
                }
                break;

            case 'tag':
                matchingWikiPages = this.allWikiPages
                    .filter(wikiPage => wikiPage.tags
                        .some(tag => (tag.title.toLowerCase() === string || tag.scope.toLowerCase() === string))
                    );
                break;

            case 'tagscope':
                matchingWikiPages = this.allWikiPages
                    .filter(wikiPage => wikiPage.tags
                        .some(tag => tag.scope.toLowerCase() === string)
                    );
                break;

            case 'tagtitle':
                matchingWikiPages = this.allWikiPages
                    .filter(wikiPage => wikiPage.tags
                        .some(tag => tag.title.toLowerCase() === string)
                    );
                break;

            default:
                throw `Unknown attribute '${attribute}:'.`;
        }

        return {
            wikiPages: matchingWikiPages
        };
    }

    visitQueryByText(ctx) {
        const text = ctx.getText().toLowerCase();
        const matchingWikiPages = this.allWikiPages
            .filter(it => (
                it.title.toLowerCase().includes(text) ||
                it.content.toLowerCase().includes(text)
            ));

        return {
            wikiPages: matchingWikiPages
        };
    }

    visitQueryNot(ctx) {
        const right = this.visit(ctx.query(0));

        const complement = this.allWikiPages.filter(leftItem =>
            right.wikiPages.every(rightItem => leftItem.id !== rightItem.id));

        return {
            wikiPages: complement
        }
    }

    visitQueryAnd(ctx) {
        const left = this.visit(ctx.query(0));
        const right = this.visit(ctx.query(1));

        const conjunction = left.wikiPages.filter(leftItem =>
            right.wikiPages.some(rightItem => leftItem.id === rightItem.id));

        return {
            wikiPages: conjunction
        }
    }

    visitQueryOr(ctx) {
        const left = this.visit(ctx.query(0));
        const right = this.visit(ctx.query(1));

        const disjunction = [...left.wikiPages];
        right.wikiPages.forEach(rightItem => {
            if (!disjunction.some(leftItem => leftItem.id === rightItem.id)) {
                disjunction.push(rightItem);
            }
        });

        return {
            wikiPages: disjunction
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
 * Performs a search query on the given wiki pages.
 * Returns matching wiki pages.
 *
 * @param {string} query query string
 * @param {Array<*>} wikiPages wiki pages inclusive their content loaded
 * @returns {Array<*>} resulting search hits
 * @throws {string} in case of any error, we will just return a string with the error message (poor, but enough ;-))
 */
function executeQuery(query, wikiPages) {
    let wikiPagesResult;

    // No filter? Take all wiki pages
    if (query === '') {
        wikiPagesResult = wikiPages;
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

        const visitor = new ExecutingQueryVisitor(wikiPages);
        const result = visitor.visit(tree);

        wikiPagesResult = [...(result.noOp ? wikiPages : result.wikiPages)];
    }

    return wikiPagesResult;
}

export {executeQuery};
