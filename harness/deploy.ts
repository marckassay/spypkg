import * as path from 'path';
const fs = require('fs-extra')

const srcHarnessDirectory = ".\\harness\\altpack-harness\\"

export async function deploy() {
  await fs.copy(srcHarnessDirectory, '..\\altpack-harness\\')
    .then(() => console.log('Deployed test harness: ' + path.resolve('..\\altpack-harness\\')))
    .catch(err => console.error(err));

  try {
    await fs.ensureSymlink("..\\altpackage\\", "..\\altpack-harness\\node_modules\\altpackage\\")
    console.log('Deployed symlink for test harness: ' + path.resolve('..\\altpack-harness\\node_modules\\altpackage\\'));
  } catch (err) {
    console.error(err);
  }

}
deploy();
