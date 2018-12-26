#!/usr/bin/env node

import * as util from './utils';
import { join } from 'path';

interface DeployShape {
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
  spies: Array<Spy>;
}

const configFilename = 'package.json';
const rootProperty = 'spypkg';
const builtInSymbol = ':*';

const bashDependencyFileName = 'dependency';
const cmdDependencyFileName = 'dependency.cmd';
const adaptorFileName = 'adaptor.js';

const configFilePath: string = join(process.cwd(), configFilename);

/**
 * The location to the `out` folder. This is intended to reside in the project root directory.
 */
let outDirPath: string;

let location: string;

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

const assignLocation = (spyLocation) => {
  if (!spyLocation && location) {
    spyLocation = location;
  } else if (!spyLocation && !location) {
    throw new Error("[spypkg] Missing 'location' property for 'spypkg' object. See documentation: https://github.com/marckassay/spypkg");
  }
  return spyLocation;
}

async function asyncForEach<T>(value: Array<T>, callback) {
  for (let index = 0; index < value.length; index++) {
    await callback(value[index], index, value) as T;
  }
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
async function addSpies() {
  let config: SpypkgConfig = await loadConfiguration();

  outDirPath = config.projectOutPath;

  location = config.location;

  await removeSpies(config);

  asyncForEach<Spy>((config.spies), async (spy: Spy) => {
    await addSpy(spy.name, spy.location, spy.adaptor);
  });
}

async function removeSpies(config?: SpypkgConfig) {
  if (!config) {
    config = await loadConfiguration();
  }
  outDirPath = config.projectOutPath;

  location = config.location;

  await asyncForEach<Spy>((config.spies), async (spy: Spy) => {
    await removeSpy(spy.name, spy.location);
  });
}

/*
* Resolve commandDirectoryPath if its in a scriptblock.
*/
async function checkForScriptBlock(commandDirectoryPath): Promise<string | void> {
  if (commandDirectoryPath && commandDirectoryPath.search(/(?<={).*(?=})/) > 0) {
    const scriptBlock = commandDirectoryPath.match(/(?<={).*(?=})/)[0];
    await util.executeScriptBlock(scriptBlock, 'Unable to execute the following scriptblock: ')
      .then((value) => {
        commandDirectoryPath.replace(/[{].*[}]/, value);
      });

    return Promise.resolve(commandDirectoryPath);
  } else {
    return Promise.resolve();
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
async function addSpy(name: string, commandDirectoryPath: string, adaptor?: string) {
  const resolvedCommand = await checkForScriptBlock(commandDirectoryPath);
  const spyLocation = assignLocation(resolvedCommand);

  // adaptor may be undefined, specifiying to use built-in one or defined.
  let adaptorSrc: string;
  if (adaptor === undefined) {
    adaptorSrc = libAdaptor;
  } else if (name.endsWith(builtInSymbol)) {
    name = name.split(builtInSymbol)[0];
    adaptorSrc = join(__dirname, 'adaptor', 'built-in', name + '-adaptor.js');
  } else {
    adaptorSrc = join(process.cwd(), adaptor);
  }

  let arr: DeployShape[];
  const bashPath: string = join(spyLocation, name);
  const batchPath: string = join(spyLocation, name + '.cmd');

  // copy files out of spypkg's dist folder and into the client's "out" folder if defined
  if (outDirPath) {
    await util.checkAndCreateACopy(libBashDependency, outBashDependency());
    await util.checkAndCreateACopy(libCmdDependency, outCmdDependency());
    await util.checkAndCreateACopy(adaptorSrc, outAdaptor(util.getFullname(adaptorSrc)));

    await util.makeFileExecutable(outBashDependency());

    arr = [{ src: outBashDependency(), dest: bashPath }, { src: outCmdDependency(), dest: batchPath }];
  } else {
    arr = [{ src: libBashDependency, dest: bashPath }, { src: libCmdDependency, dest: batchPath }];
  }

  await asyncForEach<DeployShape>(arr, async (spy: DeployShape) => {
    await util.checkAndCreateACopy(spy.src, spy.dest)
      .then((value) => {
        if (verboseEnabled) {
          if (value) {
            console.log(`[spypkg] Added: ${spy.dest}`);
          }
        }
        return;
      });
    return;
  });

  return Promise.resolve();
}

async function removeSpy(name: string, commandDirectoryPath: string) {
  const resolvedCommand = await checkForScriptBlock(commandDirectoryPath);
  const spyLocation = assignLocation(resolvedCommand);

  const bashPath: string = join(spyLocation, name);
  const batchPath: string = join(spyLocation, name + '.cmd');

  await asyncForEach<DeployShape>([{ dest: bashPath }, { dest: batchPath }], async (spy: DeployShape) => {

    let continu: boolean = await util.doesFileExistAsync(spy.dest)
      .then((value: boolean) => {
        if (!value && verboseEnabled) {
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

    if (continu && verboseEnabled) {
      console.log(`[spypkg] Removed: ${spy.dest}`);
    }

    return;
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
  addSpies();
} else {
  removeSpies();
}
