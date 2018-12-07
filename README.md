# altpackage (currently being developed)

altpackage (alternative package) is a Node.js module to "intercept" command-line expressions that have been executed and with these expression an adaptor can modify them and re-execute. Why would this be needed you may ask? For instance, and the reason this module has been created, is when a dependency of your project executes the ubiquitous `npm` instead of your node package manager of choice, such as `yarn`, it puts a developer at risk of a hastily solution. As of this version, there is only one built-in adaptor, [npm-adaptor.ts](https://github.com/marckassay/altpackage/blob/master/lib/adaptor/built-in/npm-adaptor.ts). This adaptor's purpose is to intercept npm expressions and convert them to yarn expression *for a dependency* of your project. A dependecny for your project may just execute a few npm commands, predominantly the `install` command, with various options.

An addition to what is mentioned above, this module can also be used to have local packages installed in your project's `node_modules` folder and be executed as if they were installed in a global directory. To intercept an expression, a batch file for UNIX systems or bat file for Windows systems is needed to be placed in one of the system's environoment path directory. With this file in place it will read the shell's current directory and re-direct the executed expression to the adaptor file. So this means that the version of a module is depended on the one relative the shell's current directory. In otherwords mulitple versions can coexist on a developer's system and will not conflict with eachother since the specific version is determined by the current directory of the shell!

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

## altpack-harness

A test harness for `altpackage` in the form of smoke testing. See it's [README.md](https://github.com/marckassay/altpackage/blob/master/harness/README.md) for more.