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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("util");
var child = require("child_process");
var exec = util_1.promisify(child.exec);
/**
 * Maps values from equivalence tables to `target`. `target` is the npm expression and `segment`
 * determines what mapped segment will be return. The equivalence tables are constants that are
 * declared inside this function.
 *
 * @param target the npm expression
 * @param segment determines what segment of the expression this function will map and return.
 */
function getIsoMorphedSegment(target, segment) {
    var commandEquivalenceTable = {
        'install [package] --save': 'add',
        'install [package] --save-dev': 'add',
        'install [package] --save-optional': 'add',
        'install [package] --save-exact': 'add',
        'install [package] --global': 'global add',
        'update --global': 'global add',
        'rebuild': 'add',
    };
    // tslint:disable-next-line:whitespace
    var optionsEquivalenceTable = {
        '--no-package-lock': '--no-lockfile',
        '--production': '',
        '--save': '**prod',
        '--save-prod': '**prod',
        '-P': '**prod',
        '--save-dev': '--dev',
        '-D': '--dev',
        '--save-optional': '--optional',
        '-O': '--optional',
        '--save-exact': '--exact',
        '-E': '--exact',
        '--global': '**global'
    };
    var source;
    switch (segment) {
        case 'command':
            source = commandEquivalenceTable;
            break;
        case 'options':
            source = optionsEquivalenceTable;
            break;
        default:
            break;
    }
    var targetSegment = target[segment].trim().split(' ');
    return targetSegment.map(function (val) {
        var mappedval = source[val.trim()];
        return (mappedval) ? mappedval : val;
    });
}
var regex = new RegExp([
    '^(?<exe>npm)?\\ ?',
    '(?<run>(?<=\\k<exe> )run(?:-script)?)?\\ ?',
    '(?<command>(?<=\\k<run> )[a-z]+(?:[:][a-z]+)?|(?<!\\k<run> )[a-z]+(?:[-][a-z]+)?)(?<=\\k<command>)\\ ?',
    '(?<pkgdetails>[a-z0-9\\>\\=\\:\\+\\#\\^\\.\\@\\-\\/]*|(?<!\\k<command>)$)?',
    '(?<options>(?:\\ [-]{1,2}[a-zA-Z]+(?:[-][a-z]+)?)*)$'
].join(''));
var verboseEnabled;
// tslint:disable-next-line:no-inferrable-types
var argument = '';
// prepare argv values into argument, so that regex can parse as expected
for (var j = 2; j < process.argv.length; j++) {
    if (process.argv[j] === '--verbose') {
        verboseEnabled = true;
    }
    else {
        argument += ' ' + process.argv[j];
    }
}
argument = argument.trimLeft();
var parsedArg = regex.exec(argument)['groups'];
var getPrefixForYarnExpression = function (yarnExpression) {
    var transformedExe;
    if (process.platform === 'win32') {
        transformedExe = 'cmd';
        if (!parsedArg.run) {
            yarnExpression = ['/c', 'yarn'].concat(yarnExpression);
        }
        else {
            yarnExpression = ['/c', 'yarn', 'run'].concat(yarnExpression);
        }
    }
    else {
        transformedExe = 'yarn';
        if (parsedArg.run) {
            yarnExpression = ['run'].concat(yarnExpression);
        }
    }
    return transformedExe + ' ' + yarnExpression.join(' ');
};
var exe = function (npmExpression, yarnExpression) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (verboseEnabled) {
                    console.log('The npm expression below has been transformed into the followed yarn expression:');
                    console.log(npmExpression);
                    console.log(yarnExpression);
                }
                return [4 /*yield*/, exec(yarnExpression)
                        .then(function (onfulfilled) {
                        if (onfulfilled.stdout) {
                            console.log(onfulfilled.stdout);
                        }
                        if (onfulfilled.stderr) {
                            console.log(onfulfilled.stderr);
                        }
                    })
                        .catch(function (reason) {
                        console.log(reason);
                    })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
// TODO: unsure how to handle short expressions like this with current regex:
if (argument === 'npm -v') {
    exe(argument, 'yarn -v');
}
else {
    var transformedCommand = void 0;
    // tslint:disable-next-line:no-inferrable-types
    var transformedPkgDetails = '';
    var transformedOptions = void 0;
    var transformedOptionsString = void 0;
    if (parsedArg.pkgdetails) {
        transformedPkgDetails = parsedArg.pkgdetails;
    }
    if (parsedArg.options) {
        transformedOptions = getIsoMorphedSegment(parsedArg, 'options');
    }
    switch (parsedArg.command) {
        case 'uninstall':
            transformedCommand = 'remove';
            if (transformedOptions && transformedOptions.some(function (value) { return value === '**prod'; })) {
                transformedOptions = transformedOptions.filter(function (value) { return value !== '**prod'; });
            }
            else if (transformedOptions && transformedOptions.some(function (value) { return value === '**global'; })) {
                transformedCommand = 'global remove';
            }
            break;
        case 'install':
            transformedCommand = 'add';
            if (transformedOptions && transformedOptions.some(function (value) { return value === '**prod'; })) {
                transformedOptions = transformedOptions.filter(function (value) { return value !== '**prod'; });
            }
            else if (transformedOptions && transformedOptions.some(function (value) { return value === '**global'; })) {
                transformedCommand = 'global add';
            }
            else if (!transformedPkgDetails) {
                transformedCommand = 'install';
            }
            break;
        default:
            transformedCommand = parsedArg.command;
    }
    transformedOptionsString = (transformedOptions) ? transformedOptions.join(' ') : '';
    var transformedExpression = [transformedCommand, transformedPkgDetails, transformedOptionsString].filter(function (value) { return value.length > 0; });
    exe(argument, getPrefixForYarnExpression(transformedExpression));
}
//# sourceMappingURL=npm-adaptor.js.map