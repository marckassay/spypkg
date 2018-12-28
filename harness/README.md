# spypkg-harness

This folder (harness) of 'spypkg' is to deploy the module's test harness in the same directory as where it resides. This is ideal for local development of 'spypkg'.

To deploy this harness as intended, clone the [repository](https://github.com/marckassay/spypkg.git) and using a CLI execute the following commands in the root directory using a node package manager:

```shell
[npm|yarn|pnpm] run build:spypkg
[npm|yarn|pnpm] run build:harness
[npm|yarn|pnpm] run install:harness
```

This will install the test harness in the same directory as where 'spypkg' resides on the filesystem. This test harness is to quickly see how 'spypkg' will behave as a dependency. So change the CLI directory to the `spypkg-harness` directory and executed the following if you want to use the current configuration:

```shell
[npm|yarn|pnpm] run add-spies
```

The current configuration is in its [`package.json`](https://github.com/marckassay/spypkg/blob/master/harness/spypkg-harness/package.json) file. Below shows relevant information for this this file:

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
