import * as child from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
const fs = require('fs-extra');
const exec = promisify(child.exec);

export async function deploy() {
  try {
    const shellExe = (process.platform === 'win32') ? 'cmd /c' : '';
    // the following regex on Linux fails, but not on Windows. strangely it fails only when executed
    // via '[yarn|npm] run' command but not directly using Node (node -e "console.log(...)")
    // const npmExe: string = (RegExp(/.*([Y|y]arn.bin).*/).test(process.env.PATH)) ? 'yarn' : 'npm';
    const npmExe: string = (process.env.PATH.search('Yarn')) ? 'yarn' : 'npm';
    const relativeHarnessSrcPath = path.resolve('harness/altpack-harness/').normalize();
    const relativeHarnessDestinationPath = path.resolve('../altpack-harness/').normalize();

    // Create filesystem symlink..
    const createSymlink = async () => {
      try {
        await fs.ensureSymlink(relativeHarnessSrcPath, relativeHarnessDestinationPath, 'dir');
        console.log('[altpackage] Created filesystem symlink from: ' + relativeHarnessSrcPath + ', to: ' + relativeHarnessDestinationPath);
      } catch (err) {
        console.error('[altpackage]' + err);
      }
    }
    await createSymlink();

    console.log(`[altpackage] step 1/2 - Registering module for '${npmExe}' for linking.`);
    // below is step 1 out of 2 of the node pm linking process...
    let command: string = (shellExe + ' ' + npmExe + ' link').trimLeft();
    console.log('[altpackage] Executing: ' + command);
    const toProceed = await exec(command)
      .then((onfulfilled) => {
        if (onfulfilled.stdout) {
          console.log(onfulfilled.stdout);
          return true;
        }
        if (onfulfilled.stderr) {
          console.log(onfulfilled.stderr);
          return false;
        }
      })
      .catch((reason) => {
        console.log(reason);
        return false;
      });

    // if step 1 out of 2 succeeded, execute step 2 in the harness dir...
    if (toProceed) {
      process.chdir(relativeHarnessDestinationPath);
      console.log(`[altpackage] Changed directory to: ${process.cwd()}`);
      console.log('[altpackage] step 2/2 - Appling new link to harness directory.');
      // ...now execute the link command again specifiying 'altpackage'...
      command = (shellExe + ' ' + npmExe + ' link altpackage --dev').trimLeft();
      console.log('[altpackage] Executing: ' + command);
      return await exec(command)
        .then((onfulfilled) => {
          if (onfulfilled.stdout) {
            // console.log(onfulfilled.stdout);
            console.log('[altpackage] Test harness deployed successfully.');
          }
          if (onfulfilled.stderr) {
            console.log('[altpackage] ' + onfulfilled.stderr);
          }
        })
        .catch((reason) => {
          console.log('[altpackage] ' + reason);
        });
    }

  } catch (err) {
    console.error('[altpackage] ' + err);
  }
}
deploy();
