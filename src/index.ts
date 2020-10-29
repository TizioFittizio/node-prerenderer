import { LogLevel } from './config/Enums';
import { Server } from './models/Server';
import { IOC } from './services/IOC';
import { Constants } from './config/Constants';

class Main {

    public async main(){
        try {
            await this.initServices();
            await this.startServer();
        }
        catch (e){
            IOC.instance.logService.log('Main', LogLevel.FATAL, e.message);
            console.error(e);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            process.exit(1);
        }
    }

    private async initServices(){
        const { cacheService, webScraperService, configService } = IOC.instance;
        configService.loadConfiguration();
        await cacheService.init();
        await webScraperService.init();
        await cacheService.deleteAll();
    }

    private async startServer(){
        const { configService } = IOC.instance;
        const server = new Server(configService.getNumberOrThrow(Constants.CONFIG_KEY_PORT));
        await server.start();
    }

}

new Main().main().catch(e => console.error(e));