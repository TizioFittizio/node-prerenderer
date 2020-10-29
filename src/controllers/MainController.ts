/* eslint-disable complexity */
import { LogLevel } from './../config/Enums';
import { ExpressController, Get } from 'simple-express-ts';
import { Constants } from '../config/Constants';
import { Request, Response } from 'express';
import { sendErrorResponse } from '../helpers/sendErrorResponse';
import { MissingValueError, InvalidValueError } from '../config/Errors';
import { IOC } from '../services/IOC';
import { ConfigService } from '../services/interfaces/ConfigService';
import { LogService } from '../services/interfaces/LogService';
import { CacheService } from '../services/interfaces/CacheService';
import { WebScraperService } from '../services/interfaces/WebScraperService';

@ExpressController(Constants.ROUTE_MAIN_ROUTER_NAME)
export class MainController {

    private readonly configService: ConfigService;

    private readonly logService: LogService;

    private readonly cacheService: CacheService;

    private readonly webScraperService: WebScraperService;

    public constructor(){
        this.configService = IOC.instance.configService;
        this.logService = IOC.instance.logService;
        this.cacheService = IOC.instance.cacheService;
        this.webScraperService = IOC.instance.webScraperService;
    }

    @Get(Constants.ROUTE_MAIN_RENDER)
    private async render(req: Request, res: Response){
        const sessionid = req.query.sessionid?.toString() ?? '0';
        let responseSent = false;
        try {
            const url = this.obtainUrlToRenderFromRequest(req);
            const cacheResult = await this.obtainUrlContentFromCache(url, sessionid);
            if (cacheResult){
                res.send(cacheResult.value);
                responseSent = true;
                this.logService.log('Controller', LogLevel.INFO, `Rendered ${url} ${sessionid} from cache`);
            }
            if (!cacheResult || cacheResult.shouldBeRenewed){
                const pageContent = await this.webScraperService.fetchPage(url);
                if (!cacheResult){
                    res.send(pageContent);
                    responseSent = true;
                    this.logService.log('Controller', LogLevel.INFO, `Rendered ${url} ${sessionid} from web scraper`);
                }
                await this.cacheService.set(url, pageContent, { sessionid });
            }
        }
        catch (e){
            this.logService.log('Controller', LogLevel.ERROR, e);
            if (!responseSent) sendErrorResponse(e, res);
        }
    }

    private obtainUrlToRenderFromRequest(req: Request){
        const { url } = req.query;
        if (!url) throw new MissingValueError('No url query param');
        if (typeof url !== 'string') throw new InvalidValueError('Invalid url query param');
        return url.replace(/\/$/, '');
    }

    private async obtainUrlContentFromCache(url: string, sessionid: string){
        const shouldBeRenewAfterMillis =
            this.configService.getNumber(Constants.CONFIG_KEY_CACHE_RENEW_AFTER_MILLIS)
            ?? Constants.DEFAULT_CACHE_RENEW_AFTER_MILLIS;
        return this.cacheService.get(url, { shouldBeRenewAfterMillis, sessionid });
    }

}