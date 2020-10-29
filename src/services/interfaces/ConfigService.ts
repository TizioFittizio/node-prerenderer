export interface ConfigService {
    loadConfiguration(): void;
    getString(configKey: string): string | null;
    getStringOrThrow(configKey: string): string;
    getNumber(configKey: string): number | null;
    getNumberOrThrow(configKey: string): number;
    getBoolean(configKey: string): boolean | null;
    getBooleanOrThrow(configKey: string): boolean;
}