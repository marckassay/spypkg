#!/usr/bin/env node

import * as child from 'child_process';
import * as path from 'path';

import { promisify } from 'util';
import { SpawnOptions } from 'child_process';
const spawn = <(command: string, opts: SpawnOptions) => Promise<child.ChildProcess>>promisify(child.spawn);

const options: SpawnOptions = {
  stdio: 'inherit',
  shell: true
};

const exe = async (expression) => {
  if (verboseEnabled) {
    console.log('[spypkg] Executing: ' + expression);
  }

  return await spawn(expression, options)
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

const ext = process.platform === 'win32' ? '.cmd' : '';
const command = path.join(process.cwd(), 'node_modules/.bin/', process.argv[2].toString() + ext);

// prepare argv values into a flat argument
for (let j = 3; j < process.argv.length; j++) {
  if (process.argv[j] === '--verbose') {
    verboseEnabled = true;
  } else {
    argument += ' ' + process.argv[j];
  }
}
argument = argument.trimLeft();

// let prefix: string = (process.platform === 'win32') ? 'cmd /c' : '';

exe(command + ' ' + argument);
