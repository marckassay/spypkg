#!/usr/bin/env node

import * as child from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
const exec = promisify(child.exec);

// const ext = process.platform === 'win32' ? '.cmd' : '';
// const command = path.join(process.cwd(), 'node_modules/.bin/', process.argv[2].toString() + ext);

const opts = Object.assign({}, process.env);
opts.cwd = process.cwd();
opts.stdio = 'inherit';

// TODO: intergrate 'process.env.ComSpec'
const shellExe = (process.platform === 'win32') ? 'cmd /c' : '';
const npmExe: string = (RegExp(/.*([Y|y]arn[\\|\/]bin).*/gm).test(process.env.PATH)) ? 'yarn' : 'npm';
const command: string = (shellExe + ' ' + npmExe + '  add-altpackage').trimLeft();
const exe = async () => {
    return await exec(command)
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

console.log('Executing: ' + command);
exe();