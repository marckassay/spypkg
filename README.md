# altpackage (currently being developed)

altpackage (alternative package) is a Node.js module to "intercept" command-line expressions that have been executed and with these expression an adaptor can modify them and re-execute. Why would this be needed you may ask? For instance, and the reason this module has been created, is when a dependency of your project executes the ubiquitous `npm` instead of your node package manager of choice, such as `yarn`, it puts a developer at risk of a hastily solution. As of this version, there is only one built-in adaptor, [npm-adaptor.ts](https://github.com/marckassay/altpackage/blob/master/lib/adaptor/built-in/npm-adaptor.ts). This adaptor's purpose is to intercept `npm` expressions and convert them to yarn expressions for a dependency of your project. A dependecny for your project may just execute a few npm commands, predominantly the `install` command, with various options.

An addition to the orginial objective of this module mentioned above, it can also be used to have local packages installed in your project's `node_modules` folder and be executed as if they were installed in a global directory. To intercept an expression, a batch file for POSIX systems or bat file for Windows systems is needed to be placed in one of the system's environoment path directory. With this file in place it will read current working directory (CWD) of the shell process and re-direct the executed expression to the adaptor file. So this means that the version of a module is depended on the one relative the CWD. In otherwords mulitple versions can coexist on a developer's system and will not conflict with eachother since the specific version is determined by the CWD of the shell!

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/marckassay/altpackage/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/altpackage.svg?style=flat)](https://www.npmjs.com/package/altpackage)

## Install

### npm

```shell
npm install altpackage
```

### yarn

```shell
yarn add altpackage
```

link: [yarnpkg.com/en/package/altpackage](https://yarnpkg.com/en/package/altpackage)

## Usage

### 'yarn in lieu of npm' example

After installing `altpackage` add the following to your project's `package.json` scripts property:

```json
  "scripts": {
    "add-altpackages": "node ./node_modules/altpackage/dist/index.js",
    "remove-altpackages": "node ./node_modules/altpackage/dist/index.js -remove"
  }
```

Now add an `altpackage` property to the `package.json`:

```json
  "altpackage": {
    "projectOutPath": "out/",
    "packages": [
      {
        "name": "npm",
        "location": "C:\\Program Files\\nodejs",
        "adaptor": "*"
      }
    ]
  }
```

When `add-altpackages` command is executed, `altpackge` will:

* Check to see if the `projectOutPath` exists, if not it will create it. This is where the `adaptor` file will reside.

* Iterate all objects in the `packages` property. The `name` property is the executable and the `location` is where `altpackage` will deploy the batch and CMD files. It must be a path to a directory and belongs to your operating system's environment path. The `adaptor` for this example specifies to use `altpackage`'s built-in adaptor (via "*") for `npm`; `npm-adaptor.js`. This will be deployed in the `projectOutPath` directory.

If all went as intended, when `npm` is executed wheather from your shell or IDE, commands should be intercepted and modified into a `yarn` expression.

When `remove-altpackages` command is executed, `altpackge` will remove only the files that it deployed to the `location` directories.

### 'local as global' example

This example is very similar to the 'yarn in lieu of npm' example. The only difference is that the `adaptor` property is absent from example above. When no value is given for `adaptor` a generaic file is deployed to the `projectOutPath` that will redirect the execution to the project's node_module folder. So that means, that the dependency will need to be installed in your node_modules folder.

## altpack-harness

A test harness for `altpackage` in the form of smoke testing. See it's [README.md](https://github.com/marckassay/altpackage/blob/master/harness/README.md) for more.
