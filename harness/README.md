# spypkg-harness

This folder (harness) of `spypkg` is to deploy the module's test harness in the same directory as where it resides. This is ideal for local development of `spypkg`.

To deploy this harness as intended, clone the [repository](https://github.com/marckassay/spypkg.git) and using a CLI execute the following command in the root directory using a node package manager:

```shell
[npm|yarn|pnpm] run install-harness
```

This will install the test harness in the same directory as where `spypkg` resides. This test harness acts like any other host project that installed `spypkg`. So change the CLI directory to the `spypkg-harness` directory and executed the following if you want to use the current configuration:

```shell
[npm|yarn|pnpm] run add-spypkgs
```

The current configuration is in it's `package.json` file. Below shows relevant information for this this file:

```json
{
  ...
  "private": true,
  "scripts": {
    "add-spypkgs": "node ./node_modules/spypkg/dist/index.js",
    "remove-spypkgs": "node ./node_modules/spypkg/dist/index.js -remove"
  },
  "spypkg": {
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
