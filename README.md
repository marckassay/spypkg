# spypkg

spypkg (spy package) is a Node.js package to intercept command-line expressions that have been executed and with these expressions, an adaptor file can modify them to be executed in another form.

As of recent in my development, an issue mentioned [here](https://github.com/apache/cordova-cli/issues/303), [here](https://github.com/apache/cordova-fetch/issues/46) and [here](https://github.com/apache/cordova-cli/pull/292) surfaced when a dependency required `npm` instead of host project's package manager, `yarn`. And because of this issue, spypkg has been developed.

To address this 'npm in lieu of yarn' issue and to publish a solution for similar issues, the following objectives needed to be accomplished:
 - Intercept the execution of a shell expression, whether system is POSIX or Windows, and pass this expression to an adaptor file.
 - This adaptor file, compatible to both OS systems, would need to parse and map the npm expression to a yarn expression and then execute.

That adaptor file is, '[npm-adaptor.ts](https://github.com/marckassay/spypkg/blob/master/lib/adaptor/built-in/npm-adaptor.ts)'.

As a result from development for the original objective, spypkg can also be used to have local packages that are installed in the host project's 'node_modules' directory, be executed as if they were installed in a global directory (The actual dependency may be located anywhere for that matter. See 'Configuration' section below for further information). This may be ideal when concurrently developing projects that rely on different versions of a global-installed dependency.

This is accomplished in the same fashion as 'yarn in lieu of npm' objective. That is, a shell file is needed to be placed in one of the system's environment path directories. With this file in place it will read the current working directory (which is node's `process.cwd()`) of the shell process and redirect the executed expression to the relative adaptor file. In turn, the adaptor, if needed, will modify the expression and by default (using [adaptor.ts](https://github.com/marckassay/spypkg/blob/master/lib/adaptor/adaptor.ts)), will execute the dependency in the relative 'node_modules' directory. If a different action is needed, excluding [npm-adaptor.ts](https://github.com/marckassay/spypkg/blob/master/lib/adaptor/built-in/npm-adaptor.ts), one will need to be specified in the configuration.

## Caveats

- When assigning `location` value for a spy in the configuration (See "Setup" section below), verify that the location is indeed in the OS's environment `PATH`. And make sure it's in a position with-in `PATH` that no other sub-path intercepts the one intended. An alternative, is to add a new sub-path at the zero index of `PATH` that will be exclusive for spys.

- Unless a spy is deployed to be executed in one of the OS's environment paths, the dependency needs to be accessible whether directly or symbolically on the file system. If the project is not intended to be published to the package manager registry, these dependencies can be added/installed by a package manager so that it will be listed in the descriptor file and reside in 'node_modules' directory.

- And in an addition to having the dependency in the 'node_modules', initializing a new project with a spy is possible. For instance, cordova and ionic require when creating a new project that the destination directory doesn’t exist. So simply create a directory that will eventually be the actual project directory. Then execute cordova, for an example, to create a project in the sub-directory of the one that you just made. Now move all files and folders that were generated into the one you made and delete the sub-directory cordova created.

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

For this configuration, add the `spypkg` property to `package.json`, add the location folder (i.e. '.spies'):

```json
 {
  "spypkg": {
    "projectOutPath": "out",
    "spies": [
      {
        "name": "npm",
        "location": "C:\\Users\\marc\\AppData\\Roaming\\.spies",
        "adaptor": "*/npm-adaptor.js"
      }
    ]
  }
 }
```

Now add script commands as explained in the subsequent note:

* See "Configuration" section below for more about configuring.
* See also "Adding and Removing Spies" section below on how to execute.

### 'local-as-global' configuration example

This example is very similar to the 'yarn in lieu of npm' example. The only difference is that the `adaptor` property is absent. When no value is given for `adaptor` a generic adaptor is deployed to the `projectOutPath` which will redirect the execution to the host project's 'node_module' directory. So that means, that the dependency will need to be installed in your 'node_module' directory.

```json
{
 "spypkg": {
   "projectOutPath": "out",
   "spies": [
     {
       "name": "ionic",
       "location": "/home/marc/.spies"
     }
   ]
 }
}
```

Now add script commands as explained in the subsequent note:

* See "Configuration" section below for more about configuring.
* See also "Adding and Removing Spies" section below on how to execute.

## Setup

### Configuration

After spypkg is installed, a configuration property `spypkg` is required in the host's project `package.json` file. Its schema below with included descriptions for each property will hopefully address any uncertainties:
```json
{
 "$schema": "http://json-schema.org/draft-07/schema#",
 "properties": {
   "spypkg": {
     "description": "Configuration object for 'spypkg'. This object is to be in the package.json file of the host project.",
     "type": "object",
     "additionalProperties": false,
     "required": [
       "projectOutPath",
       "spies"
     ],
     "properties": {
       "projectOutPath": {
         "description": "A relative directory path where 'spypkg' will add adaptors and shell script files. This directory will be created if it doesn't exist when 'add-spies' is executed. See project's website for  'add-spies' command.",
         "type": "string"
       },
       "spies": {
         "description": "The spies to be deployed. 'spies' are defined to be commands that are to be intercepted.",
         "type": "array",
         "uniqueItems": true,
         "minItems": 1
       }
     },
     "definitions": {
       "spy": {
         "description": "The command to be intercepted with the location of where this spy will reside when deployed.",
         "type": "object",
         "additionalProperties": false,
         "required": [
           "name",
           "location"
         ],
         "properties": {
           "name": {
             "description": "The name of the command to intercept.",
             "type": "string",
             "examples": ["npm", "cordova", "ionic"]
           },
           "location": {
             "description": "The path of where spypkg will deploy the shell-script files. If the value is surrounded by curly-braces, then it will be evaluated by spypkg",
             "type": "string",
             "examples": [
               "C:\\Users\\marc\\AppData\\Roaming\\.spies",
               "/home/marc/.spies",
               "{yarn global dir}"
             ]
           },
           "adaptor": {
             "description": "The path to the adaptor file that is to be copied to the 'projectOutPath'. A value starting with '*/', specifies to spypkg to look in its 'built-in'(https://github.com/marckassay/spypkg/tree/master/lib/adaptor/built-in) subdirectory.",
             "type": "string",
             "examples": [
               "build/js/adaptor.js",
               "/dist/ionic-adaptor.js",
               "*/npm-adaptor.js"
             ],
             "default": [
               "adaptor.js"
             ]
           }
         }
       }
     }
   }
 }
}
```

* See also "Adding and Removing Spies" section below on how to execute.

### Adding and Removing Spies

After installing spypkg, add the following convenience commands to the host project's `package.json`:

```json
{
  "scripts": {
    "add-spies": "node ./node_modules/spypkg/dist/index.js --verbose",
    "remove-spies": "node ./node_modules/spypkg/dist/index.js --remove --verbose"
  }
}
```

For POSIX systems, it may be beneficial to clear shell's hash by executing ```hash -r``` after deploying and removal of spies.

#### `add-spies`

When `add-spies` command is executed, spypkg will load the configuration object from the host project's package.json file. If the `projectOutPath` directory doesn't exist it will be created. It will then iterate the spies array and deploy shell script files to the value specified in the `location` property. These files will be named with the required value of the `name` property. And if an `adaptor` property is given, it will copy it to the `projectOutPath`

#### `remove-spies`

When `remove-spies` command is executed, spypkg will load the configuration object and remove only the files that it deployed to the `location` directories.

* See "Configuration" section above for more about configuring.

## spypkg-harness

A test harness for spypkg in the form of smoke testing. See it's [README.md](https://github.com/marckassay/spypkg/blob/master/harness/README.md) for more.
