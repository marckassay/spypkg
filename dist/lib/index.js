#!/usr/bin/env node
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
var util = require("./utils");
var path_1 = require("path");
// switches..
var verboseSwitch = false;
var removeSwitch = false;
var forceSwitch = false;
var nohashresetSwitch = false;
var JSONFileName = 'package.json';
var JSONFilePath = path_1.join(process.cwd(), JSONFileName);
var JSONProperty = 'spypkg';
var builtInAdaptorSymbol = ':*';
var bashDependencyFileName = 'dependency';
var cmdDependencyFileName = 'dependency.cmd';
var adaptorFileName = 'adaptor.js';
var isWin = process.platform === "win32";
/**
 * The location to the `out` folder. This is intended to reside as a sub-directory of project. This
 * is optional, but required if a custom adaptor file is declared in JSON config property.
 */
var projectOutPath;
/**
 * The value of where the spies will be deployed to. This is required unless declared for individual
 * spy.
 */
var location;
var distBashDependencyFilePath = path_1.join(__dirname, bashDependencyFileName);
function outBashDependencyFilePath() {
    if (!projectOutPath) {
        return distBashDependencyFilePath;
    }
    else {
        return path_1.join(projectOutPath, bashDependencyFileName);
    }
}
var distCmdDependencyFilePath = path_1.join(__dirname, cmdDependencyFileName);
function outCmdDependencyFilePath() {
    if (!projectOutPath) {
        return distCmdDependencyFilePath;
    }
    else {
        return path_1.join(projectOutPath, cmdDependencyFileName);
    }
}
var distAdaptorFilePath = path_1.join(__dirname, 'adaptor', adaptorFileName);
function outAdaptorFilePath(name) {
    if (name === void 0) { name = adaptorFileName; }
    return path_1.join(projectOutPath, name);
}
/**
 * This will return an extensionless path to the command destination which is valid for the bash file.
 * To have a valid batch file, simply join the value of '.cmd'.
 *
 * @param name the command name, ie, 'cordova', 'npm'.
 * @param commandDirectoryPath the command destination location value
 * @returns an extensionless path to the command destination.
 */
function resolveScriptLocationPath(name, commandDirectoryPath) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedCommandDirectoryPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!commandDirectoryPath) return [3 /*break*/, 2];
                    return [4 /*yield*/, util.checkAndResolveScriptBlock(commandDirectoryPath)];
                case 1:
                    resolvedCommandDirectoryPath = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!resolvedCommandDirectoryPath && location) {
                        resolvedCommandDirectoryPath = location;
                    }
                    else if (!resolvedCommandDirectoryPath && !location) {
                        throw new Error("[spypkg] Missing 'location' property for 'spypkg' object. See documentation: https://github.com/marckassay/spypkg");
                    }
                    return [2 /*return*/, path_1.join(resolvedCommandDirectoryPath, name.replace(':*', ''))];
            }
        });
    });
}
var resolveAdaptorFilePath = function (name, adaptor) {
    var results;
    if (name.endsWith(builtInAdaptorSymbol)) {
        name = name.split(builtInAdaptorSymbol)[0];
        results = path_1.join(__dirname, 'adaptor', name + '-adaptor.js');
    }
    else if (adaptor === undefined) {
        results = distAdaptorFilePath;
    }
    else {
        results = path_1.join(process.cwd(), adaptor);
    }
    return results;
};
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var j, config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // setting command-line switches
                    for (j = 0; j < process.argv.length; j++) {
                        if (process.argv[j] === '--verbose') {
                            verboseSwitch = true;
                        }
                        else if (process.argv[j] === '--remove') {
                            removeSwitch = true;
                        }
                        else if (process.argv[j] === '--force') {
                            forceSwitch = true;
                        }
                        else if (process.argv[j] === '--no-hash-reset') {
                            nohashresetSwitch = true;
                        }
                    }
                    return [4 /*yield*/, util.readJSONProperty(JSONFilePath, JSONProperty)];
                case 1:
                    config = _a.sent();
                    projectOutPath = config.projectOutPath;
                    location = config.location;
                    if (!(removeSwitch === false)) return [3 /*break*/, 5];
                    if (!forceSwitch) return [3 /*break*/, 3];
                    return [4 /*yield*/, removeSpies(config)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [4 /*yield*/, addSpies(config)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, removeSpies(config)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    if (!(!isWin && !nohashresetSwitch)) return [3 /*break*/, 9];
                    return [4 /*yield*/, util.executeScriptBlock('{hash -r}', 'Unable to reset hash. Spies may not be called until hash is reset.')];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [2 /*return*/];
            }
        });
    });
}
function addSpies(config) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, util.asyncForEach((config.spies), function (spy) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(typeof spy === 'object')) return [3 /*break*/, 2];
                                    return [4 /*yield*/, addSpy(spy.name, spy.location, spy.adaptor)];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, addSpy(spy)];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function removeSpies(config) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, util.asyncForEach((config.spies), function (spy) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(typeof spy === 'object')) return [3 /*break*/, 2];
                                    return [4 /*yield*/, removeSpy(spy.name, spy.location)];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, removeSpy(spy)];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
