import {
    winston, nodemailer,
} from './importer';

import smtpTransport = require('nodemailer-smtp-transport');

export const newLine = '<br/>';

export type LogLevel = 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error';

export interface EmailErrorsConfig {
    active: boolean;
    nodemailer: {
        smtps: smtpTransport.SmtpOptions;
        from: (msg: string, meta: string[]) => Promise<string>;
        to: (msg: string, meta: string[]) => Promise<string>;
        subject: (msg: string, meta: string[]) => Promise<string>;
        html: (msg: string, meta: string[]) => Promise<string>;
    };
}

export interface BillonChildLoggerMethods {
    start: () => void;
    end: () => void;
    raw: (msg: string, ...meta: any[]) => void;
    critical: (msg: string, ...meta: any[]) => Promise<void | nodemailer.SentMessageInfo>;
    child: (childLabel: string, config?: BillonLoggerConfig) => BillonChildLogger;
}

export interface BillonChildLogger extends BillonChildLoggerMethods, winston.LoggerInstance { }

export interface DailyRotateFileTransportOptions extends winston.DailyRotateFileTransportOptions {
    prepend?: boolean;
}

export interface BillonLoggerConfig {
    level: LogLevel;
    winston: {
        console: winston.ConsoleTransportOptions;
        dailyRotateFile: DailyRotateFileTransportOptions;
        exceptions: DailyRotateFileTransportOptions;
    };
    emailErrors?: EmailErrorsConfig;
}
