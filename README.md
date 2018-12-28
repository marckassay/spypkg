# spypkg

spypkg (spy package) is a Node.js package to intercept command-line expressions that have been executed and with these expressions, an adaptor file can modify them to be executed in another form.

As of recent in my development, an issue mentioned [here](https://github.com/apache/cordova-cli/issues/303), [here](https://github.com/apache/cordova-fetch/issues/46) and [here](https://github.com/apache/cordova-cli/pull/292) surfaced when a dependency required `npm` instead of host project's package manager, `yarn`. And because of this issue, spypkg has been developed.

To address this 'npm in lieu of yarn' issue and to publish a solution for similar issues, the following objectives needed to be accomplished:
 - Intercept the execution of a shell expression, whether system is POSIX or Windows, and pass this expression to an adaptor file.
 - This adaptor file, compatible to both OS systems, would need to parse and map the npm expression to a yarn expression and then execute.

That adaptor file is, '[npm-adaptor.ts](https://github.com/marckassay/spypkg/blob/master/lib/adaptor/npm-adaptor.ts)'.

As a result from development for the original objective, spypkg can also be used to have local packages that are installed in the host project's 'node_modules' directory, be executed as if they were installed in a global directory (The actual dependency may be located anywhere for that matter. See 'Configuration' section below for further information). This may be ideal when concurrently developing projects that rely on different versions of a global-installed dependency.

This is accomplished in the same fashion as 'yarn in lieu of npm' objective. That is, a shell file is needed to be placed in one of the system's environment path directories. With this file in place it will read the current working directory of the shell process and redirect the executed expression to the relative adaptor file. In turn, the adaptor if needed, will modify the expression and by default (using [adaptor.ts](https://github.com/marckassay/spypkg/blob/master/lib/adaptor/adaptor.ts)), will execute the dependency in the relative 'node_modules' directory. If a different action is needed, excluding [npm-adaptor.ts](https://github.com/marckassay/spypkg/blob/master/lib/adaptor/npm-adaptor.ts), a custom adaptor will need to be specified in the configuration.

## Caveats

- When assigning `location` value in the configuration (See "Setup" section below), verify that the location is indeed in the OS's environment `PATH`. And make sure it's in a position with-in `PATH` that no other sub-path intercepts the one intended. An alternative, is to add a new sub-path at the zero index of `PATH` that will be exclusive for spies.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/marckassay/spypkg/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/spypkg.svg?style=flat)](https://www.npmjs.com/package/spypkg)

## Install

### npm

```shell
npm install spypkg --save-dev
```

### yarn

```shell
yarn add spypkg --dev
```

link: [yarnpkg.com/en/package/spypkg](https://yarnpkg.com/en/package/spypkg)

## Usage

### 'yarn in lieu of npm' configuration example

For this configuration, add the `spypkg` property to `package.json` and also add the location folder (e.g. '.spies'). Notice the `:*` is being used to specify to use spypkg's one-off '[npm-adaptor.ts](https://github.com/marckassay/spypkg/blob/master/lib/adaptor/npm-adaptor.ts)' exclusive to npm:

```json
{
  "spypkg": {
    "spies": [
      "npm:*"
    ],
    "location": "/home/marc/.spies"
  }
}
```

Now add script commands as explained in the subsequent note:

* See "Configuration" section below for more about configuring.
* See also "Adding and Removing Spies" section below on how to execute.

### 'local-as-global' configuration example

This example is very similar to the 'yarn in lieu of npm' example. The only difference is that the generic adaptor will redirect the execution to the host project's 'node_module/spypkg/dist' directory.

```json
{
  "spypkg": {
    "spies": [
      "cordova"
    ],
    "location": "/home/marc/.spies"
  }
}
```

 In this scenario, the dependency (cordova) needs to be accessible whether directly or symbolically on the file system. If the project is not intended to be published to the package manager registry, these dependencies can be added/installed by a package manager so that it will be listed in the descriptor file and reside in 'node_modules' directory.
 
 And in an addition to having the dependency in the 'node_modules', initializing a new project with a spy is possible. For instance, cordova and ionic require when creating a new project that the destination directory doesn’t exist. So simply create a directory that will eventually be the actual project directory. Afterwards, for an example, execute cordova to create a project in the sub-directory of the one that you just made. Now move all files and folders that were generated into the one you made and delete the sub-directory cordova created.

 If more control is needed, create a custom adaptor and assign it to the spy object. 
 
 Now add script commands as explained in the subsequent note:

* See "Configuration" section below for more about configuring.
* See also "Adding and Removing Spies" section below on how to execute.

## Setup

### Configuration

After spypkg is installed, a configuration property `spypkg` is required in the host project's `package.json` file. Below is a configuration progressing from its most simplest form to more complex forms:
   
```json
{
  "spypkg": {
    "spies": [
      "ionic"
    ],
    "location": "/home/marc/.spies"
  }
}
```
   
```json
{
  "spypkg": {
    "projectOutPath": "out",
    "spies": [
      "ionic"
    ],
    "location": "C:\\Users\\marc\\AppData\\Roaming\\.spies"
  }
}
```
   
```json
{
  "spypkg": {
    "projectOutPath": "out",
    "spies": [
      {
        "name": "ionic",
        "adaptor": "build/dist/ionic-adaptor.js"
      },
      {
        "name": "cordova",
        "location": "C:\\Program Files\\nodejs\\bin",
      },
    ],
    "location": "C:\\Users\\marc\\AppData\\Roaming\\.spies"
  }
}
```

```json
{
  "spypkg": {
    "projectOutPath": "out",
    "spies": [
      "npm:*"
      {
        "name": "ionic",
        "adaptor": "build/dist/ionic-adaptor.js",
        "location": "{yarn global dir}"
      },
      {
        "name": "cordova",
        "location": "C:\\Users\\marc\\AppData\\Roaming\\.spies\\v8",
      },
    ],
    "location": "C:\\Users\\marc\\AppData\\Roaming\\.spies"
  }
}
```

* See also "Adding and Removing Spies" section below on how to execute.

### Adding and Removing Spies

After installing spypkg, add the following convenience alias commands to the host project's `package.json`:

```json
{
  "scripts": {
    "add-spies": "node ./node_modules/spypkg/dist/index.js --verbose",
    "remove-spies": "node ./node_modules/spypkg/dist/index.js --remove --verbose"
  }
}
```

For POSIX systems, by default ```hash -r``` is executed post adding and removing. `--no-hash-reset` switch prevents resetting.

#### `add-spies [--verbose] [--force] [--no-hash-reset]`

When `add-spies` command is executed, spypkg will load the configuration object from the host project's package.json file.  It will then iterate the spies array and deploy shell script files to the value specified in the `location` property. If the `force` switch present, spypkg will remove all spies listed in the configuration object before deploying.

If the optional `projectOutPath` property is declared and directory doesn't exist, it will be created. Otherwise spypkg will redirect execution to its own dist directory. The intention of `projectOutPath` is to give developers more control of files if needed instead of modifying spypkg's dist directory. And if an `adaptor` property is given, it will copy it to the now required `projectOutPath` directory.

#### `remove-spies [--verbose] [--remove] [--no-hash-reset]`

When `remove-spies` command is executed, spypkg will load the configuration object and remove only the declared spies located in `location` directories.

* See "Configuration" section above for more about configuring.

## spypkg-harness

A test harness for spypkg in the form of smoke testing. See it's [README.md](https://github.com/marckassay/spypkg/blob/master/harness/README.md) for more.
