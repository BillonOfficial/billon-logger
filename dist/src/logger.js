"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const importer_1 = require("./importer");
const logger_format_1 = require("./logger.format");
let level = 'debug';
if (importer_1.yargs.argv.logs) {
    level = importer_1.yargs.argv.logs;
}
const winstonConsoleConfig = {
    colorize: true,
    json: false,
    level,
    prettyPrint: true,
    timestamp: logger_format_1.dateFormat,
};
importer_1.winston.transports.DailyRotateFile = importer_1.winstonDailyRotateFile;
const dailyRotateTransport = new importer_1.winston.transports.DailyRotateFile({
    colorize: false,
    datePattern: 'yyyy-MM-dd.',
    filename: importer_1.appRootPath.resolve(`data/logs/main.log`),
    json: false,
    level,
    maxFiles: 12,
    maxsize: 640000,
    prepend: true,
    timestamp: logger_format_1.simpleDateFormat,
});
const winstonConsole = new importer_1.winston.transports.Console(winstonConsoleConfig);
const transports = [
    winstonConsole,
    dailyRotateTransport,
];
const exceptionHandlers = [
    winstonConsole,
    new importer_1.winston.transports.File({
        datePattern: 'yyyy-MM-dd.',
        colorize: false,
        filename: `./data/logs/exceptions.log`,
        json: false,
        timestamp: logger_format_1.simpleDateFormat,
        humanReadableUnhandledException: true,
    }),
];
const winstonConfig = {
    exceptionHandlers,
    transports,
};
exports.logger = new importer_1.winston.Logger(winstonConfig);
const childLoggerCache = new Set();
exports.childLogger = (filePath) => {
    const label = importer_1.path.basename(filePath.replace(/\.[^/.]+$/, ''));
    const consoleConfig = importer_1._.extend(winstonConsoleConfig, {
        label,
    });
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
        child: (childLabel) => {
            return exports.childLogger(`${filePath}:${childLabel}`);
        },
    };
    const shardLogger = importer_1._.extend({}, winstonLogger, extension);
    if (childLoggerCache.has(label)) {
        shardLogger.warn(`duplicate logger ${label} (${filePath})`);
    }
    childLoggerCache.add(label);
    return shardLogger;
};
//# sourceMappingURL=logger.js.map