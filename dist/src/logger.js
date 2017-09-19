"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const importer_1 = require("./importer");
const logger_format_1 = require("./logger.format");
importer_1.winston.transports.DailyRotateFile = importer_1.winstonDailyRotateFile;
let level = 'debug';
if (importer_1.yargs.argv.logs) {
    level = importer_1.yargs.argv.logs;
}
class BillonLogger {
    constructor() {
        this.config = {
            level,
            winston: {
                console: {
                    colorize: true,
                    json: false,
                    level,
                    prettyPrint: true,
                    timestamp: logger_format_1.dateFormat,
                },
                dailyRotateFile: {
                    colorize: false,
                    datePattern: 'yyyy-MM-dd.',
                    filename: importer_1.appRootPath.resolve(`data/logs/main.log`),
                    json: false,
                    level,
                    maxFiles: 12,
                    maxsize: 640000,
                    prepend: true,
                    timestamp: logger_format_1.simpleDateFormat,
                },
                exceptions: {
                    datePattern: 'yyyy-MM-dd.',
                    colorize: false,
                    filename: importer_1.appRootPath.resolve(`data/logs/exceptions.log`),
                    json: false,
                    timestamp: logger_format_1.simpleDateFormat,
                    humanReadableUnhandledException: true,
                },
            },
        };
        this.childrenCache = new Set();
        const winstonConsole = new importer_1.winston.transports.Console(this.config.winston.console);
        const dailyRotateTransport = new importer_1.winston.transports.DailyRotateFile(this.config.winston.dailyRotateFile);
        const transports = [
            winstonConsole,
            dailyRotateTransport,
        ];
        const exceptionHandlers = [
            winstonConsole,
            new importer_1.winston.transports.File(this.config.winston.exceptions),
        ];
        const winstonConfig = {
            exceptionHandlers,
            transports,
        };
        const logger = new importer_1.winston.Logger(winstonConfig);
    }
    child(fileName, config = this.config) {
        const label = importer_1.path.basename(fileName.replace(/\.[^/.]+$/, ''));
        const consoleConfig = importer_1._.assign({}, config.winston.console, {
            label,
        });
        const exceptionHandlers = [
            config.winston.console,
            new importer_1.winston.transports.File(config.winston.exceptions),
        ];
        const dailyRotateTransport = new importer_1.winston.transports.DailyRotateFile(config.winston.dailyRotateFile);
        const winstonLogger = importer_1.winston.loggers.add(label, {
            console: consoleConfig,
            transports: [
                dailyRotateTransport,
            ],
        });
        const extension = {
            start: () => {
                winstonLogger.debug(`<start>`);
            },
            end: () => {
                winstonLogger.debug(`</end>`);
            },
            critical: (msg, ...meta) => __awaiter(this, void 0, void 0, function* () {
                winstonLogger.error(msg, ...meta);
                if (!config.emailErrors || !config.emailErrors.active) {
                    return;
                }
                const transporter = importer_1.nodemailer.createTransport(config.emailErrors.nodemailer.smtps);
                const info = yield transporter.sendMail({
                    html: yield config.emailErrors.nodemailer.html(msg, meta),
                    subject: yield config.emailErrors.nodemailer.subject(msg, meta),
                    to: yield config.emailErrors.nodemailer.to(msg, meta),
                    from: yield config.emailErrors.nodemailer.from(msg, meta),
                });
                return info;
            }),
            child: (childLabel, childConfig = config) => {
                return this.child(`${fileName}:${childLabel}`, childConfig);
            },
        };
        const billonChildLogger = importer_1._.extend({}, winstonLogger, extension);
        if (this.childrenCache.has(label)) {
            billonChildLogger.warn(`duplicate logger ${label} (${fileName})`);
        }
        this.childrenCache.add(label);
        return billonChildLogger;
    }
}
exports.BillonLogger = BillonLogger;
//# sourceMappingURL=logger.js.map