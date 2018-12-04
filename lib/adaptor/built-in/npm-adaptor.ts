#!/usr/bin/env node

import { promisify } from 'util';
import * as child from 'child_process';
const exec = promisify(child.exec);

interface RegExShape {
  exe?: string;
  run?: string;
  command: string;
  pkgdetails: string;
  options: string;
}

/**
 * Maps values from `source` (an optionsEquivalenceTable) to `target`. `target` may be one or many segments
 * of an npm expression, such as command or options.
 *
 * @param source an optionsEquivalenceTable that is declared
 * @param target may be a segment of an npm expression such as command or options
 */
function isoMorphCollection(source: {}, target: string[]): string[] {
  return target.map((val) => {
    const mappedval = source[val.trim()];
    return (mappedval) ? mappedval : val;
  });
}

const optionsEquivalenceTable = {
  '--no-package-lock': '--no-lockfile',
  '--production': '',
  '--save': '**prod',
  '--save-prod': '**prod',
  '-P': '**prod',
  '--save-dev': '--dev',
  '-D': '--dev',
  '--save-optional': '--optional',
  '-O': '--optional',
  '--save-exact': '--exact',
  '-E': '--exact',
  '--global': '**global'
};

const regex = new RegExp([
  '^(?<exe>npm)?\\ ?',
  '(?<run>(?<=\\k<exe> )run(?:-script)?)?\\ ?',
  '(?<command>(?<=\\k<run> )[a-z]+(?:[:][a-z]+)?|(?<!\\k<run> )[a-z]+(?:[-][a-z]+)?)(?<=\\k<command>)\\ ?',
  '(?<pkgdetails>[a-z0-9\\>\\=\\:\\+\\#\\^\\.\\@\\-\\/]*|(?<!\\k<command>)$)?',
  '(?<options>(?:\\ [-]{1,2}[a-zA-Z]+(?:[-][a-z]+)?)*)$'
].join(''));

let verboseEnabled: boolean;

// tslint:disable-next-line:no-inferrable-types
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
const parsedArg: RegExShape = regex.exec(argument)['groups'];

const getPrefixForYarnExpression = (yarnExpression: string[]) => {
  let transformedExe: string;

  if (process.platform === 'win32') {
    transformedExe = 'cmd';
    if (!parsedArg.run) {
      yarnExpression = ['/c', 'yarn'].concat(yarnExpression);
    } else {
      yarnExpression = ['/c', 'yarn', 'run'].concat(yarnExpression);
    }
  } else {
    transformedExe = 'yarn';
    if (parsedArg.run) {
      yarnExpression = ['run'].concat(yarnExpression);
    }
  }

  return transformedExe + ' ' + yarnExpression.join(' ');
};

const exe = async (npmExpression, yarnExpression) => {
  if (verboseEnabled) {
    console.log('The npm expression below has been transformed into the followed yarn expression:');
    console.log(npmExpression);
    console.log(yarnExpression);
  }

  return await exec(yarnExpression)
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
}

// TODO: unsure how to handle short expressions like this with current regex:
if (argument === 'npm -v') {
  exe(argument, 'yarn -v');
} else {
  let transformedCommand: string;
  // tslint:disable-next-line:no-inferrable-types
  let transformedPkgDetails: string = '';
  let transformedOptions: Array<string> | undefined;
  let transformedOptionsString: string;

  if (parsedArg.pkgdetails) {
    transformedPkgDetails = parsedArg.pkgdetails;
  }

  if (parsedArg.options) {
    transformedOptions = isoMorphCollection(optionsEquivalenceTable, parsedArg.options.trim().split(' '));
  }

  switch (parsedArg.command) {
    case 'uninstall':
      transformedCommand = 'remove';

      if (transformedOptions && transformedOptions.some((value) => value === '**prod')) {
        transformedOptions = transformedOptions.filter((value) => value !== '**prod');
      } else if (transformedOptions && transformedOptions.some((value) => value === '**global')) {
        transformedCommand = 'global remove';
      }
      break;
    case 'install':
      transformedCommand = 'add';

      if (transformedOptions && transformedOptions.some((value) => value === '**prod')) {
        transformedOptions = transformedOptions.filter((value) => value !== '**prod');
      } else if (transformedOptions && transformedOptions.some((value) => value === '**global')) {
        transformedCommand = 'global add';
      } else if (!transformedPkgDetails) {
        transformedCommand = 'install';
      }
      break;
    default:
      transformedCommand = parsedArg.command;
  }

  transformedOptionsString = (transformedOptions) ? transformedOptions.join(' ') : '';

  const transformedExpression = [transformedCommand, transformedPkgDetails, transformedOptionsString].filter((value) => value.length > 0);

  exe(argument, getPrefixForYarnExpression(transformedExpression));
}
