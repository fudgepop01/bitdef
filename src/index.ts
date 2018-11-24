import * as fs from 'fs';
import {promisify} from 'util';
import * as Path from 'path';
import * as grammar from './parser';
import * as nearley from 'nearley';

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

const clean = (thing: any, target: string, filteredArr: any[]): undefined | any[] => {
  if (Array.isArray(thing)) {
    filteredArr.push(thing.reduce((filtered, value) => clean(value, target, filtered), []))
    return filteredArr;
  }
  else if (thing && typeof thing === "object") {
    filteredArr.push(thing[target])
    return filteredArr;
  }
  else return filteredArr;
}

const generate = async () => {
  let input = await consolidate(`${__dirname}/bitdef-brawllib/RSTM.bdef`);

  const outFile: string = `${__dirname}/../out/out.json`;
  const outValueFile: string = `${__dirname}/../out/outValues.json`;

  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

  parser.feed(input);

  let cleaned = clean(parser.results, "value", []);

  fs.writeFileSync(outFile, JSON.stringify(parser.results, null, 2), 'utf8');
  fs.writeFileSync(outValueFile, JSON.stringify(cleaned, null, 2), 'utf8');
}

generate();