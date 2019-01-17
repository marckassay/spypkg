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
var fs = require("fs");
var util_1 = require("util");
var path = require("path");
var fse = require('fs-extra');
// TODO: remove this to make it public; currently conflicts with orginial function
var readFileAsync2 = util_1.promisify(fs.readFile);
var writeFileAsync = util_1.promisify(fs.writeFile);
var renameFileAsync = util_1.promisify(fs.rename);
// tslint:disable-next-line:newspaper-order
function readFileAsync(filePath, err_message) {
    return __awaiter(this, void 0, void 0, function () {
        var readFile, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    readFile = util_1.promisify(fs.readFile);
                    return [4 /*yield*/, readFile(filePath, 'utf8')
                            .then(function (value) {
                            return value;
                        })
                            .catch(function () {
                            return Promise.reject(err_message);
                        })];
                case 1: return [2 /*return*/, _b.sent()];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, Promise.reject(err_message)];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.readFileAsync = readFileAsync;
function doesFileExistAsync(filePath, err_message) {
    return __awaiter(this, void 0, void 0, function () {
        var doesFileExist;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    doesFileExist = util_1.promisify(fs.exists);
                    return [4 /*yield*/, doesFileExist(filePath)
                            .then(function (value) {
                            if (value === false && err_message) {
                                console.error(err_message);
                                process.exit(1001);
                            }
                            else {
                                return value;
                            }
                        })
                            .catch(function () {
                            console.error(err_message);
                            process.exit(1001);
                            return false; // superfluous, but linter wants it.
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.doesFileExistAsync = doesFileExistAsync;
function executeScriptBlock(scriptblock, err_message) {
    return __awaiter(this, void 0, void 0, function () {
        var command, execute;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    command = scriptblock.replace(/[\{\}]/g, '');
                    execute = util_1.promisify(child.exec);
                    return [4 /*yield*/, execute(command)
                            .then(function (value) {
                            if (value.stderr) {
                                console.error(err_message + scriptblock);
                                process.exit(1003);
                            }
                            else {
                                return value.stdout.replace(/[\"\']/g, '').trimRight();
                            }
                        })
                            .catch(function () {
                            console.error(err_message + scriptblock);
                            process.exit(1003);
                            return '1003'; // superfluous, but linter wants it.
                        })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.executeScriptBlock = executeScriptBlock;
function removeFile(filePath, err_message) {
    return __awaiter(this, void 0, void 0, function () {
        var remove;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    remove = util_1.promisify(fs.unlink);
                    // tslint:disable-next-line:no-bitwise
                    err_message;
                    return [4 /*yield*/, remove(filePath)
                            .then(function () {
                            return true;
                        })
                            .catch(function () {
                            console.error('Although permissions to remove file is correct, failure occurred.' +
                                ' Is there another process accessing this file?: ' + filePath);
                            process.exit(1004);
                            return false;
                        })];
                case 1: 
                /* TODO: disabling this for now; something with Promise<void> and thenable from caller
                if (!checkUsersPermissions(filePath, fs.constants.W_OK | fs.constants.R_OK)) {
                    console.error(err_message + filePath);
                    process.exit(1004);
                    return;
                  }
                */
                return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.removeFile = removeFile;
/**
 * Checks the destination for exisitence, if not existent it will create a copy from source.
 */
function checkAndCreateACopy(source, destination) {
    return __awaiter(this, void 0, void 0, function () {
        var copy;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    copy = util_1.promisify(fs.copyFile);
                    return [4 /*yield*/, doesFileExistAsync(destination)
                            .then(function (value) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!!value) return [3 /*break*/, 3];
                                        return [4 /*yield*/, fse.ensureDir(path.dirname(destination))];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, copy(source, destination)];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/, true];
                                    case 3: return [2 /*return*/, false];
                                }
                            });
                        }); })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.checkAndCreateACopy = checkAndCreateACopy;
function createSymlink(filePath, linkPath) {
    fs.symlinkSync(path.resolve(filePath), path.resolve(linkPath), 'file');
    return Promise.resolve();
    /*   const slink = promisify(fs.symlink);
      console.log(path.resolve(filePath) + ' --> ' + linkPath);
      return slink(filePath, linkPath)
        .then(() => {
          console.log('linking it');
          return Promise.resolve();
        }, (reason) => {
          console.error('Cant link it');
          process.exit(1007);
          return;
        })
        .catch(() => {
          console.error('Cant link it');
          process.exit(1007);
          return;
        }); */
}
exports.createSymlink = createSymlink;
// https://stackoverflow.com/a/46974091/648789
function replaceTokenInFile(file, tokenExpression, replacement) {
    return __awaiter(this, void 0, void 0, function () {
        var tmpfile, contents, replaced_contents, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tmpfile = file + ".tmp";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, readFileAsync2(file, 'utf8')];
                case 2:
                    contents = _a.sent();
                    replaced_contents = contents.replace(tokenExpression, replacement);
                    return [4 /*yield*/, writeFileAsync(tmpfile, replaced_contents, 'utf8')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, renameFileAsync(tmpfile, file)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.log('ERROR Calling utils.replaceTokenInFile(' + file + ',' + tokenExpression + ',' + replacement + ')');
                    console.log(error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.replaceTokenInFile = replaceTokenInFile;
function getFullname(filePath) {
    return path.basename(filePath);
}
exports.getFullname = getFullname;
/*
function checkUsersPermissions(filePath, mode): boolean {
  try {
    fs.accessSync(filePath, mode);
    return true;
  } catch (err) {
    return false;
  }
}
*/
/**
 * Changes mode for file to '555'. This function is only for applicable for POSIX.
 *
 * @param filePath The file to change mode to.
 */
function makeFileExecutable(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var changeMode;
        return __generator(this, function (_a) {
            changeMode = util_1.promisify(fs.chmod);
            // octal '555' is expressed as: -r-xr-xr-x
            return [2 /*return*/, changeMode(filePath, '555')
                    .then(function () {
                    return Promise.resolve();
                }, function () {
                    console.error('Unable to make the following file executable for POSIX environments: ' + filePath);
                    process.exit(1006);
                    return;
                })
                    .catch(function () {
                    console.error('Unable to make the following file executable for POSIX environments: ' + filePath);
                    process.exit(1006);
                    return;
                })];
        });
    });
}
exports.makeFileExecutable = makeFileExecutable;
/*
* Resolve commandDirectoryPath if its in a scriptblock.
*/
function checkAndResolveScriptBlock(value) {
    return __awaiter(this, void 0, void 0, function () {
        var scriptBlock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(value && value.search(/(?<={).*(?=})/) > 0)) return [3 /*break*/, 2];
                    scriptBlock = value.match(/(?<={).*(?=})/)[0];
                    return [4 /*yield*/, executeScriptBlock(scriptBlock, 'Unable to execute the following scriptblock: ')
                            .then(function (value) {
                            return value.replace(/[{].*[}]/, value);
                        })];
                case 1:
                    value = _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, Promise.resolve(value)];
            }
        });
    });
}
exports.checkAndResolveScriptBlock = checkAndResolveScriptBlock;
function readJSONProperty(filepath, property) {
    return __awaiter(this, void 0, void 0, function () {
        var filename, configRaw, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filename = path.basename(filepath, '.json');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, doesFileExistAsync(filepath, 'Unable to load ' + filename)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, readFileAsync(filepath, 'Unable to read ' + filename)];
                case 3:
                    configRaw = _a.sent();
                    if (property) {
                        return [2 /*return*/, JSON.parse(configRaw)[property]];
                    }
                    else {
                        return [2 /*return*/, JSON.parse(configRaw)];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    if (property) {
                        throw new Error("Unable to parse " + property + " property " + filename + " into a JSON object.");
                    }
                    else {
                        throw new Error("Unable to parse " + filename + " into a JSON object.");
                    }
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.readJSONProperty = readJSONProperty;
function asyncForEach(value, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var index;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    index = 0;
                    _a.label = 1;
                case 1:
                    if (!(index < value.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, callback(value[index], index, value)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    index++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.asyncForEach = asyncForEach;
//# sourceMappingURL=utils.js.map