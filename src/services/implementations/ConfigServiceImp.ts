import { ConfigService } from '../interfaces/ConfigService';
import { Constants } from '../../config/Constants';
import { NotInitializedError } from '../../config/Errors';

export class ConfigServiceImp implements ConfigService {

    public loadConfiguration(): void {
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const file = require(Constants.CONFIG_FILE_PATH);
            Object.keys(file).forEach(key => process.env[key] = file[key]);
        }
        catch (e){
            // Assuming environment variables already loaded
        }
    }

    public getString(configKey: string): string | null {
        const value = process.env[configKey];
        return value ?? null;
    }

    public getStringOrThrow(configKey: string): string {
        const string = this.getString(configKey);
        if (!string) throw new NotInitializedError(`${configKey} not set`);
        return string;
    }

    public getNumber(configKey: string): number | null {
        const value = process.env[configKey];
        if (value !== '0' && !value) return null;
        const parsedValue = Number(value);
        if (isNaN(parsedValue)) throw new Error(`Can't parse to number ${value}`);
        return parsedValue;
    }

    public getNumberOrThrow(configKey: string): number {
        const number = this.getNumber(configKey);
        if (!number) throw new NotInitializedError(`${configKey} not set`);
        return number;
    }

    public getBoolean(configKey: string): boolean | null {
        const value = process.env[configKey];
        if (value !== 'false' && !value) return null;
        if (value !== 'false' && value !== 'true') throw new Error(`Can't parse to boolean ${value}`);
        return value === 'true';
    }

    public getBooleanOrThrow(configKey: string): boolean {
        const boolean = this.getBoolean(configKey);
        if (!boolean) throw new NotInitializedError(`${configKey} not set`);
        return boolean;
    }

}