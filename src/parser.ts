// Generated automatically by nearley, version 2.15.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var identifier: any;
declare var integer: any;
declare var bitfield: any;
declare var float: any;
declare var hex: any;
declare var binary: any;
declare var number: any;
declare var WS: any;
declare var NL: any;

const moo = require('moo');

const lexMain = moo.compile({
    WS: { match: /[ \t\n]+/, lineBreaks: true },
    comment: /\/\/.*?$/,
    binary: /0b[01]+/,
    hex: /0x[0-9A-Fa-f]+/,
    number: /0|[1-9][0-9]*/,
    lcurly: '{',
    rcurly: '}',
    lsquare: '[',
    rsquare: ']',
    lparen: '(',
    rparen: ')',
    colon: ':',
    integer: /[iu](?:8|(?:16|24|32|40|48)[bl])/,
    bitfield: /b[1-8]/,
    float: /f(?:16|32|64|128)[bl]/,
    char: 'char',
    NL: { match: /\n/, lineBreaks: true },
    identifier: /[A-Za-z_]+[0-9A-Za-z_]*/,
    func: '$',
    dot: '.'
  });

const enums: any[] = [];
const sequences: any[] = [];
const structures: any[] = [];

// helper function
const flatten = (arr) => {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

export interface Token { value: any; [key: string]: any };

export interface Lexer {
  reset: (chunk: string, info: any) => void;
  next: () => Token | undefined;
  save: () => any;
  formatError: (token: Token) => string;
  has: (tokenType: string) => boolean
};

export interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any
};

export type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

export var Lexer: Lexer | undefined = lexMain;

