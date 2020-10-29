import { LogLevel } from '../../config/Enums';

export interface LogService {
    log: (callerName: string, logLevel: LogLevel, message: string) => void;
}