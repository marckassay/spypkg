import * as child from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import { promisify } from 'util';

const exec = promisify(child.exec);
const changeMode = promisify(fs.chmod);
const copy = promisify(fs.copy);

async function deploy() {
  try {
    // attempts to find 'yarn.lock' for 'yarn', defaults to 'npm'
    const getPackMan = () => {
      try {
        fs.accessSync(path.join(process.cwd(), 'yarn.lock'));
        return 'yarn';
      } catch (error) {
        return 'npm';
      }
    }
    const packManVal = getPackMan();
    const npmExe = packManVal;

    // keep relative paths as-is to avoid possible issues POSIX...
    const shellExe = (process.platform === 'win32') ? 'cmd /c' : '';
    const relativeHarnessSrcPath = 'harness/spypkg-harness';
    const relativeHarnessDestinationPath = '../spypkg-harness';

    try {
      await copy(relativeHarnessSrcPath, relativeHarnessDestinationPath);
      console.log('[spypkg] Copied: ' + relativeHarnessSrcPath + ' -> ' + relativeHarnessDestinationPath);
    } catch (err) {
      console.error('[spypkg] ' + err);
      return;
    }

    if (process.platform !== 'win32') {
      try {
        await makeFileExecutable(relativeHarnessDestinationPath);
        console.log('[spypkg] Relaxed premissions for : ' + relativeHarnessDestinationPath);
      } catch (err) {
        console.error('[spypkg] ' + err);
        return;
      }
    }

    console.log(`[spypkg] step 1/2 - Registering module for '${npmExe}' for linking.`);

    // below is step 1 out of 2 of the node package manager linking process...
    let command = (shellExe + ' ' + npmExe + ' link').trimLeft();
    console.log('[spypkg] Executing: ' + command);
    const successfullyLinked = await exec(command)
      .then((onfulfilled) => {
        if (onfulfilled.stdout) {
          console.log('[spypkg] ' + onfulfilled.stdout);
        }
        if (onfulfilled.stderr) {
          console.error('[spypkg] ' + onfulfilled.stderr);
        }
        return true;
      })
      .catch((reason) => {
        console.error('[spypkg] ' + reason);
        return false;
      });

    // if step 1 out of 2 succeeded, execute step 2 in the harness dir...
    if (successfullyLinked) {
      process.chdir(relativeHarnessDestinationPath);
      console.log(`[spypkg] Changed directory to: ${process.cwd()}`);

      console.log('[spypkg] step 2/2 - Appling new link to harness directory.');

      // ...now execute the link command again specifiying 'spypkg'...
      command = (shellExe + ' ' + npmExe + ' link spypkg --dev').trimLeft();
      console.log('[spypkg] Executing: ' + command);
      await exec(command)
        .then((onfulfilled) => {
          if (onfulfilled.stdout) {
            // console.log(onfulfilled.stdout);
            console.log('[spypkg] Test harness deployed successfully!');
          }
          if (onfulfilled.stderr) {
            console.error('[spypkg] ' + onfulfilled.stderr);
            return;
          }
        })
        .catch((reason) => {
          console.error('[spypkg] ' + reason);
          return;
        });
    }
  } catch (err) {
    console.error('[spypkg] ' + err);
  }
}
deploy();


async function makeFileExecutable(filePath): Promise<void> {
  return changeMode(filePath, '777')
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
