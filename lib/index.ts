#!/usr/bin/env node
/**
 * Loads the package.json in the current working directory to parse the spypkg property. Regardless
 * of what form this property is in, it must have at least one spy declared in the spies array and
 * one location with a value to a directory. That directory will be the location the spy is deployed
 * to. If projectOutPath is declared it will redirect execution to that directory, otherwise spypkg
 * will redirect to its dist folder.
 *
 * This is developed to work on POSIX and Windows.
 */
import * as util from './utils';
import { join } from 'path';

// src is optional since removeSpy is only considered about removing the dest file.
interface SpyDeploymentShape {
  src?: string,
  dest: string
}

interface Spy {
  name: string,
  location?: string,
  adaptor?: string
}

interface SpypkgConfig {
  location?: string,
  projectOutPath?: string;
  spies: Array<Spy | string>;
}

// switches..
let verboseSwitch: boolean = false;
let removeSwitch: boolean = false;
let forceSwitch: boolean = false;
let nohashresetSwitch: boolean = false;

const JSONFileName = 'package.json';
const JSONFilePath: string = join(process.cwd(), JSONFileName);
const JSONProperty = 'spypkg';
const builtInAdaptorSymbol = ':*';

const bashDependencyFileName = 'dependency';
const cmdDependencyFileName = 'dependency.cmd';
const adaptorFileName = 'adaptor.js';

const isWin = process.platform === "win32";

/**
 * The location to the `out` folder. This is intended to reside as a sub-directory of project. This
 * is optional, but required if a custom adaptor file is declared in JSON config property.
 */
let projectOutPath: string;

/**
 * The value of where the spies will be deployed to. This is required unless declared for individual
 * spy.
 */
let location: string;

const distBashDependencyFilePath: string = join(__dirname, bashDependencyFileName);
function outBashDependencyFilePath(): string {
  if (!projectOutPath) {
    return distBashDependencyFilePath;
  } else {
    return join(projectOutPath, bashDependencyFileName);
  }
}

const distCmdDependencyFilePath: string = join(__dirname, cmdDependencyFileName);
function outCmdDependencyFilePath(): string {
  if (!projectOutPath) {
    return distCmdDependencyFilePath;
  } else {
    return join(projectOutPath, cmdDependencyFileName);
  }
}

const distAdaptorFilePath: string = join(__dirname, 'adaptor', adaptorFileName);
function outAdaptorFilePath(name: string = adaptorFileName): string {
  return join(projectOutPath, name);
}

/**
 * This will return an extensionless path to the command destination which is valid for the bash file.
 * To have a valid batch file, simply join the value of '.cmd'.
 *
 * @param name the command name, ie, 'cordova', 'npm'.
 * @param commandDirectoryPath the command destination location value
 * @returns an extensionless path to the command destination.
 */
async function resolveScriptLocationPath(name: string, commandDirectoryPath?: string) {
  let resolvedCommandDirectoryPath;
  if (commandDirectoryPath) {
    resolvedCommandDirectoryPath = await util.checkAndResolveScriptBlock(commandDirectoryPath);
  }

  if (!resolvedCommandDirectoryPath && location) {
    resolvedCommandDirectoryPath = location;
  } else if (!resolvedCommandDirectoryPath && !location) {
    throw new Error("[spypkg] Missing 'location' property for 'spypkg' object. See documentation: https://github.com/marckassay/spypkg");
  }

  return join(resolvedCommandDirectoryPath, name.replace(':*', ''));
}

const resolveAdaptorFilePath = (name: string, adaptor: string | undefined) => {
  let results;
  if (name.endsWith(builtInAdaptorSymbol)) {
    name = name.split(builtInAdaptorSymbol)[0];
    results = join(__dirname, 'adaptor', name + '-adaptor.js');
  } else if (adaptor === undefined) {
    results = distAdaptorFilePath;
  } else {
    results = join(process.cwd(), adaptor);
  }
  return results;
}

async function init() {
  // setting command-line switches
  for (let j = 0; j < process.argv.length; j++) {
    if (process.argv[j] === '--verbose') {
      verboseSwitch = true;
    } else if (process.argv[j] === '--remove') {
      removeSwitch = true;
    } else if (process.argv[j] === '--force') {
      forceSwitch = true;
    } else if (process.argv[j] === '--no-hash-reset') {
      nohashresetSwitch = true;
    }
  }

  let config: SpypkgConfig = await util.readJSONProperty<SpypkgConfig>(JSONFilePath, JSONProperty);

  projectOutPath = config.projectOutPath;

  location = config.location;

  if (removeSwitch === false) {
    if (forceSwitch) {
      await removeSpies(config)
    }
    await addSpies(config);
  } else {
    await removeSpies(config);
  }

  if (!isWin && !nohashresetSwitch) {
    await util.executeScriptBlock('{hash -r}', 'Unable to reset hash. Spies may not be called until hash is reset.');
  }
}

