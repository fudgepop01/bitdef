import * as fs from 'fs';
import * as moo from 'moo';
import {promisify} from 'util';
import * as Path from 'path';
const readFile = promisify(fs.readFile);
const readFileSync = fs.readFileSync;

const consolidate = async (path: string) => {
  let paths: string[] = [];
  let root = Path.dirname(path);

  const replacer = (input: string): string => {
    let file = readFileSync(input, 'utf8');

    file = file.replace(/# import (?:'(.+)'|"(.+)")/g, (fullstr, match: string) => {
      let nextPath = Path.join(root, match);
      if (paths.indexOf(nextPath) === -1) {
        paths.push(nextPath);
        return replacer(nextPath);
      }
      return '';
    });

    return file;
  }

  paths.push(path);
  return replacer(path);
}



const generate = async () => {
  let input = await consolidate(`${__dirname}/bitdef-tests/firstPass.bdef`);

  const mainOut: string = await readFile(`${__dirname}/generators/typescript/index.ts`, 'utf8');

  const lexMain = moo.compile({
    WS: /[ \t]+/,
    comment: /\/\/.*?$/,
    number: /0|[1-9][0-9]*/,
    lcurly: '{',
    rcurly: '}',
    lsquare: '[',
    rsquare: ']',
    colon: ':',
    integer: /[iu](?:8|(?:16|24|32|40|48)[bl])/,
    bitfield: /b[1-8]/,
    float: /f(?:16|32|64|128)[bl]/,
    char: 'char',
    keywords: ['struct', 'enum', 'get', 'set', 'ref'],
    NL: { match: /\n/, lineBreaks: true, value(str) {return '\\n'} },
    identifier: /[A-Za-z_]+[0-9A-Za-z_]*/
  });

  lexMain.reset(input);

  let out = "";
  const typesUsed: string[] = [];
  for (const match of lexMain) {
    if ( match.type && typesUsed.indexOf(match.value) === -1 && ['char', 'float', 'bitfield', 'integer'].indexOf(match.type) !== -1) {
      typesUsed.push(match.value);
    }
  }
  console.log(mainOut.replace("// <getters>", typesUsed.sort().map(type => {
    return `get ${type}() { return new ${type}(this.buffer, this) }`;
  }).join('\n  ')));

}

generate();