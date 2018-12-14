"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var child = require("child_process");
var util_1 = require("util");
var fs = require('fs-extra');
var exec = util_1.promisify(child.exec);
function deploy() {
    return __awaiter(this, void 0, void 0, function () {
        var shellExe, npmExe, relativeHarnessSrcPath_1, relativeHarnessDestinationPath_1, createSymlink, err_1, command, toProceed, err_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    shellExe = (process.platform === 'win32') ? 'cmd /c' : '';
                    npmExe = (process.env.PATH.search('Yarn')) ? 'yarn' : 'npm';
                    relativeHarnessSrcPath_1 = 'harness/spypkg-harness';
                    relativeHarnessDestinationPath_1 = '../spypkg-harness';
                    createSymlink = function () { return __awaiter(_this, void 0, void 0, function () {
                        var err_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, fs.ensureSymlink(relativeHarnessSrcPath_1, relativeHarnessDestinationPath_1, 'dir')];
                                case 1:
                                    _a.sent();
                                    console.log('[spypkg] Created filesystem symlink from: ' + relativeHarnessSrcPath_1 + ', to: ' + relativeHarnessDestinationPath_1);
                                    return [3 /*break*/, 3];
                                case 2:
                                    err_3 = _a.sent();
                                    console.error('[spypkg] ' + err_3);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, createSymlink()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.copy('build/harness/.bin', relativeHarnessDestinationPath_1 + '/node_modules/.bin')];
                case 3:
                    _a.sent();
                    console.log('[spypkg] copied: build/harness/.bin --> ' + relativeHarnessDestinationPath_1 + '/node_modules/.bin');
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [3 /*break*/, 5];
                case 5:
                    console.log("[spypkg] step 1/2 - Registering module for '" + npmExe + "' for linking.");
                    command = (shellExe + ' ' + npmExe + ' link').trimLeft();
                    console.log('[spypkg] Executing: ' + command);
                    return [4 /*yield*/, exec(command)
                            .then(function (onfulfilled) {
                            if (onfulfilled.stdout) {
                                console.log(onfulfilled.stdout);
                            }
                            if (onfulfilled.stderr) {
                                console.log(onfulfilled.stderr);
                            }
                            return true;
                        })
                            .catch(function (reason) {
                            console.log(reason);
                            return false;
                        })];
                case 6:
                    toProceed = _a.sent();
                    if (!toProceed) return [3 /*break*/, 8];
                    process.chdir(relativeHarnessDestinationPath_1);
                    console.log("[spypkg] Changed directory to: " + process.cwd());
                    console.log('[spypkg] step 2/2 - Appling new link to harness directory.');
                    // ...now execute the link command again specifiying 'spypkg'...
                    command = (shellExe + ' ' + npmExe + ' link spypkg --dev').trimLeft();
                    console.log('[spypkg] Executing: ' + command);
                    return [4 /*yield*/, exec(command)
                            .then(function (onfulfilled) {
                            if (onfulfilled.stdout) {
                                // console.log(onfulfilled.stdout);
                                console.log('[spypkg] Test harness deployed successfully.');
                            }
                            if (onfulfilled.stderr) {
                                console.log('[spypkg] ' + onfulfilled.stderr);
                            }
                        })
                            .catch(function (reason) {
                            console.log('[spypkg] ' + reason);
                        })];
                case 7: return [2 /*return*/, _a.sent()];
                case 8: return [3 /*break*/, 10];
                case 9:
                    err_2 = _a.sent();
                    console.error('[spypkg] ' + err_2);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.deploy = deploy;
deploy();
//# sourceMappingURL=deploy.js.map