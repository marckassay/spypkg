import * as child from 'child_process';
import * as fs from 'fs';
import { promisify } from 'util';
import * as path from 'path';
const fse = require('fs-extra');

// TODO: remove this to make it public; currently conflicts with orginial function
const readFileAsync2 = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const renameFileAsync = promisify(fs.rename);

// tslint:disable-next-line:newspaper-order
export async function readFileAsync(filePath, err_message): Promise<string | never> {
  try {
    const readFile = promisify(fs.readFile);
    return await readFile(filePath, 'utf8')
      .then((value: string) => {
        return value;
      })
      .catch(() => {
        return Promise.reject(err_message);
      });
  } catch {
    return Promise.reject(err_message);
  }
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

export async function executeScriptBlock(scriptblock: string, err_message: string): Promise<string> {
  const command = scriptblock.replace(/[\{\}]/g, '');
  const execute = promisify(child.exec);
  return await execute(command)
    .then((value) => {
      if (value.stderr) {
        console.error(err_message + scriptblock);
        process.exit(1003);
      } else {
        return value.stdout.replace(/[\"\']/g, '').trimRight();
      }
    })
    .catch(() => {
      console.error(err_message + scriptblock);
      process.exit(1003);
      return '1003'; // superfluous, but linter wants it.
    });
}

export async function removeFile(filePath: string, err_message: string): Promise<boolean> {
  const remove = promisify(fs.unlink);
  // tslint:disable-next-line:no-bitwise
  err_message;
  /* TODO: disabling this for now; something with Promise<void> and thenable from caller
  if (!checkUsersPermissions(filePath, fs.constants.W_OK | fs.constants.R_OK)) {
      console.error(err_message + filePath);
      process.exit(1004);
      return;
    }
  */
  return await remove(filePath)
    .then(() => {
      return true;
    })
    .catch(() => {
      console.error('Although permissions to remove file is correct, failure occurred.' +
        ' Is there another process accessing this file?: ' + filePath);
      process.exit(1004);
      return false;
    });
}

/**
 * Checks the destination for exisitence, if not existent it will create a copy from source.
 */
export async function checkAndCreateACopy(source, destination): Promise<boolean> {
  const copy = promisify(fs.copyFile);
  return await doesFileExistAsync(destination)
    .then(async (value: boolean) => {
      if (!value) {
        await fse.ensureDir(path.dirname(destination));
        await copy(source, destination);
        return true;
      } else {
        return false;
      }
    });
}

export function createSymlink(filePath, linkPath): Promise<void> {
  fs.symlinkSync(path.resolve(filePath), path.resolve(linkPath), 'file');
  return Promise.resolve();
  /*   const slink = promisify(fs.symlink);
    console.log(path.resolve(filePath) + ' --> ' + linkPath);
    return slink(filePath, linkPath)
      .then(() => {
        console.log('linking it');
        return Promise.resolve();
      }, (reason) => {
        console.error('Cant link it');
        process.exit(1007);
        return;
      })
      .catch(() => {
        console.error('Cant link it');
        process.exit(1007);
        return;
      }); */
}

// https://stackoverflow.com/a/46974091/648789
export async function replaceTokenInFile(file, tokenExpression, replacement): Promise<void> {
  const tmpfile = `${file}.tmp`;
  try {
    const contents = await readFileAsync2(file, 'utf8');
    const replaced_contents = contents.replace(tokenExpression, replacement);
    await writeFileAsync(tmpfile, replaced_contents, 'utf8');
    await renameFileAsync(tmpfile, file);
  } catch (error) {
    console.log('ERROR Calling utils.replaceTokenInFile(' + file + ',' + tokenExpression + ',' + replacement + ')');
    console.log(error);
  }
}

export function getFullname(filePath): string {
  return path.basename(filePath);
}
/*
function checkUsersPermissions(filePath, mode): boolean {
  try {
    fs.accessSync(filePath, mode);
    return true;
  } catch (err) {
    return false;
  }
}
*/

/**
 * Changes mode for file to '555'. This function is only for applicable for POSIX.
 *
 * @param filePath The file to change mode to.
 */
export async function makeFileExecutable(filePath): Promise<void> {
  const changeMode = promisify(fs.chmod);
  // octal '555' is expressed as: -r-xr-xr-x
  return changeMode(filePath, '555')
    .then(() => {
      return Promise.resolve();
    }, () => {
      console.error('Unable to make the following file executable for POSIX environments: ' + filePath);
      process.exit(1006);
      return;
    })
    .catch(() => {
      console.error('Unable to make the following file executable for POSIX environments: ' + filePath);
      process.exit(1006);
      return;
    });
}

/*
* Resolve commandDirectoryPath if its in a scriptblock.
*/
export async function checkAndResolveScriptBlock(value): Promise<string> {
  if (value && value.search(/(?<={).*(?=})/) > 0) {
    const scriptBlock = value.match(/(?<={).*(?=})/)[0];
    value = await executeScriptBlock(scriptBlock, 'Unable to execute the following scriptblock: ')
      .then((value) => {
        return value.replace(/[{].*[}]/, value);
      });
  }
  return Promise.resolve(value);
}

export async function readJSONProperty<T>(filepath: string, property?: string): Promise<T> {
  const filename = path.basename(filepath, '.json');
  try {
    await doesFileExistAsync(filepath, 'Unable to load ' + filename);

    const configRaw: string = await readFileAsync(filepath, 'Unable to read ' + filename);

    if (property) {
      return JSON.parse(configRaw)[property];
    } else {
      return JSON.parse(configRaw);
    }
  } catch (error) {
    if (property) {
      throw new Error(`Unable to parse ${property} property ${filename} into a JSON object.`);
    } else {
      throw new Error(`Unable to parse ${filename} into a JSON object.`);
    }
  }
}

export async function asyncForEach<T>(value: Array<T>, callback) {
  for (let index = 0; index < value.length; index++) {
    await callback(value[index], index, value) as T;
  }
}
