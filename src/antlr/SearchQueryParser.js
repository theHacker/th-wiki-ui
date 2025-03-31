// Generated from src/antlr/SearchQuery.g4 by ANTLR 4.13.2
// jshint ignore: start
import antlr4 from 'antlr4';
import SearchQueryVisitor from './SearchQueryVisitor.js';

const serializedATN = [4,1,9,45,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,2,4,7,4,
1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,3,0,20,8,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
0,1,0,5,0,30,8,0,10,0,12,0,33,9,0,1,1,1,1,1,2,1,2,1,3,1,3,1,3,1,3,1,4,1,
4,1,4,0,1,0,5,0,2,4,6,8,0,1,1,0,7,8,45,0,19,1,0,0,0,2,34,1,0,0,0,4,36,1,
0,0,0,6,38,1,0,0,0,8,42,1,0,0,0,10,11,6,0,-1,0,11,12,5,1,0,0,12,13,3,0,0,
0,13,14,5,2,0,0,14,20,1,0,0,0,15,16,5,6,0,0,16,20,3,0,0,6,17,20,3,6,3,0,
18,20,3,2,1,0,19,10,1,0,0,0,19,15,1,0,0,0,19,17,1,0,0,0,19,18,1,0,0,0,20,
31,1,0,0,0,21,22,10,5,0,0,22,23,5,4,0,0,23,30,3,0,0,6,24,25,10,4,0,0,25,
26,5,5,0,0,26,30,3,0,0,5,27,28,10,3,0,0,28,30,3,0,0,4,29,21,1,0,0,0,29,24,
1,0,0,0,29,27,1,0,0,0,30,33,1,0,0,0,31,29,1,0,0,0,31,32,1,0,0,0,32,1,1,0,
0,0,33,31,1,0,0,0,34,35,3,4,2,0,35,3,1,0,0,0,36,37,7,0,0,0,37,5,1,0,0,0,
38,39,3,8,4,0,39,40,5,3,0,0,40,41,3,4,2,0,41,7,1,0,0,0,42,43,5,7,0,0,43,
9,1,0,0,0,3,19,29,31];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class SearchQueryParser extends antlr4.Parser {

    static grammarFileName = "SearchQuery.g4";
    static literalNames = [ null, "'('", "')'", "':'", "'&&'", "'||'", "'!'" ];
    static symbolicNames = [ null, "LPARENS", "RPARENS", "COLON", "AND", 
                             "OR", "NOT", "WORD", "QUOTED_STRING", "SPACE" ];
    static ruleNames = [ "query", "textQuery", "string", "attributeQuery", 
                         "attribute" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = SearchQueryParser.ruleNames;
        this.literalNames = SearchQueryParser.literalNames;
        this.symbolicNames = SearchQueryParser.symbolicNames;
    }

    sempred(localctx, ruleIndex, predIndex) {
    	switch(ruleIndex) {
    	case 0:
    	    		return this.query_sempred(localctx, predIndex);
        default:
            throw "No predicate with index:" + ruleIndex;
       }
    }

    query_sempred(localctx, predIndex) {
    	switch(predIndex) {
    		case 0:
    			return this.precpred(this._ctx, 5);
    		case 1:
    			return this.precpred(this._ctx, 4);
    		case 2:
    			return this.precpred(this._ctx, 3);
    		default:
    			throw "No predicate with index:" + predIndex;
    	}
    };



	query(_p) {
		if(_p===undefined) {
		    _p = 0;
		}
	    const _parentctx = this._ctx;
	    const _parentState = this.state;
	    let localctx = new QueryContext(this, this._ctx, _parentState);
	    let _prevctx = localctx;
	    const _startState = 0;
	    this.enterRecursionRule(localctx, 0, SearchQueryParser.RULE_query, _p);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 19;
	        this._errHandler.sync(this);
	        var la_ = this._interp.adaptivePredict(this._input,0,this._ctx);
	        switch(la_) {
	        case 1:
	            localctx = new QueryParensContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;

	            this.state = 11;
	            this.match(SearchQueryParser.LPARENS);
	            this.state = 12;
	            this.query(0);
	            this.state = 13;
	            this.match(SearchQueryParser.RPARENS);
	            break;

	        case 2:
	            localctx = new QueryNotContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 15;
	            this.match(SearchQueryParser.NOT);
	            this.state = 16;
	            this.query(6);
	            break;

	        case 3:
	            localctx = new QueryByAttributeContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 17;
	            this.attributeQuery();
	            break;

	        case 4:
	            localctx = new QueryByTextContext(this, localctx);
	            this._ctx = localctx;
	            _prevctx = localctx;
	            this.state = 18;
	            this.textQuery();
	            break;

	        }
	        this._ctx.stop = this._input.LT(-1);
	        this.state = 31;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,2,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                if(this._parseListeners!==null) {
	                    this.triggerExitRuleEvent();
	                }
	                _prevctx = localctx;
	                this.state = 29;
	                this._errHandler.sync(this);
	                var la_ = this._interp.adaptivePredict(this._input,1,this._ctx);
	                switch(la_) {
	                case 1:
	                    localctx = new QueryAndContext(this, new QueryContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, SearchQueryParser.RULE_query);
	                    this.state = 21;
	                    if (!( this.precpred(this._ctx, 5))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 5)");
	                    }
	                    this.state = 22;
	                    this.match(SearchQueryParser.AND);
	                    this.state = 23;
	                    this.query(6);
	                    break;

	                case 2:
	                    localctx = new QueryOrContext(this, new QueryContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, SearchQueryParser.RULE_query);
	                    this.state = 24;
	                    if (!( this.precpred(this._ctx, 4))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 4)");
	                    }
	                    this.state = 25;
	                    this.match(SearchQueryParser.OR);
	                    this.state = 26;
	                    this.query(5);
	                    break;

	                case 3:
	                    localctx = new QueryConcatenatedContext(this, new QueryContext(this, _parentctx, _parentState));
	                    this.pushNewRecursionContext(localctx, _startState, SearchQueryParser.RULE_query);
	                    this.state = 27;
	                    if (!( this.precpred(this._ctx, 3))) {
	                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 3)");
	                    }
	                    this.state = 28;
	                    this.query(4);
	                    break;

	                } 
	            }
	            this.state = 33;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,2,this._ctx);
	        }

	    } catch( error) {
	        if(error instanceof antlr4.error.RecognitionException) {
		        localctx.exception = error;
		        this._errHandler.reportError(this, error);
		        this._errHandler.recover(this, error);
		    } else {
		    	throw error;
		    }
	    } finally {
	        this.unrollRecursionContexts(_parentctx)
	    }
	    return localctx;
	}



	textQuery() {
	    let localctx = new TextQueryContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, SearchQueryParser.RULE_textQuery);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 34;
	        this.string();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	string() {
	    let localctx = new StringContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, SearchQueryParser.RULE_string);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 36;
	        _la = this._input.LA(1);
	        if(!(_la===7 || _la===8)) {
	        this._errHandler.recoverInline(this);
	        }
	        else {
	        	this._errHandler.reportMatch(this);
	            this.consume();
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	attributeQuery() {
	    let localctx = new AttributeQueryContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, SearchQueryParser.RULE_attributeQuery);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 38;
	        this.attribute();
	        this.state = 39;
	        this.match(SearchQueryParser.COLON);
	        this.state = 40;
	        this.string();
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	attribute() {
	    let localctx = new AttributeContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 8, SearchQueryParser.RULE_attribute);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 42;
	        this.match(SearchQueryParser.WORD);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}


}

