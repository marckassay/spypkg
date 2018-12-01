"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var srcHarnessDirectory = ".\\harness\\altpack-harness\\";
var fse = require('fs-extra');
function deploy() {
    fse.copy(srcHarnessDirectory, '..\\altpack-harness\\')
        .then(function () { return console.log('success!'); })
        .catch(function (err) { return console.error(err); });
}
exports.deploy = deploy;
deploy();
//# sourceMappingURL=deploy.js.map