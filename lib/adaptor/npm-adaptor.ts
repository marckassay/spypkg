#!/usr/bin/env node

import * as child from 'child_process';
import { promisify } from 'util';
import { SpawnOptions } from 'child_process';

const spawn = <(command: string, opts: SpawnOptions) => Promise<child.ChildProcess>>promisify(child.spawn);

const options: SpawnOptions = {
  stdio: 'inherit',
  shell: true
};

interface NPMExpressionShape {
  exe?: string;
  run?: string;
  command: string;
  pkgdetails?: string;
  options?: string;
}

/**
 * @external https://regex101.com/r/6PIM2J/6
 */
const regex = new RegExp([
  '^(?<exe>npm)?\\ ?',
  '(?<run>(?<=\\k<exe> )run(?:-script)?)?\\ ?',
  '(?<command>(?<=\\k<run> )[a-z]+(?:[-|:|.|_][a-z]+)?|(?<!\\k<run> )[a-z]+(?:[-][a-z]+)?)?\\ ?',
  '(?<pkgdetails>[a-z0-9\\>\\=\\:\\+\\#\\^\\.\\@\\/][a-z0-9\\>\\=\\:\\+\\#\\^\\~\\.\\@\\/\\-]+)?\\ ?',
  '(?<options>(?:\\ [-]{1,2}[a-zA-Z]+(?:[-][a-z]+)*)*)?$'
].join(''));

function getIsoMorphedExpression(npmex: NPMExpressionShape): string {
  const commmandsEquivalenceTable = {
    'install': 'add',
    'i': 'add',
    'uninstall': 'remove',
    'view': 'info'
  }

  const optionsEquivalenceTable = {
    '--no-package-lock': '--no-lockfile',
    '--production': '',
    '--save': '',
    '--save-prod': '',
    '-P': '',
    '--save-dev': '--dev',
    '-D': '--dev',
    '--save-optional': '--optional',
    '-O': '--optional',
    '--save-exact': '--exact',
    '-E': '--exact',
    '--global': ''
  };

  const map = (table, value: string | string[]) => {
    if (typeof value === "string") {
      value = [value];
    }
    return value.map((val) => {
      // if the mapped val is undefined, return original val
      const mappedval = table[val];
      return (mappedval !== undefined) ? mappedval : val;
    });
  };

  const macromap = () => {
    if (npmex.command) {
      npmex.command = map(commmandsEquivalenceTable, npmex.command)[0];
    }
    options = map(optionsEquivalenceTable, options);
  };

  npmex.exe = 'yarn';

  let options: string[] = (npmex.options) ? npmex.options.split(' ').filter(value => value.length) : [];

  if (npmex.command && !npmex.pkgdetails) {
    if (npmex.command === 'update' && options.indexOf('--global') !== -1) {
      npmex.command = 'global upgrade';
      options = options.filter((value) => value !== '--global');
    } else if (npmex.command === 'rebuild') {
      npmex.command = 'add';
      options.push('--force');
    } else if (options.length) {
      if (options.indexOf('--no-package-lock') === -1) {
        npmex.command = map(commmandsEquivalenceTable, npmex.command)[0];
      } else {
        npmex.command = 'install';
      }
      options = map(optionsEquivalenceTable, options);
    }
  } else if (npmex.command && npmex.pkgdetails) {
    if (npmex.command === 'install' && options.indexOf('--global') !== -1) {
      npmex.command = 'global add';
      options = options.filter((value) => value !== '--global');
    } else if (npmex.command === 'version') {
      options = ['--' + npmex.pkgdetails];
      npmex.pkgdetails = '';
    } else {
      macromap();
    }
    macromap();
  }

  return [npmex.exe, npmex.run, npmex.command, npmex.pkgdetails]
    .concat(options)
    .filter((value) => {
      if (value != '' || value != undefined) {
        return value;
      }
    })
    .join(' ');
};

const exe = async (npmExpression, yarnExpression) => {
  if (verboseEnabled) {
    console.log('[spypkg] The npm expression below has been transformed into the followed yarn expression:');
    console.log(npmExpression);
    console.log(yarnExpression);
  }

  return await spawn(yarnExpression, options)
    .then((onfulfilled) => {
      if (onfulfilled.stdout) {
        console.log(onfulfilled.stdout);
      }
      if (onfulfilled.stderr) {
        console.log(onfulfilled.stderr);
      }
    })
    .catch((reason) => {
      console.log(reason);
    });
};

let verboseEnabled: boolean;
let argument: string = '';

// prepare argv values into argument, so that regex can parse as expected
for (let j = 2; j < process.argv.length; j++) {
  if (process.argv[j] === '--verbose') {
    verboseEnabled = true;
  } else {
    argument += ' ' + process.argv[j];
  }
}
argument = argument.trimLeft();

let prefix: string = (process.platform === 'win32') ? 'cmd /c' : '';

const parsedArg: NPMExpressionShape = regex.exec(argument)['groups'];

const transformedExpression: string = getIsoMorphedExpression(parsedArg);

exe(argument, (prefix + ' ' + transformedExpression).trimLeft());