SearchQueryParser.EOF = antlr4.Token.EOF;
SearchQueryParser.LPARENS = 1;
SearchQueryParser.RPARENS = 2;
SearchQueryParser.COLON = 3;
SearchQueryParser.AND = 4;
SearchQueryParser.OR = 5;
SearchQueryParser.NOT = 6;
SearchQueryParser.WORD = 7;
SearchQueryParser.QUOTED_STRING = 8;
SearchQueryParser.SPACE = 9;

SearchQueryParser.RULE_query = 0;
SearchQueryParser.RULE_textQuery = 1;
SearchQueryParser.RULE_string = 2;
SearchQueryParser.RULE_attributeQuery = 3;
SearchQueryParser.RULE_attribute = 4;

class QueryContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchQueryParser.RULE_query;
    }


	 
		copyFrom(ctx) {
			super.copyFrom(ctx);
		}

}


class QueryConcatenatedContext extends QueryContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	query = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(QueryContext);
	    } else {
	        return this.getTypedRuleContext(QueryContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof SearchQueryVisitor ) {
	        return visitor.visitQueryConcatenated(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

SearchQueryParser.QueryConcatenatedContext = QueryConcatenatedContext;

class QueryParensContext extends QueryContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	LPARENS() {
	    return this.getToken(SearchQueryParser.LPARENS, 0);
	};

	query() {
	    return this.getTypedRuleContext(QueryContext,0);
	};

	RPARENS() {
	    return this.getToken(SearchQueryParser.RPARENS, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof SearchQueryVisitor ) {
	        return visitor.visitQueryParens(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

SearchQueryParser.QueryParensContext = QueryParensContext;

class QueryByAttributeContext extends QueryContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	attributeQuery() {
	    return this.getTypedRuleContext(AttributeQueryContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof SearchQueryVisitor ) {
	        return visitor.visitQueryByAttribute(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

SearchQueryParser.QueryByAttributeContext = QueryByAttributeContext;

class QueryByTextContext extends QueryContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	textQuery() {
	    return this.getTypedRuleContext(TextQueryContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof SearchQueryVisitor ) {
	        return visitor.visitQueryByText(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

SearchQueryParser.QueryByTextContext = QueryByTextContext;

class QueryNotContext extends QueryContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	NOT() {
	    return this.getToken(SearchQueryParser.NOT, 0);
	};

	query() {
	    return this.getTypedRuleContext(QueryContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof SearchQueryVisitor ) {
	        return visitor.visitQueryNot(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

SearchQueryParser.QueryNotContext = QueryNotContext;

class QueryAndContext extends QueryContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	query = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(QueryContext);
	    } else {
	        return this.getTypedRuleContext(QueryContext,i);
	    }
	};

	AND() {
	    return this.getToken(SearchQueryParser.AND, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof SearchQueryVisitor ) {
	        return visitor.visitQueryAnd(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

SearchQueryParser.QueryAndContext = QueryAndContext;

class QueryOrContext extends QueryContext {

    constructor(parser, ctx) {
        super(parser);
        super.copyFrom(ctx);
    }

	query = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(QueryContext);
	    } else {
	        return this.getTypedRuleContext(QueryContext,i);
	    }
	};

	OR() {
	    return this.getToken(SearchQueryParser.OR, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof SearchQueryVisitor ) {
	        return visitor.visitQueryOr(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}

SearchQueryParser.QueryOrContext = QueryOrContext;

class TextQueryContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchQueryParser.RULE_textQuery;
    }

	string() {
	    return this.getTypedRuleContext(StringContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof SearchQueryVisitor ) {
	        return visitor.visitTextQuery(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class StringContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchQueryParser.RULE_string;
    }

	WORD() {
	    return this.getToken(SearchQueryParser.WORD, 0);
	};

	QUOTED_STRING() {
	    return this.getToken(SearchQueryParser.QUOTED_STRING, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof SearchQueryVisitor ) {
	        return visitor.visitString(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class AttributeQueryContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchQueryParser.RULE_attributeQuery;
    }

	attribute() {
	    return this.getTypedRuleContext(AttributeContext,0);
	};

	COLON() {
	    return this.getToken(SearchQueryParser.COLON, 0);
	};

	string() {
	    return this.getTypedRuleContext(StringContext,0);
	};

	accept(visitor) {
	    if ( visitor instanceof SearchQueryVisitor ) {
	        return visitor.visitAttributeQuery(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class AttributeContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = SearchQueryParser.RULE_attribute;
    }

	WORD() {
	    return this.getToken(SearchQueryParser.WORD, 0);
	};

	accept(visitor) {
	    if ( visitor instanceof SearchQueryVisitor ) {
	        return visitor.visitAttribute(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}




SearchQueryParser.QueryContext = QueryContext; 
SearchQueryParser.TextQueryContext = TextQueryContext; 
SearchQueryParser.StringContext = StringContext; 
SearchQueryParser.AttributeQueryContext = AttributeQueryContext; 
SearchQueryParser.AttributeContext = AttributeContext; 
