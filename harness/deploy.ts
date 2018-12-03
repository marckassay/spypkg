import * as child from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
const fs = require('fs-extra');
const exec = promisify(child.exec);


export async function deploy() {
  try {
    // TODO: intergrate 'process.env.ComSpec'
    const shellExe = (process.platform === 'win32') ? 'cmd /c' : '';
    const npmExe: string = (RegExp(/.*([Y|y]arn[\\|\/]bin).*/gm).test(process.env.PATH)) ? 'yarn' : 'npm';

    await fs.ensureSymlink('.\\harness\\altpack-harness\\', '..\\altpack-harness\\')
    console.log('Deployed symlink for test harness: ' + path.resolve('..\\altpack-harness\\'));

    let command: string = shellExe + npmExe + ' link';
    await exec(command)
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

    process.chdir(path.resolve('..\\altpack-harness\\'));
    console.log(`Changed directory to: ${process.cwd()}`);


    command = shellExe + npmExe + ' run install-altpackage';
    console.log('Executing: ' + command);
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

  } catch (err) {
    console.error(err);
  }
}
deploy();
