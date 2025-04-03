grammar SearchQuery;

query
  : LPARENS query RPARENS   # QueryParens
  | NOT query               # QueryNot
  | query AND query         # QueryAnd
  | query OR query          # QueryOr
  | query query             # QueryConcatenated
  | attributeQuery          # QueryByAttribute
  | textQuery               # QueryByText
  ;

textQuery
  : string
  ;

string
  : WORD
  | QUOTED_STRING
  ;

attributeQuery
  : attribute COLON string
  ;

attribute
  : WORD
  ;

LPARENS: '(';
RPARENS: ')';

COLON: ':';

AND: '&&';
OR: '||';
NOT: '!';

WORD: [A-Za-z0-9äöüÄÖÜßẞ~-]+;
QUOTED_STRING: '"' .*? '"';

SPACE: (' ' | '\u00a0') -> skip;
