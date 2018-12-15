import * as child from 'child_process';
import * as path from 'path';
import { promisify } from 'util';

const fs = require('fs-extra');
const exec = promisify(child.exec);

async function makeFileExecutable(filePath): Promise<void> {
  const changeMode = promisify(fs.chmod);
  // octal '555' is expressed as: -r-xr-xr-x
  return changeMode(filePath, '555')
    .then(() => {
      return Promise.resolve();
    }, () => {
      console.error('[spypkg] Unable to make the following file executable for POSIX environments: ' + filePath);
      process.exit(1006);
      return;
    })
    .catch(() => {
      console.error('[spypkg] Unable to make the following file executable for POSIX environments: ' + filePath);
      process.exit(1006);
      return;
    });
}

async function deploy() {
  try {
    // keep relative paths as-is to avoid issues POSIX...
    const relativeHarnessSrcPath = 'harness/spypkg-harness';
    const relativeHarnessDestinationPath = '../spypkg-harness';

    const shellExe = (process.platform === 'win32') ? 'cmd /c' : '';
    const npmExe = (await fs.pathExists(path.join(process.cwd(), 'yarn.lock'))) ? 'yarn' : 'npm';

    // Create filesystem symlink from 'spypkg-harness' to 'harness/spypkg-harness'...
    try {
      await fs.ensureSymlink(relativeHarnessSrcPath, relativeHarnessDestinationPath, 'dir');
      console.log('[spypkg] Created filesystem symlink from: ' + relativeHarnessSrcPath + ', to: ' + relativeHarnessDestinationPath);
    } catch (err) {
      console.error('[spypkg] ' + err);
    }

    // Copy 'build/harness/.bin' to 'spypkg-harness/node_modules/.bin'...
    try {
      await fs.copy('build/harness/.bin', relativeHarnessDestinationPath + '/node_modules/.bin');
      console.log('[spypkg] Copied: build/harness/.bin --> ' + relativeHarnessDestinationPath + '/node_modules/.bin');
    } catch (err) {
      console.error('[spypkg] ' + err);
    }

    // Make 'spypkg-harness/node_modules/' executable...
    try {
      await makeFileExecutable(relativeHarnessDestinationPath);
      console.log('[spypkg] Changed mode to executable: ' + relativeHarnessDestinationPath + '/node_modules');
    } catch (err) {
      console.error('[spypkg] ' + err);
    }

    console.log(`[spypkg] step 1/2 - Registering module for '${npmExe}' for linking.`);

    // below is step 1 out of 2 of the node package manager linking process...
    let command: string = (shellExe + ' ' + npmExe + ' link').trimLeft();
    console.log('[spypkg] Executing: ' + command);
    const toProceed = await exec(command)
      .then((onfulfilled) => {
        if (onfulfilled.stdout) {
          console.log(onfulfilled.stdout);
        }
        if (onfulfilled.stderr) {
          console.log(onfulfilled.stderr);
        }
        return true;
      })
      .catch((reason) => {
        console.log('[spypkg] ' + reason);
        return false;
      });

    // if step 1 out of 2 succeeded, execute step 2 in the harness dir...
    if (toProceed) {
      process.chdir(relativeHarnessDestinationPath);
      console.log(`[spypkg] Changed directory to: ${process.cwd()}`);

      console.log('[spypkg] step 2/2 - Appling new link to harness directory.');

      // ...now execute the link command again specifiying 'spypkg'...
      command = (shellExe + ' ' + npmExe + ' link spypkg --dev').trimLeft();
      console.log('[spypkg] Executing: ' + command);
      return await exec(command)
        .then((onfulfilled) => {
          if (onfulfilled.stdout) {
            // console.log(onfulfilled.stdout);
            console.log('[spypkg] Test harness deployed successfully!');
          }
          if (onfulfilled.stderr) {
            console.log('[spypkg] ' + onfulfilled.stderr);
          }
        })
        .catch((reason) => {
          console.log('[spypkg] ' + reason);
          return false;
        });
    }
  } catch (err) {
    console.error('[spypkg] ' + err);
  }
}
deploy();
