import * as child from 'child_process';
import * as fs from 'fs';
import { promisify } from 'util';
import * as path from 'path';

const srcHarnessDirectory = ".\\harness\\altpack-harness\\"
const fse = require('fs-extra')

export function deploy() {
  fse.copy(srcHarnessDirectory, '..\\altpack-harness\\')
    .then(() => console.log('success!'))
    .catch(err => console.error(err));
}
deploy();
