import { LogLevel } from '../../config/Enums';
import { LogService } from '../interfaces/LogService';

export class LogServiceImp implements LogService {

    private static readonly LOG_LEVEL_CHAR_MAP = {
        [LogLevel.DEBUG]: 'D',
        [LogLevel.INFO]: 'I',
        [LogLevel.WARN]: 'W',
        [LogLevel.ERROR]: 'E',
        [LogLevel.FATAL]: 'F'
    };

    public log(callerName: string, logLevel: LogLevel, message: string){
        const logLevelChar = LogServiceImp.LOG_LEVEL_CHAR_MAP[logLevel];
        const logMessage = `${new Date().toISOString()} [${logLevelChar}] ${callerName} - ${message}`;
        if (logLevel <= LogLevel.INFO) console.log(logMessage);
        else if (logLevel <= LogLevel.WARN) console.warn(logMessage);
        else console.error(logMessage);
    }

}