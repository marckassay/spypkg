const fs = require('fs-extra')
const path = require("path");

async function copy(srcpath, dstpath) {
  try {
    await fs.copy(srcpath, path.join(process.cwd(), dstpath));
    console.log('[spypkg] moved: ' + srcpath + ' --> ' + dstpath);
  } catch (err) {
    console.error(err)
  }
}

copy('lib/dependency/dependency', 'dist/dependency');
copy('lib/dependency/dependency.cmd', 'dist/dependency.cmd');
