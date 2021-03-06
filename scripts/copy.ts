const fs = require('fs-extra')
const path = require("path");

async function copy(srcpath, dstpath) {
  try {
    await fs.copy(srcpath, path.join(process.cwd(), dstpath));
    console.log('[spypkg] Copied: ' + srcpath + ' -> ' + dstpath);
  } catch (err) {
    console.error(err)
  }
}

copy('lib/dependency/dependency', 'dist/lib/dependency/dependency');
copy('lib/dependency/dependency.cmd', 'dist/lib/dependency/dependency.cmd');
