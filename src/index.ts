import * as fs from 'fs';
import * as moo from 'moo';
import {promisify} from 'util';
const readFile = promisify(fs.readFile);
const generate = async () => {

  const mainOut: string = await readFile('./src/generators/typescript/index.ts', 'utf8');

  const lexer = moo.compile({
    WS: /[ \t]+/,
    comment: /\/\/.*?$/,
    number: /0|[1-9][0-9]*/,
    lcurly: '{',
    rcurly: '}',
    integer: /[iu](?:8|16|24|32|40|48)[bl]/,
    bitfield: /b[1-8]/,
    float: /f(?:16|32|64|128)[bl]/,
    char: 'char',
    keywords: ['struct', 'enum', 'get', 'set', 'ref'],
    NL: { match: /\n/, lineBreaks: true, value(str) {return '\\n'} },
    identifier: /[A-Za-z_]+[0-9A-Za-z_]*/,
  });

  lexer.reset(`
  struct thing {
    i32l i32test
    u8b u8test
    u8b u8duplicate
    b5 bitfield
    f64b float
  }
  `);

  let out = "";
  const typesUsed: string[] = [];
  for (const match of lexer) {
    if ( match.type && typesUsed.indexOf(match.value) === -1 && ['char', 'float', 'bitfield', 'integer'].indexOf(match.type) !== -1) {
      typesUsed.push(match.value);
    }
  }
  console.log(mainOut.replace("// <getters>", typesUsed.sort().map(type => {
    return `get ${type}() { return new ${type}() }`;
  }).join('\n  ')));

}

generate();