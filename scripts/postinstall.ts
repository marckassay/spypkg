import * as path from "path";
import { readJson, writeJson, pathExists } from "fs-extra";

const executingModuleName = 'spypkg';

async function init() {
  const scriptEntries = [
    { 'add-spies': "node ./node_modules/spypkg --verbose" },
    { 'remove-spies': "node ./node_modules/spypkg --remove --verbose" }
  ];

  await insertScriptEntries(scriptEntries);

  const spyProperty = {
    spypkg: {
      spies: [
        "Enter the name of the command. If 'yarn in lieu of npm' spy needed, use: npm:*"
      ],
      location: "Location of where spy binaries will reside. Example: '/home/marc/.spies'"
    }
  };

  await insertSpypkgProperty(spyProperty);
}
init();

// TODO: perhaps can be optimize with Object.defineProperty() or other Object methods. To many
// possibilities to consider for this to be implemented at this time.
/**
 * Inserts `value` into the `scripts` object of the host app's package.json file. If there isn't a
 * `scripts` object, one will be created.
 *
 * @param value single entry or entries to be added to `scripts` object
 */
async function insertScriptEntries(value: object | Array<object>) {

  if (Array.isArray(value) === false) {
    value = [value];
  }

  const JSONFilePath: string = path.resolve('../../package.json');

  await pathExists(JSONFilePath)
    .then(async (val) => {
      if (val) {
        let config: any;
        let names = [];
        try {
          config = await readJson(JSONFilePath);

          if (!config.scripts) {
            const entry = (value as Array<object>).shift();
            names.push(Object.getOwnPropertyNames(entry)[0]);
            Object.assign(config, { scripts: entry });
          }

          (value as Array<object>).forEach((entry) => {
            const name = Object.getOwnPropertyNames(entry)[0];
            const doesObjectExist = typeof (config.scripts[name]) === 'string';
            if (doesObjectExist === false) {
              names.push(name);
              Object.assign(config.scripts, entry);
            }
          });

        } catch (err) {
          console.error(err);
          console.log(`[${executingModuleName}]`, 'Failed to update:', JSONFilePath);
        }

        try {
          const result = await writeJson(JSONFilePath, config, { spaces: 2 });

          names.forEach((entry) => {
            console.log(`[${executingModuleName}]`, `Added '${entry}' command to:`, JSONFilePath);
          });

          return result;
        } catch (err) {
          console.log(`[${executingModuleName}]`, 'Failed to update:', JSONFilePath);
          console.error(err);
        }
      } else {
        return;
      }
    });
}

async function insertSpypkgProperty(value: { spypkg: {} }) {

  const JSONFilePath: string = path.resolve('../../package.json');

  await pathExists(JSONFilePath)
    .then(async (val) => {
      if (val) {
        let config: any;
        const entry = 'spypkg';
        let isSpypkg: boolean;

        try {
          config = await readJson(JSONFilePath);
          isSpypkg = typeof (config.spypkg) === 'object';

          if (isSpypkg === false) {
            Object.assign(config, { spypkg: value.spypkg });
          }

        } catch (err) {
          console.error(err);
          console.log(`[${executingModuleName}]`, 'Failed to update:', JSONFilePath);
        }

        try {
          if (isSpypkg === false) {

            const result = await writeJson(JSONFilePath, config, { spaces: 2 });

            console.log(`[${executingModuleName}]`, `Added '${entry}' property to:`, JSONFilePath);

            return result;
          } else {
            return;
          }
        } catch (err) {
          console.log(`[${executingModuleName}]`, 'Failed to update:', JSONFilePath);
          console.error(err);
        }
      } else {
        return;
      }
    });
}
