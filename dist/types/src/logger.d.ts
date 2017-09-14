/// <reference types="winston" />
import { winston } from './importer';
export declare type LogLevel = 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error';
export declare const logger: winston.LoggerInstance;
export interface ShardLogger extends winston.LoggerInstance {
    start: () => void;
    end: () => void;
}
export declare const childLogger: (filePath: string) => ShardLogger;
