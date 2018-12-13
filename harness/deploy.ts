import * as child from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const fs = require('fs-extra');
const exec = promisify(child.exec);

/**
 * Checks the destination for exisitence, if not existent it will create a copy from source.
 */
export async function checkAndCreateACopy(source, destination): Promise<boolean> {
  const copy = promisify(fs.copyFile);
  return await doesFileExistAsync(destination)
    .then((value: boolean) => {
      if (value === false) {
        // node.js ^10.12.0 is at least needed for mkdirSync's recursive option.
        const destinationDirectoryPath = path.dirname(destination);
        fs.mkdirSync(destinationDirectoryPath, { recursive: true });
        copy(source, destination);
        return Promise.resolve<boolean>(true);
      } else {
        return Promise.resolve<boolean>(false);
      }
    });
}

export async function doesFileExistAsync(filePath, err_message?: string): Promise<boolean> {
  const doesFileExist = promisify(fs.exists);
  return await doesFileExist(filePath)
    .then((value): boolean => {
      if (value === false && err_message) {
        console.error(err_message);
        process.exit(1001);
      } else {
        return value;
      }
    })
    .catch(() => {
      console.error(err_message);
      process.exit(1001);
      return false; // superfluous, but linter wants it.
    });
}

export async function deploy() {
  try {
    const shellExe = (process.platform === 'win32') ? 'cmd /c' : '';
    // the following regex on Linux fails, but not on Windows. strangely it fails only when executed
    // via '[yarn|npm] run' command but not directly using Node (node -e "console.log(...)")
    // const npmExe: string = (RegExp(/.*([Y|y]arn.bin).*/).test(process.env.PATH)) ? 'yarn' : 'npm';
    const npmExe: string = (process.env.PATH.search('Yarn')) ? 'yarn' : 'npm';
    // keep relative paths as-is to avoid issues with linux distros...
    const relativeHarnessSrcPath = 'harness/spypkg-harness';
    const relativeHarnessDestinationPath = '../spypkg-harness';

    // Create filesystem symlink... 
    const createSymlink = async () => {
      try {
        await fs.ensureSymlink(relativeHarnessSrcPath, relativeHarnessDestinationPath, 'dir');
        console.log('[spypkg] Created filesystem symlink from: ' + relativeHarnessSrcPath + ', to: ' + relativeHarnessDestinationPath);

      } catch (err) {
        console.error('[spypkg] ' + err);
      }
    }
    await createSymlink();

    // no need to wait for this copy op...
    checkAndCreateACopy("build/harness/.bin", relativeHarnessDestinationPath + "/node_modules/.bin");

    console.log(`[spypkg] step 1/2 - Registering module for '${npmExe}' for linking.`);
    // below is step 1 out of 2 of the nocde pm linking process...
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
        console.log(reason);
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
            console.log('[spypkg] Test harness deployed successfully.');
          }
          if (onfulfilled.stderr) {
            console.log('[spypkg] ' + onfulfilled.stderr);
          }
        })
        .catch((reason) => {
          console.log('[spypkg] ' + reason);
        });
    }

  } catch (err) {
    console.error('[spypkg] ' + err);
  }
}
deploy();