* Creates a dependency from the data parsed in packages property of package.json.
*
* @param {string} name the command name that is to be used in shell.
* @param {string} commandDirectoryPath the directory of where the files will reside. this is the value
of the `location` property of the JSON object. This value must be listed in your operating system's
environment variable.
* @param {string} adaptor the JS file where the command resolves to. Defaults to `adaptor.js`.
*/
function addSpy(name, commandDirectoryPath, adaptor) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedScriptLocationFilePath, resolvedAdaptorFilePath, arr;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resolveScriptLocationPath(name, commandDirectoryPath)];
                case 1:
                    resolvedScriptLocationFilePath = _a.sent();
                    resolvedAdaptorFilePath = resolveAdaptorFilePath(name, adaptor);
                    if (!projectOutPath) return [3 /*break*/, 5];
                    return [4 /*yield*/, util.checkAndCreateACopy(distBashDependencyFilePath, outBashDependencyFilePath())];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, util.checkAndCreateACopy(distCmdDependencyFilePath, outCmdDependencyFilePath())];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, util.checkAndCreateACopy(resolvedAdaptorFilePath, outAdaptorFilePath(util.getFullname(resolvedAdaptorFilePath)))];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (!!isWin) return [3 /*break*/, 7];
                    return [4 /*yield*/, util.makeFileExecutable(outBashDependencyFilePath())];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    arr = [
                        { src: outBashDependencyFilePath(), dest: resolvedScriptLocationFilePath },
                        { src: outCmdDependencyFilePath(), dest: resolvedScriptLocationFilePath + '.cmd' }
                    ];
                    return [4 /*yield*/, util.asyncForEach(arr, function (spy) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, util.checkAndCreateACopy(spy.src, spy.dest)
                                            .then(function (value) {
                                            if (verboseSwitch && value) {
                                                console.log("[spypkg] Added: " + spy.dest);
                                            }
                                            return;
                                        })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 8:
                    _a.sent();
                    return [2 /*return*/, Promise.resolve()];
            }
        });
    });
}
function removeSpy(name, commandDirectoryPath) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedScriptLocationFilePath;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resolveScriptLocationPath(name, commandDirectoryPath)];
                case 1:
                    resolvedScriptLocationFilePath = _a.sent();
                    return [4 /*yield*/, util.asyncForEach([{ dest: resolvedScriptLocationFilePath }, { dest: resolvedScriptLocationFilePath + '.cmd' }], function (spy) { return __awaiter(_this, void 0, void 0, function () {
                            var continu, fileContent, foundSpypkgMsg;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, util.doesFileExistAsync(spy.dest)
                                            .then(function (value) {
                                            if (!value && verboseSwitch) {
                                                console.log("[spypkg] File does not exist: " + spy.dest);
                                            }
                                            return value;
                                        })];
                                    case 1:
                                        continu = _a.sent();
                                        fileContent = '';
                                        if (!continu) return [3 /*break*/, 3];
                                        return [4 /*yield*/, util.readFileAsync(spy.dest, 'Unable to determine if file is from spypkg. Remove or backup the following file: ' + spy.dest)];
                                    case 2:
                                        fileContent = _a.sent();
                                        continu = (fileContent.length > 0);
                                        _a.label = 3;
                                    case 3:
                                        if (!continu) return [3 /*break*/, 6];
                                        foundSpypkgMsg = fileContent.search(/(SPYPKG HAS GENERATED THIS FILE!)/) !== -1;
                                        if (!!foundSpypkgMsg) return [3 /*break*/, 4];
                                        console.log("[spypkg] This file seems to have not been generated by spypkg. Remove or backup this file: " + spy.dest);
                                        continu = false;
                                        return [3 /*break*/, 6];
                                    case 4: return [4 /*yield*/, util.removeFile(spy.dest, 'Unable to remove file. Do you have permissions to access this file?: ')];
                                    case 5:
                                        continu = _a.sent();
                                        _a.label = 6;
                                    case 6:
                                        if (continu && verboseSwitch) {
                                            console.log("[spypkg] Removed: " + spy.dest);
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, Promise.resolve()];
            }
        });
    });
}
init();
//# sourceMappingURL=index.js.map