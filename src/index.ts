import * as fs from 'fs';
import {promisify} from 'util';
import * as Path from 'path';
import * as grammar from './parser';
import * as nearley from 'nearley';
import * as prettier from 'prettier';

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


const spreadEnumPairs = (arr: string[]) => {
  let out = ""
  for (let i = 0; i < arr.length; i += 2) {
    out += `${arr[i+1]} = ${arr[i]},\n\t`
  }
  return out;
}

interface typeEntry {
  type: {raw: boolean, value: string},
  identifier: string,
  cast?: string,
  count?: number,
  ref: boolean
}
const spreadClassDefinitions = (types: typeEntry[]): string => {
  let out = "";
  for (const entry of types) {
    if (entry.ref) out += `public ${entry.identifier}: Pointer;\n`
    else out += `public ${entry.identifier}: ${entry.type.raw ? 'RawType' : entry.type.value}${entry.count && entry.type.value !== 'char' ? "[]" : ''};\n`
  }
  return out
}
const spreadClassBuilders = (types: typeEntry[]): string => {
  let out = "";

  for (const entry of types) {
    if (entry.type.value === 'char') {
      if (entry.count && entry.count > 0) out += `$.${entry.identifier} = r.str($, ${entry.count})\n`;
      else out += `$.${entry.identifier} = r.ntstr($)\n`;
      continue;
    }

    if (entry.count) {
      out += `$.${entry.identifier} = new Array(${entry.count});
      for (let i = 0; i < ${entry.count}; i++) {`;
      if (entry.type.raw) out += `$.${entry.identifier}[i] = r.${entry.type.value}($);`
      else out += `$.${entry.identifier}[i] = new ${entry.type.value}({
        position: r.position,
        parent: $,
        root: $.root,
        reader: r
      })`;
      out += '};\n';
    }
    else {
      if (entry.type.raw) {
        out += `$.${entry.identifier} = r.${entry.type.value}($)\n`
      }
      else out += `$.${entry.identifier} = new ${entry.type.value}({
        position: r.position,
        parent: $,
        root: $.root,
        reader: r,
      })\n`;
    }

  }

  return out;
}

const generate = async () => {
  let input = await consolidate(`${__dirname}/bitdef-brawllib/RSTM.bdef`);

  const outFile: string = `${__dirname}/../out/out.json`;

  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

  parser.feed(input);
  let parsed = parser.results[0];

  let out = {
    enums: "",
    sequences: `
    import { TypeNode, ITypeNodeArgs } from './base/TypeNode';
    import { RawType, BitField, Pointer } from './base/Types';
    `
  }

  for (const entry of parsed['enums']) {
    out.enums += `
      export enum ${entry.name} {
        ${spreadEnumPairs(entry.pairs)}
      }
    `
  }

  for (const seq of parsed['sequences']) {
    out.sequences += `
      export class ${seq.name} extends TypeNode {
        ${spreadClassDefinitions(seq.entries)}
        constructor(args: ITypeNodeArgs) {
          super(args);
          let $ = this;
          let r = $.reader;

          ${spreadClassBuilders(seq.entries)}
          $.finalize();
        }
      }
    `
  }

  // make the code look pretty
  out.sequences = prettier.format(out.sequences, {parser: 'typescript'});
  out.enums = prettier.format(out.enums, {parser: 'typescript'});

  if (!fs.existsSync(`${__dirname}/../out/base`)) {
    fs.mkdirSync(`${__dirname}/../out/base`);
    fs.copyFileSync(`${__dirname}/generators/typescript/TypeNode.ts`, `${__dirname}/../out/base/TypeNode.ts`)
    fs.copyFileSync(`${__dirname}/generators/typescript/NodeFactory.ts`, `${__dirname}/../out/base/NodeFactory.ts`)
    fs.copyFileSync(`${__dirname}/generators/typescript/Types.ts`, `${__dirname}/../out/base/Types.ts`)
    fs.copyFileSync(`${__dirname}/generators/typescript/FileReader.ts`, `${__dirname}/../out/base/FileReader.ts`)
  }

  fs.copyFileSync(`${__dirname}/generators/typescript/TypeNode.ts`, `${__dirname}/../out/base/TypeNode.ts`)
  fs.copyFileSync(`${__dirname}/generators/typescript/NodeFactory.ts`, `${__dirname}/../out/base/NodeFactory.ts`)
  fs.copyFileSync(`${__dirname}/generators/typescript/Types.ts`, `${__dirname}/../out/base/Types.ts`)
  fs.copyFileSync(`${__dirname}/generators/typescript/FileReader.ts`, `${__dirname}/../out/base/FileReader.ts`)

  fs.writeFileSync(`${__dirname}/../out/sequences.ts`, out.sequences, 'utf8');
  fs.writeFileSync(`${__dirname}/../out/enums.ts`, out.enums, 'utf8');
  fs.writeFileSync(outFile, JSON.stringify(parser.results, null, 2), 'utf8');


}

generate();