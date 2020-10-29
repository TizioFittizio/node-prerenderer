export interface CacheServiceSetOptions {
    sessionid: string;
}

export interface CacheServiceGetOptions {
    shouldBeRenewAfterMillis?: number;
    sessionid: string;
}

export interface CacheService {
    init(): Promise<void>;
    set(key: string, value: string, options: CacheServiceSetOptions): Promise<void>;
    get(key: string, options: CacheServiceGetOptions): Promise<{ value: string, shouldBeRenewed: boolean } | null>;
    delete(key: string): Promise<void>;
    deleteAll(): Promise<void>;
}