export var ParserRules: NearleyRule[] = [
    {"name": "main$ebnf$1$subexpression$1", "symbols": ["enum"]},
    {"name": "main$ebnf$1$subexpression$1", "symbols": ["sequence"]},
    {"name": "main$ebnf$1$subexpression$1", "symbols": ["structure"]},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1$subexpression$1"]},
    {"name": "main$ebnf$1$subexpression$2", "symbols": ["enum"]},
    {"name": "main$ebnf$1$subexpression$2", "symbols": ["sequence"]},
    {"name": "main$ebnf$1$subexpression$2", "symbols": ["structure"]},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1", "main$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "main$ebnf$2", "symbols": ["main"], "postprocess": id},
    {"name": "main$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "main", "symbols": ["main$ebnf$1", "WS", "main$ebnf$2"], "postprocess": thing => { return { enums, sequences, structures } }},
    {"name": "enum", "symbols": [{"literal":"enum"}, "WS", (lexMain.has("identifier") ? {type: "identifier"} : identifier), "WS", {"literal":"{"}, "WS", "enumValue", {"literal":"}"}], "postprocess": (values) => enums.push({name: values[2].value, pairs: values[6]})},
    {"name": "enumValue$ebnf$1", "symbols": ["enumValue"], "postprocess": id},
    {"name": "enumValue$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "enumValue", "symbols": ["integerLiteral", {"literal":":"}, "WS", (lexMain.has("identifier") ? {type: "identifier"} : identifier), "WS", "enumValue$ebnf$1"], "postprocess": 
        values => {
          const out = [values[0], values[3].value];
          if (values[5]) out.push(...values[5]);
          return out;
        }
        },
    {"name": "sequence$ebnf$1", "symbols": []},
    {"name": "sequence$ebnf$1$subexpression$1", "symbols": ["entry", "WS"]},
    {"name": "sequence$ebnf$1", "symbols": ["sequence$ebnf$1", "sequence$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "sequence", "symbols": [{"literal":"seq"}, "WS", (lexMain.has("identifier") ? {type: "identifier"} : identifier), "WS", {"literal":"{"}, "WS", "sequence$ebnf$1", {"literal":"}"}], "postprocess": (values) => sequences.push({name: values[2].value, entries: values[6].map(val => val[0])})},
    {"name": "structure$ebnf$1$subexpression$1$subexpression$1", "symbols": ["func"]},
    {"name": "structure$ebnf$1$subexpression$1$subexpression$1", "symbols": ["entry"]},
    {"name": "structure$ebnf$1$subexpression$1", "symbols": ["structure$ebnf$1$subexpression$1$subexpression$1", "WS"]},
    {"name": "structure$ebnf$1", "symbols": ["structure$ebnf$1$subexpression$1"]},
    {"name": "structure$ebnf$1$subexpression$2$subexpression$1", "symbols": ["func"]},
    {"name": "structure$ebnf$1$subexpression$2$subexpression$1", "symbols": ["entry"]},
    {"name": "structure$ebnf$1$subexpression$2", "symbols": ["structure$ebnf$1$subexpression$2$subexpression$1", "WS"]},
    {"name": "structure$ebnf$1", "symbols": ["structure$ebnf$1", "structure$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "structure", "symbols": [{"literal":"struct"}, "WS", (lexMain.has("identifier") ? {type: "identifier"} : identifier), "WS", {"literal":"{"}, "WS", "structure$ebnf$1", {"literal":"}"}], "postprocess": (values) => structures.push({name: values[2].value, entries: values[6].map(val => val[0][0])})},
    {"name": "func", "symbols": [{"literal":"$"}, {"literal":"jump"}, {"literal":"("}, "funcArgs", {"literal":")"}], "postprocess": (values) => {return {blockType: "func", functionName: "jump", arg: values[3]}}},
    {"name": "funcArgs$ebnf$1", "symbols": []},
    {"name": "funcArgs$ebnf$1$subexpression$1", "symbols": [{"literal":"."}, (lexMain.has("identifier") ? {type: "identifier"} : identifier)]},
    {"name": "funcArgs$ebnf$1", "symbols": ["funcArgs$ebnf$1", "funcArgs$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "funcArgs", "symbols": [(lexMain.has("identifier") ? {type: "identifier"} : identifier), "funcArgs$ebnf$1"], "postprocess": (values) => flatten(values).map(val => val.value).join('')},
    {"name": "entry$ebnf$1$subexpression$1", "symbols": [{"literal":"ref"}, "WS"]},
    {"name": "entry$ebnf$1", "symbols": ["entry$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "entry$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "entry$subexpression$1", "symbols": ["type"]},
    {"name": "entry$subexpression$1", "symbols": [(lexMain.has("identifier") ? {type: "identifier"} : identifier)]},
    {"name": "entry$ebnf$2", "symbols": ["typeCast"], "postprocess": id},
    {"name": "entry$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "entry$ebnf$3", "symbols": ["arrayIdentifier"], "postprocess": id},
    {"name": "entry$ebnf$3", "symbols": [], "postprocess": () => null},
    {"name": "entry", "symbols": ["entry$ebnf$1", "entry$subexpression$1", "WS", "entry$ebnf$2", (lexMain.has("identifier") ? {type: "identifier"} : identifier), "entry$ebnf$3"], "postprocess": 
        values => {
          const out = {};
          out["blockType"] = "type";
          out["ref"] = values[0] !== null;
          out["type"] = (typeof values[1][0] === "string") ? {raw: true, value: values[1][0] } : {raw: false, value: values[1][0].value};
          if (values[3]) out["cast"] = values[3];
          out["identifier"] = values[4].value;
          if (values[5]) out["count"] = values[5];
        
          return out
        }
        },
    {"name": "typeCast", "symbols": [{"literal":"("}, (lexMain.has("identifier") ? {type: "identifier"} : identifier), {"literal":")"}, "WS"], "postprocess": values => values[1].value},
    {"name": "arrayIdentifier", "symbols": [{"literal":"["}, "integerLiteral", {"literal":"]"}], "postprocess": values => values[1]},
    {"name": "type$subexpression$1", "symbols": [(lexMain.has("integer") ? {type: "integer"} : integer)]},
    {"name": "type$subexpression$1", "symbols": [(lexMain.has("bitfield") ? {type: "bitfield"} : bitfield)]},
    {"name": "type$subexpression$1", "symbols": [(lexMain.has("float") ? {type: "float"} : float)]},
    {"name": "type", "symbols": ["type$subexpression$1"], "postprocess": ([value]) => value[0].value},
    {"name": "type", "symbols": [{"literal":"char"}], "postprocess": (value) => value[0].value},
    {"name": "integerLiteral$subexpression$1", "symbols": [(lexMain.has("hex") ? {type: "hex"} : hex)]},
    {"name": "integerLiteral$subexpression$1", "symbols": [(lexMain.has("binary") ? {type: "binary"} : binary)]},
    {"name": "integerLiteral$subexpression$1", "symbols": [(lexMain.has("number") ? {type: "number"} : number)]},
    {"name": "integerLiteral", "symbols": ["integerLiteral$subexpression$1"], "postprocess": ([value]) => value[0].value},
    {"name": "WS", "symbols": [(lexMain.has("WS") ? {type: "WS"} : WS)], "postprocess": () => {return null}},
    {"name": "NL", "symbols": [(lexMain.has("NL") ? {type: "NL"} : NL)], "postprocess": () => {return null}}
];

export var ParserStart: string = "main";
