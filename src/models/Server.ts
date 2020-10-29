import { ExpressServer } from 'simple-express-ts';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import { MainController } from '../controllers/MainController';

export class Server {

    private readonly expressServer: ExpressServer;

    public constructor(port: number) {
        this.expressServer = new ExpressServer({
            port,
            controllers: [
                MainController
            ],
            middlewares: [
                helmet(),
                bodyParser.json(),
                bodyParser.urlencoded({ extended: true })
            ]
        });
    }

    public async start(): Promise<void> {
        await this.expressServer.start();
    }

    public async stop(): Promise<void> {
        await this.expressServer.stop();
    }

    public getApp() {
        return this.expressServer.app;
    }

}
