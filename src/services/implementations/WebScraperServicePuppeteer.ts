import { LogLevel } from './../../config/Enums';
import { NotInitializedError, InvalidOperationError } from './../../config/Errors';
import { LogService } from './../interfaces/LogService';
import { WebScraperService } from '../interfaces/WebScraperService';
import { Browser, Page } from 'puppeteer';
import * as Puppeteer from 'puppeteer';
import { Constants } from '../../config/Constants';

export class WebScraperServicePuppeteer implements WebScraperService {

    private static readonly PUPPETEER_ARGUMENTS = [
        '--disable-cloud-import',
        '--disable-gesture-typing',
        '--disable-infobars',
        '--disable-notifications',
        '--disable-offer-store-unmasked-wallet-cards',
        '--disable-offer-upload-credit-cards',
        '--disable-print-preview',
        '--disable-speech-api',
        '--disable-tab-for-desktop-share',
        '--disable-translate',
        '--disable-voice-input',
        '--disable-wake-on-wifi',
        '--enable-async-dns',
        '--enable-simple-cache-backend',
        '--enable-tcp-fast-open',
        '--enable-webgl',
        '--hide-scrollbars',
        '--ignore-gpu-blacklist',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-pings',
        '--no-zygote',
        '--prerender-from-omnibox=disabled',
        '--use-gl=swiftshader',
        '--no-sandbox',
        '--disable-web-security',
        '--font-render-hinting=none',
        '--enable-font-antialiasing',
        '--single-process',
        '--memory-pressure-off',
        '--disable-dev-shm-usage'
    ];

    private browser: Browser | null;

    private readonly fetchingPages: string[];

    private readonly logService: LogService;

    public constructor(logService: LogService){
        this.browser = null;
        this.logService = logService;
        this.fetchingPages = [];
    }

    public async init(): Promise<void> {
        try {
            this.browser = await Puppeteer.launch({
                executablePath: process.env.CHROMIUM_PATH,
                args: WebScraperServicePuppeteer.PUPPETEER_ARGUMENTS,
                headless: true
            });
            this.browser.on('disconnected', (e, args) => {
                this.logService.log('WebScraperServicePuppeteer', LogLevel.ERROR, 'Disconnected');
                this.init().catch(e => {
                    this.logService.log(
                        'WebScraperServicePuppeteer',
                        LogLevel.ERROR,
                        `Can't start web scraper: ${e.message}`
                    );
                });
            });
        }
        catch (e){
            this.logService.log('WebScraperServicePuppeteer', LogLevel.ERROR, `Can't start web scraper: ${e.message}`);
        }
    }

    public async fetchPage(url: string): Promise<string> {
        if (this.fetchingPages.includes(url)){
            throw new InvalidOperationError(`Already fetching ${url}`);
        }
        let page = null;
        try {
            this.fetchingPages.push(url);
            this.ensureInitialization();
            this.logService.log('WebScraperServicePuppeteer', LogLevel.INFO, `Fetching ${url}`);
            page = await this.getNewPage();
            await this.setPageRequestInterception(page);
            await page.goto(this.addPrerenderingQueryParamToUrl(url), { timeout: 10000 });
            await page.waitFor(1000);
            await page.setJavaScriptEnabled(false);
            await page.evaluate(this.evaluateDataSelectors);
            const contentPage = await page.content();
            await page.close();
            this.fetchingPages.splice(this.fetchingPages.indexOf(url), 1);
            return contentPage;
        }
        catch (e){
            this.fetchingPages.splice(this.fetchingPages.indexOf(url), 1);
            if (page) await page.close();
            throw e;
        }
    }

    private ensureInitialization(){
        if (!this.browser){
            throw new NotInitializedError('WebScraperServicePuppeteer');
        }
    }

    private async getNewPage(){
        const page = await this.browser!.newPage();
        await page.setCacheEnabled(false);
        await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
        return page;
    }

    private async setPageRequestInterception(page: Page){
        await page.setRequestInterception(true);
        page.on('request', async request => {
            const whitelist = ['document', 'script', 'xhr', 'fetch'];
            if (!whitelist.includes(request.resourceType())) return request.abort();
            if (!request.isNavigationRequest()) return request.continue();
            const headers = request.headers();
            headers[Constants.HEADER_PRERENDERER] = '1';
            return request.continue({ headers });
        });
    }

    private addPrerenderingQueryParamToUrl(url: string){
        const queryParam = 'prerendering=true';
        if (url.includes('?')){
            const lastCharUrl = url[url.length - 1];
            if (lastCharUrl === '?' || lastCharUrl === '&') return `${url}${queryParam}`;
            else return `${url}&${queryParam}`;
        }
        else return `${url}?${queryParam}`;
    }

    // Assuming browser scope here
    private evaluateDataSelectors(){
        const elementsToRemove = document.querySelectorAll('[data-prerendering=disabled]');
        elementsToRemove.forEach(element => element.remove());
        const elementsToClearWithJS = document.querySelectorAll('[data-prerendering=clear-with-js]');
        elementsToClearWithJS.forEach(element => {
            const elementId = element.id;
            const elementWithOpacity = element as unknown as { style: { opacity: number } };
            elementWithOpacity.style.opacity = 0;
            const scriptElement = document.createElement('script');
            scriptElement.innerHTML = `// Prerenderer clearing with js enabled
document.getElementById('${elementId}').innerHTML = '';
document.getElementById('${elementId}').style.opacity = 1;`;
            element.after(scriptElement);
        });
    }

}