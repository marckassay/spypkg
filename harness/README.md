# altpack-harness

This folder (harness) of `altpackage` is to deploy the module's test harness in the same directory as where it resides. This is ideal for local development of `altpackage`.

To deploy this harness as intended, clone the [repository](https://github.com/marckassay/altpackage.git) and using a CLI execute the following command in the root directory using a node package manager:

```shell
[npm|yarn|pnpm] run install-harness
```

This will install the test harness in the same directory as where `altpackage` resides. Now this test harness acts like any other module that installed `altpackage`. So change the CLI directory to the `altpack-harness` directory and executed the following if you want to use the current configuration:

```shell
[npm|yarn|pnpm] run add-altpackages
```

The current configuration is in it's `package.json` file. Below shows relevant information for this this file:

```json
{
  ...
  "private": true,
  "scripts": {
    "add-altpackages": "node ./node_modules/altpackage/dist/index.js",
    "remove-altpackages": "node ./node_modules/altpackage/dist/index.js -remove"
  },
  "altpackage": {
    "projectOutPath": ".\\out\\",
    "packages": [
      {
        "name": "ionic",
        "location": "{yarn global bin}"
      },
      {
        "name": "cordova",
        "location": "{yarn global bin}"
      },
      {
        "name": "npm",
        "location": "C:\\Program Files\\nodejs",
        "adaptor": "{built-in}"
      }
    ]
  }
}
```
