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
var path = require("path");
var fs_extra_1 = require("fs-extra");
var executingModuleName = 'spypkg';
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var scriptEntries, spyProperty;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    scriptEntries = [
                        { 'add-spies': "node ./node_modules/spypkg --verbose" },
                        { 'remove-spies': "node ./node_modules/spypkg --remove --verbose" }
                    ];
                    return [4 /*yield*/, insertScriptEntries(scriptEntries)];
                case 1:
                    _a.sent();
                    spyProperty = {
                        spypkg: {
                            spies: [
                                "Enter the name of the command. If 'yarn in lieu of npm' spy needed, use: npm:*"
                            ],
                            location: "Location of where spy binaries will reside. Example: '/home/marc/.spies'"
                        }
                    };
                    return [4 /*yield*/, insertSpypkgProperty(spyProperty)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
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
function insertScriptEntries(value) {
    return __awaiter(this, void 0, void 0, function () {
        var JSONFilePath;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (Array.isArray(value) === false) {
                        value = [value];
                    }
                    JSONFilePath = path.resolve('../../package.json');
                    return [4 /*yield*/, fs_extra_1.pathExists(JSONFilePath)
                            .then(function (val) { return __awaiter(_this, void 0, void 0, function () {
                            var config_1, names_1, entry, err_1, result, err_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!val) return [3 /*break*/, 8];
                                        names_1 = [];
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, fs_extra_1.readJson(JSONFilePath)];
                                    case 2:
                                        config_1 = _a.sent();
                                        if (!config_1.scripts) {
                                            entry = value.shift();
                                            names_1.push(Object.getOwnPropertyNames(entry)[0]);
                                            Object.assign(config_1, { scripts: entry });
                                        }
                                        value.forEach(function (entry) {
                                            var name = Object.getOwnPropertyNames(entry)[0];
                                            var doesObjectExist = typeof (config_1.scripts[name]) === 'string';
                                            if (doesObjectExist === false) {
                                                names_1.push(name);
                                                Object.assign(config_1.scripts, entry);
                                            }
                                        });
                                        return [3 /*break*/, 4];
                                    case 3:
                                        err_1 = _a.sent();
                                        console.error(err_1);
                                        console.log("[" + executingModuleName + "]", 'Failed to update:', JSONFilePath);
                                        return [3 /*break*/, 4];
                                    case 4:
                                        _a.trys.push([4, 6, , 7]);
                                        return [4 /*yield*/, fs_extra_1.writeJson(JSONFilePath, config_1, { spaces: 2 })];
                                    case 5:
                                        result = _a.sent();
                                        names_1.forEach(function (entry) {
                                            console.log("[" + executingModuleName + "]", "Added '" + entry + "' command to:", JSONFilePath);
                                        });
                                        return [2 /*return*/, result];
                                    case 6:
                                        err_2 = _a.sent();
                                        console.log("[" + executingModuleName + "]", 'Failed to update:', JSONFilePath);
                                        console.error(err_2);
                                        return [3 /*break*/, 7];
                                    case 7: return [3 /*break*/, 9];
                                    case 8: return [2 /*return*/];
                                    case 9: return [2 /*return*/];
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
function insertSpypkgProperty(value) {
    return __awaiter(this, void 0, void 0, function () {
        var JSONFilePath;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    JSONFilePath = path.resolve('../../package.json');
                    return [4 /*yield*/, fs_extra_1.pathExists(JSONFilePath)
                            .then(function (val) { return __awaiter(_this, void 0, void 0, function () {
                            var config, entry, isSpypkg, err_3, result, err_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!val) return [3 /*break*/, 10];
                                        config = void 0;
                                        entry = 'spypkg';
                                        isSpypkg = void 0;
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, fs_extra_1.readJson(JSONFilePath)];
                                    case 2:
                                        config = _a.sent();
                                        isSpypkg = typeof (config.spypkg) === 'object';
                                        if (isSpypkg === false) {
                                            Object.assign(config, { spypkg: value.spypkg });
                                        }
                                        return [3 /*break*/, 4];
                                    case 3:
                                        err_3 = _a.sent();
                                        console.error(err_3);
                                        console.log("[" + executingModuleName + "]", 'Failed to update:', JSONFilePath);
                                        return [3 /*break*/, 4];
                                    case 4:
                                        _a.trys.push([4, 8, , 9]);
                                        if (!(isSpypkg === false)) return [3 /*break*/, 6];
                                        return [4 /*yield*/, fs_extra_1.writeJson(JSONFilePath, config, { spaces: 2 })];
                                    case 5:
                                        result = _a.sent();
                                        console.log("[" + executingModuleName + "]", "Added '" + entry + "' property to:", JSONFilePath);
                                        return [2 /*return*/, result];
                                    case 6: return [2 /*return*/];
                                    case 7: return [3 /*break*/, 9];
                                    case 8:
                                        err_4 = _a.sent();
                                        console.log("[" + executingModuleName + "]", 'Failed to update:', JSONFilePath);
                                        console.error(err_4);
                                        return [3 /*break*/, 9];
                                    case 9: return [3 /*break*/, 11];
                                    case 10: return [2 /*return*/];
                                    case 11: return [2 /*return*/];
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
//# sourceMappingURL=postinstall.js.map