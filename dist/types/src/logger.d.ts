import { BillonLoggerConfig, BillonChildLogger } from './logger.interface';
export declare class BillonLogger {
    config: BillonLoggerConfig;
    private childrenCache;
    constructor();
    child(fileName: string, config?: BillonLoggerConfig): BillonChildLogger;
}
