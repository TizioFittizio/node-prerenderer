import { CacheServiceFile } from './implementations/CacheServiceFile';
import { ConfigService } from './interfaces/ConfigService';
import { LogService } from './interfaces/LogService';
import { ConfigServiceImp } from './implementations/ConfigServiceImp';
import { LogServiceImp } from './implementations/LogServiceImp';
import { CacheService } from './interfaces/CacheService';
import { WebScraperService } from './interfaces/WebScraperService';
import { WebScraperServicePuppeteer } from './implementations/WebScraperServicePuppeteer';

export class IOC {

    private static _instance: IOC;

    private _configService: ConfigService | null;

    private _logService: LogService | null;

    private _cacheService: CacheService | null;

    private _webScraperService: WebScraperService | null;

    private constructor(){
        this._configService = null;
        this._logService = null;
        this._cacheService = null;
        this._webScraperService = null;
    }

    public static get instance(){
        if (!this._instance) this._instance = new IOC();
        return this._instance;
    }

    public get configService(){
        if (!this._configService) this._configService = new ConfigServiceImp();
        return this._configService;
    }

    public get logService(){
        if (!this._logService) this._logService = new LogServiceImp();
        return this._logService;
    }

    public get cacheService(){
        if (!this._cacheService){
            this._cacheService = new CacheServiceFile(this.logService, this.configService);
        }
        return this._cacheService;
    }

    public get webScraperService(){
        if (!this._webScraperService) this._webScraperService = new WebScraperServicePuppeteer(this.logService);
        return this._webScraperService;
    }

}