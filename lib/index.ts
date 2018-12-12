#!/usr/bin/env node

import * as util from './utils';
import { join } from 'path';

interface AltPackageConfig {
  projectOutPath: string;
  packages: [{
    name: string,
    location: string,
    adaptor?: string
  }];
}

const configFilename = 'package.json';
const rootProperty = 'altpackage';
const builtInSymbol = '*/';

const bashDependencyFileName = 'dependency';
const cmdDependencyFileName = 'dependency.cmd';
const adaptorFileName = 'adaptor.js';

const configFilePath: string = join(process.cwd(), configFilename);

/**
 * The location to the `out` folder. This is intended to reside in the project root directory.
 */
let outDirPath: string;

const libBashDependency: string = join(__dirname, bashDependencyFileName);
function outBashDependency(name: string = bashDependencyFileName): string {
  return join(outDirPath, name);
}

const libCmdDependency: string = join(__dirname, cmdDependencyFileName);
function outCmdDependency(name: string = cmdDependencyFileName): string {
  return join(outDirPath, name);
}

const libAdaptor: string = join(__dirname, 'adaptor', adaptorFileName);
function outAdaptor(name: string = adaptorFileName): string {
  return join(outDirPath, name);
}

async function loadConfiguration() {
  try {
    await util.doesFileExistAsync(configFilePath, 'Unable to load ' + configFilename);

    const configRaw: string = await util.readFileAsync(configFilePath, 'Unable to read ' + configFilename);

    return JSON.parse(configRaw)[rootProperty];
  } catch (error) {
    throw new Error(`Unable to parse ${rootProperty} property ${configFilename} into a JSON object.`);
  }
}

/**
 * Reads the `package.json` by iterating the packages section of the file to create batch and cmd
 * files. These files are intended to reside in a location listed in the env's PATH so that
 * the CLI, IDE, node and/or any executable will find it "globally". If executed outside of project's
 * directory since this is developed to work only relative to project.
 *
 * This is developed to work on POSIX and Windows.
 */
async function addAltpackages() {
  let config: AltPackageConfig = await loadConfiguration();
  outDirPath = config.projectOutPath;

  for (const dependency of config.packages) {
    await removeCommmandDependency(dependency.name, dependency.location);
    await addCommandDependency(dependency.name, dependency.location, dependency.adaptor);
  }
}

async function removeAltpackages() {
  let config: AltPackageConfig = await loadConfiguration();
  outDirPath = config.projectOutPath;

  for (const dependency of config.packages) {
    await removeCommmandDependency(dependency.name, dependency.location);
  }
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
async function addCommandDependency(name: string, commandDirectoryPath: string, adaptor?: string) {
  // resolve commandDirectoryPath if its in a scriptblock.
  if (commandDirectoryPath.startsWith('{') || commandDirectoryPath.endsWith('}')) {
    commandDirectoryPath = await util.executeScriptBlock(commandDirectoryPath, 'Unable to execute the following scriptblock: ');
  }
  const commandPath: string = join(commandDirectoryPath, name);

  let adaptorSrc: string;
  if (adaptor === undefined) {
    adaptorSrc = libAdaptor;
  } else if (adaptor.startsWith(builtInSymbol)) {
    adaptorSrc = join(__dirname, 'adaptor', 'built-in', name + '-adaptor.js');
  } else {
    adaptorSrc = join(process.cwd(), adaptor);
  }

  // copy files out of altpackage dist folder and into the client's "out" folder
  await util.checkAndCreateACopy(libBashDependency, outBashDependency());
  await util.checkAndCreateACopy(libCmdDependency, outCmdDependency());
  await util.checkAndCreateACopy(adaptorSrc, outAdaptor(util.getFullname(adaptorSrc)));

  await util.makeFileExecutable(outBashDependency());

  await util.checkAndCreateACopy(outBashDependency(), commandPath)
    .then((value) => {
      if (verboseEnabled) {
        if (value) {
          console.log(`[altpackage] Adding: ${commandPath}`);
        }
      }
    });

  await util.checkAndCreateACopy(outCmdDependency(), commandPath + '.cmd')
    .then((value) => {
      if (verboseEnabled) {
        if (value) {
          console.log(`[altpackage] Adding: ${commandPath}.cwd`);
        }
      }
    });
}

async function removeCommmandDependency(name: string, commandDirectoryPath: string) {
  // resolve commandDirectoryPath if its in a scriptblock.
  if (commandDirectoryPath.startsWith('{') || commandDirectoryPath.endsWith('}')) {
    commandDirectoryPath = await util.executeScriptBlock(commandDirectoryPath, 'Unable to execute the following scriptblock: ');
  }

  const commandPath: string = join(commandDirectoryPath, name);

  await util.doesFileExistAsync(commandPath)
    .then((value: boolean) => {
      if (value === true) {
        util.removeFile(commandPath, 'Unable to remove the file. Do you have permissions to access this file?: ')
          .then(() => {
            if (verboseEnabled) {
              console.log(`[altpackage] Removed: ${commandPath}`);
            }
          })
      } else {
        if (verboseEnabled) {
          console.log(`[altpackage] File does not exist: ${commandPath}`);
        }
      }
    });

  await util.doesFileExistAsync(commandPath + '.cmd')
    .then((value: boolean) => {
      if (value === true) {
        util.removeFile(commandPath + '.cmd', 'Unable to remove the file. Do you have permissions to access this file?: ')
          .then(() => {
            if (verboseEnabled) {
              console.log(`[altpackage] Removed: ${commandPath}.cmd`);
            }
          })
      } else {
        if (verboseEnabled) {
          console.log(`[altpackage] File does not exist: ${commandPath}.cmd`);
        }
      }
    });
  return Promise.resolve();
}

let verboseEnabled: boolean = false;
let removePackages: boolean = false;

// prepare argv values into argument, so that regex can parse as expected
for (let j = 0; j < process.argv.length; j++) {
  if (process.argv[j] === '--verbose') {
    verboseEnabled = true;
  } else if (process.argv[j] === '--remove') {
    removePackages = true;
  }
}

if (removePackages === false) {
  addAltpackages();
} else {
  removeAltpackages();
}
