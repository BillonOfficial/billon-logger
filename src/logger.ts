import {
    _, winston, yargs, path, winstonDailyRotateFile, appRootPath, nodemailer,
} from './importer';

import {
    simpleDateFormat, dateFormat,
} from './logger.format';

import {
    LogLevel, BillonLoggerConfig, BillonChildLogger, BillonChildLoggerMethods,
} from './logger.interface';

winston.transports.DailyRotateFile = winstonDailyRotateFile;

let level: LogLevel = 'debug';
if (yargs.argv.logs) {
    level = yargs.argv.logs;
}

export class BillonLogger {
    public config: BillonLoggerConfig = {
        level,
        winston: {
            console: {
                colorize: true,
                json: false,
                level,
                prettyPrint: true,
                timestamp: dateFormat,
            },
            dailyRotateFile: {
                colorize: false,
                datePattern: 'yyyy-MM-dd.',
                filename: appRootPath.resolve(`data/logs/main.log`),
                json: false,
                level,
                maxFiles: 12,
                maxsize: 640000,
                prepend: true,
                timestamp: simpleDateFormat,
            },
            exceptions: {
                datePattern: 'yyyy-MM-dd.',
                colorize: false,
                filename: appRootPath.resolve(`data/logs/exceptions.log`),
                json: false,
                timestamp: simpleDateFormat,
                humanReadableUnhandledException: true,
            },
        },
    };

    private childrenCache = new Set<string>();

    public constructor() {
        const winstonConsole = new winston.transports.Console(this.config.winston.console);
        const dailyRotateTransport = new winston.transports.DailyRotateFile(this.config.winston.dailyRotateFile);

        const transports = [
            winstonConsole,
            dailyRotateTransport,
        ];

        const exceptionHandlers = [
            winstonConsole,
            new winston.transports.File(this.config.winston.exceptions),
        ];

        const winstonConfig = {
            exceptionHandlers,
            transports,
        };

        const logger = new winston.Logger(winstonConfig);
    }

    public child(fileName: string, config = this.config): BillonChildLogger {
        const label = path.basename(fileName.replace(/\.[^/.]+$/, ''));

        const consoleConfig = _.assign({}, config.winston.console, {
            label,
        });

        const exceptionHandlers = [
            config.winston.console,
            new winston.transports.File(config.winston.exceptions),
        ];

        const dailyRotateTransport = new winston.transports.DailyRotateFile(config.winston.dailyRotateFile);
        const winstonLogger = winston.loggers.add(label, {
            console: consoleConfig,
            transports: [
                dailyRotateTransport,
            ],
        });

        const extension: BillonChildLoggerMethods = {
            start: () => {
                winstonLogger.debug(`<start>`);
            },
            end: () => {
                winstonLogger.debug(`</end>`);
            },
            raw: (msg: string, ...meta: any[]) => {
                /* tslint:disable:no-console */
                console.log(msg, ...meta);
                /* tslint:enable:no-console */
            },
            critical: async (msg: string, ...meta: any[]) => {
                winstonLogger.error(msg, ...meta);

                if (!config.emailErrors || !config.emailErrors.active) {
                    return;
                }

                const transporter = nodemailer.createTransport(config.emailErrors.nodemailer.smtps);

                const info = await transporter.sendMail({
                    html: await config.emailErrors.nodemailer.html(msg, meta),
                    subject: await config.emailErrors.nodemailer.subject(msg, meta),
                    to: await config.emailErrors.nodemailer.to(msg, meta),
                    from: await config.emailErrors.nodemailer.from(msg, meta),
                });

                return info;
            },
            child: (childLabel: string, childConfig = config) => {
                return this.child(`${label}-${childLabel}`, childConfig);
            },
        };

        const billonChildLogger: BillonChildLogger = _.extend({}, winstonLogger, extension);

        // check for duplicate loggers
        if (this.childrenCache.has(label)) {
            billonChildLogger.warn(`duplicate logger ${label} (${fileName})`);
        }

        this.childrenCache.add(label);
        return billonChildLogger;
    }
}