async function addSpies(config: SpypkgConfig) {
  await util.asyncForEach<Spy | string>((config.spies), async (spy: Spy | string) => {
    if (typeof spy === 'object') {
      await addSpy(spy.name, spy.location, spy.adaptor);
    } else {
      await addSpy(spy);
    }
  });
}

async function removeSpies(config: SpypkgConfig) {
  await util.asyncForEach<Spy | string>((config.spies), async (spy: Spy | string) => {
    if (typeof spy === 'object') {
      await removeSpy(spy.name, spy.location);
    } else {
      await removeSpy(spy);
    }
  });
}

/**
* Creates a dependency from the data parsed in packages property of package.json.
*
* @param {string} name the command name that is to be used in shell.
* @param {string} commandDirectoryPath the directory of where the files will reside. this is the value
of the `location` property of the JSON object. This value must be listed in your operating system's
environment variable.
* @param {string} adaptor the JS file where the command resolves to. Defaults to `adaptor.js`.
*/
async function addSpy(name: string, commandDirectoryPath?: string, adaptor?: string) {
  const resolvedScriptLocationFilePath: string = await resolveScriptLocationPath(name, commandDirectoryPath);

  // adaptor may be undefined, specifiying to use built-in one or defined.
  let resolvedAdaptorFilePath: string = resolveAdaptorFilePath(name, adaptor);

  // copy files out of spypkg's dist folder and into the client's "out" folder if 'projectOutPath' is defined
  if (projectOutPath) {
    await util.checkAndCreateACopy(distBashDependencyFilePath, outBashDependencyFilePath());
    await util.checkAndCreateACopy(distCmdDependencyFilePath, outCmdDependencyFilePath());
    await util.checkAndCreateACopy(resolvedAdaptorFilePath, outAdaptorFilePath(util.getFullname(resolvedAdaptorFilePath)));
  }

  if (!isWin) {
    await util.makeFileExecutable(outBashDependencyFilePath());
  }

  const arr: SpyDeploymentShape[] = [
    { src: outBashDependencyFilePath(), dest: resolvedScriptLocationFilePath },
    { src: outCmdDependencyFilePath(), dest: resolvedScriptLocationFilePath + '.cmd' }
  ];

  await util.asyncForEach<SpyDeploymentShape>(arr, async (spy: SpyDeploymentShape) => {
    await util.checkAndCreateACopy(spy.src, spy.dest)
      .then((value) => {
        if (verboseSwitch && value) {
          console.log(`[spypkg] Added: ${spy.dest}`);
        }
        return;
      });
    return;
  });

  return Promise.resolve();
}

async function removeSpy(name: string, commandDirectoryPath?: string) {
  const resolvedScriptLocationFilePath: string = await resolveScriptLocationPath(name, commandDirectoryPath);

  await util.asyncForEach<SpyDeploymentShape>([{ dest: resolvedScriptLocationFilePath }, { dest: resolvedScriptLocationFilePath + '.cmd' }], async (spy: SpyDeploymentShape) => {

    let continu: boolean = await util.doesFileExistAsync(spy.dest)
      .then((value: boolean) => {
        if (!value && verboseSwitch) {
          console.log(`[spypkg] File does not exist: ${spy.dest}`);
        }
        return value;
      });

    let fileContent: string = '';
    if (continu) {
      fileContent = await util.readFileAsync(spy.dest, 'Unable to determine if file is from spypkg. Remove or backup the following file: ' + spy.dest);
      continu = (fileContent.length > 0);
    }

    if (continu) {
      const foundSpypkgMsg: boolean = fileContent.search(/(SPYPKG HAS GENERATED THIS FILE!)/) !== -1;
      if (!foundSpypkgMsg) {
        console.log(`[spypkg] This file seems to have not been generated by spypkg. Remove or backup this file: ${spy.dest}`);
        continu = false;
      } else {
        continu = await util.removeFile(spy.dest, 'Unable to remove file. Do you have permissions to access this file?: ');
      }
    }

    if (continu && verboseSwitch) {
      console.log(`[spypkg] Removed: ${spy.dest}`);
    }

    return;
  });

  return Promise.resolve();
}

init();
