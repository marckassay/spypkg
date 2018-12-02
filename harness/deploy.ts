import * as child from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
const fs = require('fs-extra');
const exec = promisify(child.exec);


export async function deploy() {

  try {
    /*    await fs.copy(srcHarnessDirectory, '..\\altpack-harness\\')
      .then(() => console.log('Deployed test harness: ' + path.resolve('..\\altpack-harness\\')))
      .catch(err => console.error(err)); */
    await fs.ensureSymlink('.\\harness\\altpack-harness\\', '..\\altpack-harness\\')
    console.log('Deployed symlink for test harness: ' + path.resolve('..\\altpack-harness\\'));

    // promisify();
    // const ext = process.platform === 'win32' ? '.cmd' : '';

    process.chdir(path.resolve('..\\altpack-harness\\'));
    console.log(`Changed directory to: ${process.cwd()}`);
    // ['/c', 'yarn', 'run']
    /*     const result = child.exec('cmd /c yarn run install-package');
        if (result.error || result.status !== 0) {
          process.exit(1);
        } else {
          process.exit(0);
        } */
    console.log('Executing: cmd /c yarn run install-package');

    return await exec('cmd /c yarn run install-package')
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
