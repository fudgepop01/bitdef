@preprocessor typescript

@{%
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
    identifier: /[A-Za-z_]+[0-9A-Za-z_]*/
  });

const enums: any[] = [];
const sequences: any[] = [];
%}

@lexer lexMain

main -> (enum | sequence):+ WS main:? {% thing => { return { enums, sequences } }%}

enum -> "enum" WS %identifier WS "{" WS enumValue "}" {% (values) => enums.push({name: values[2].value, pairs: values[6]}) %}

enumValue -> integerLiteral ":" WS %identifier WS enumValue:? {%
  values => {
    const out = [values[0], values[3].value];
    if (values[5]) out.push(...values[5]);
    return out;
  }
%}

sequence -> "seq" WS %identifier WS "{" WS entry WS "}" {% (values) => sequences.push({name: values[2].value, entries: values[6]}) %}

entry -> ("ref" WS):? (type | %identifier) WS typeCast:? %identifier arrayIdentifier:? (WS entry):? {%
  values => {
    const out = {};
    out["ref"] = values[0] !== null;
    out["type"] = (typeof values[1][0] === "string") ? {raw: true, value: values[1][0] } : {raw: false, value: values[1][0].value};
    if (values[3]) out["cast"] = values[3];
    out["identifier"] = values[4].value;
    if (values[5]) out["count"] = values[5];

    if (values[6] && Array.isArray(values[6][1])) return [out, ...values[6][1]]
    else if (values[6]) return [out, values[6][1]]
    else return [out]
  }
%}

typeCast -> "(" %identifier ")" WS {% values => values[1].value %}

arrayIdentifier -> "[" integerLiteral "]" {% values => values[1] %}

type -> ( %integer | %bitfield | %float ) {% ([value]) => value[0].value %}
  | "char" {% (value) => value[0].value %}

integerLiteral -> ( %hex | %binary | %number ) {% ([value]) => value[0].value %}

  # whitespace; newline

  WS -> %WS {% () => {return null} %}
  NL -> %NL {% () => {return null} %}