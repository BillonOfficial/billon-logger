import {
    _, winston, yargs, path, winstonDailyRotateFile, appRootPath,
} from './importer';

import {
    simpleDateFormat, dateFormat,
} from './logger.format';

export type LogLevel = 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error';
let level: LogLevel = 'debug';
if (yargs.argv.logs) {
    level = yargs.argv.logs;
}

const winstonConsoleConfig = {
    colorize: true,
    json: false,
    level,
    prettyPrint: true,
    timestamp: dateFormat,
};

/* tslint:disable:no-var-requires */
winston.transports.DailyRotateFile = winstonDailyRotateFile;
/* tslint:enable:no-var-requires */

const dailyRotateTransport = new winston.transports.DailyRotateFile({
    colorize: false,
    datePattern: 'yyyy-MM-dd.',
    filename: appRootPath.resolve(`data/logs/main.log`),
    json: false,
    level,
    maxFiles: 12,
    maxsize: 640000,
    prepend: true,
    timestamp: simpleDateFormat,
});

const winstonConsole = new winston.transports.Console(winstonConsoleConfig);

const transports = [
    winstonConsole,
    dailyRotateTransport,
];

const exceptionHandlers = [
    winstonConsole,
    new winston.transports.File({
        datePattern: 'yyyy-MM-dd.',
        colorize: false,
        filename: `./data/logs/exceptions.log`,
        json: false,
        timestamp: simpleDateFormat,
        humanReadableUnhandledException: true,
    }),
];

const winstonConfig = {
    exceptionHandlers,
    transports,
};

export const logger = new winston.Logger(winstonConfig);

export interface ShardLogger extends winston.LoggerInstance {
    start: () => void;
    end: () => void;
}

const childLoggerCache = new Set<string>();

// label is filename
export const childLogger = (filePath: string): ShardLogger => {

    const label = path.basename(filePath.replace(/\.[^/.]+$/, ''));

    const childConsoleConfig = _.extend(winstonConsoleConfig, {
        label,
    });

    const winstonLogger = winston.loggers.add(label, {
        console: childConsoleConfig,
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
    };

    const shardLogger = _.extend({}, winstonLogger, extension);

    // check for duplicate loggers
    if (childLoggerCache.has(label)) {
        shardLogger.warn(`duplicate logger ${label} (${filePath})`);
    }

    childLoggerCache.add(label);

    return shardLogger;
};
