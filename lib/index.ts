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

const genericBashDependencyFileName = 'dependency';
const genericCmdDependencyFileName = 'dependency.cmd';
const customBashDependencyFileName = 'x-dependency';
const customCmdDependencyFileName = 'x-dependency.cmd';
const genericAdaptorFileName = 'adaptor.js';

/**
 * The location to the `out` folder. This is intended to reside in the project root directory.
 */
let outDirPath: string;

const libGenericBashDependency: string = join(__dirname, genericBashDependencyFileName);
function outBashDependency(name: string = genericBashDependencyFileName): string {
  return join(outDirPath, name);
}

const libGenericCmdDependency: string = join(__dirname, genericCmdDependencyFileName);
function outCmdDependency(name: string = genericCmdDependencyFileName): string {
  return join(outDirPath, name);
}

const libGenericAdaptor: string = join(__dirname, 'adaptor', genericAdaptorFileName);
function outAdaptor(name: string = genericAdaptorFileName): string {
  return join(outDirPath, name);
}

const configFilename = 'package.json';
const rootProperty = 'altpackage';
const configFilePath: string = join(process.cwd(), configFilename);

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
  let bashDependencyValue: string;
  let cmdDependencyValue: string;
  let adaptorValue: string;

  // resolve commandDirectoryPath if its in a scriptblock.
  if (commandDirectoryPath.startsWith('{') || commandDirectoryPath.endsWith('}')) {
    commandDirectoryPath = await util.executeScriptBlock(commandDirectoryPath, 'Unable to execute the following scriptblock: ');
  }

  const commandPath: string = join(commandDirectoryPath, name);

  if (!adaptor) {
    await util.checkAndCreateACopy(libGenericBashDependency, outBashDependency(), true);
    await util.checkAndCreateACopy(libGenericCmdDependency, outCmdDependency());
    await util.checkAndCreateACopy(libGenericAdaptor, outAdaptor());

    bashDependencyValue = outBashDependency();
    cmdDependencyValue = outCmdDependency();
  } else {
    if (adaptor === "{built-in}") {
      adaptor = join(__dirname, 'adaptor', 'built-in', name + '-adaptor.js');
    }

    bashDependencyValue = outBashDependency(name + '-dependency');
    cmdDependencyValue = outCmdDependency(name + '-dependency.cmd');
    adaptorValue = outAdaptor(util.getFullname(adaptor));
    const adaptorName = util.getFullname(adaptor);

    const libCustomBashDependency: string = join(__dirname, customBashDependencyFileName);
    const libCustomCmdDependency: string = join(__dirname, customCmdDependencyFileName);

    // if custom adaptor is defined; then a custom set of files are needed.
    await util.checkAndCreateACopy(libCustomBashDependency, bashDependencyValue, true);
    await util.checkAndCreateACopy(libCustomCmdDependency, cmdDependencyValue);
    await util.checkAndCreateACopy(adaptor, adaptorValue);

    // replace tokens inside the bash and batch files.
    // await util.replaceTokenInFile(bashDependencyValue, '{Outpath}', outDirPath);
    await util.replaceTokenInFile(cmdDependencyValue, '{Outpath}', outDirPath);
    // await util.replaceTokenInFile(bashDependencyValue, '{AdaptorPath}', adaptorName);
    await util.replaceTokenInFile(cmdDependencyValue, '{AdaptorPath}', adaptorName);
  }

  if (verboseEnabled) {
    console.log(`[altpackage] Adding '${name}' in: ${commandPath}`);
    console.log(`[altpackage] Adding '${name}' in: ${commandPath}.cmd`);
  }
  await util.createSymlink(bashDependencyValue, commandPath);
  await util.createSymlink(cmdDependencyValue, commandPath + '.cmd');
}

async function removeCommmandDependency(name: string, commandDirectoryPath: string) {
  // resolve commandDirectoryPath if its in a scriptblock.
  if (commandDirectoryPath.startsWith('{') || commandDirectoryPath.endsWith('}')) {
    commandDirectoryPath = await util.executeScriptBlock(commandDirectoryPath, 'Unable to execute the following scriptblock: ');
  }

  const commandPath: string = join(commandDirectoryPath, name);

  if (verboseEnabled) {
    console.log(`[altpackage] Removing '${name}' in: ${commandPath}`);
    console.log(`[altpackage] Removing '${name}' in: ${commandPath}.cmd`);
  }

  await util.doesFileExistAsync(commandPath)
    .then((value: boolean) => {
      if (value === true) {
        util.removeSymlinks(commandPath, 'Unable to remove the file. Do you have permissions to access this file?: ');
      }
    });

  await util.doesFileExistAsync(commandPath + '.cmd')
    .then((value: boolean) => {
      if (value === true) {
        util.removeSymlinks(commandPath + '.cmd', 'Unable to remove the file. Do you have permissions to access this file?: ');
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
