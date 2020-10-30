import { LogLevel } from './../../config/Enums';
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CacheService, CacheServiceSetOptions, CacheServiceGetOptions } from '../interfaces/CacheService';
import * as fs from 'fs';
import { ConfigService } from '../interfaces/ConfigService';
import { LogService } from '../interfaces/LogService';
import { Constants } from '../../config/Constants';
import { NotInitializedError } from '../../config/Errors';

export class CacheServiceFile implements CacheService {

    private static readonly ENCODING_SEPARATOR = '|||';

    // TODO it can hold in memory list of files

    private readonly logService: LogService;

    private readonly configService: ConfigService;

    private filePath: string | null;

    public constructor(logService: LogService, configService: ConfigService){
        this.logService = logService;
        this.configService = configService;
        this.filePath = null;
    }

    public async init(){
        this.filePath =
            this.configService.getString(Constants.CONFIG_KEY_CACHE_FILE_PATH) ??
            Constants.DEFAULT_CACHE_FOLDER_PATH;
        const doesPathExists = await this.doesPathExists(this.filePath);
        if (!doesPathExists){
            await this.createFolder(this.filePath);
            this.logService.log('CacheServiceFile', LogLevel.INFO, `Created folder ${this.filePath}`);
        }
    }

    public async set<T>(key: string, value: T, options: CacheServiceSetOptions){
        this.ensureInitialization();
        const files = (await this.getFilesInFolder(this.filePath!))
            .map(x => ({ filename: x, ...this.computeKeyAndInfoWithFilename(x) }))
            .filter(x => x.key === key && x.sessionid === options.sessionid);
        const filename = this.computeFilenameWithKey(key, { sessionid: options.sessionid });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await this.saveFile(`${this.filePath}/${filename}`, value as any as string);
        this.logService.log('CacheServiceFile', LogLevel.INFO, `Saved ${filename}`);
        for (const file of files){
            await this.deleteFile(`${this.filePath}/${file.filename}`);
            this.logService.log('CacheServiceFile', LogLevel.INFO, `Removed old ${file.filename}`);
        }
    }

    public async get(key: string, options: CacheServiceGetOptions){
        this.ensureInitialization();
        const files = (await this.getFilesInFolder(this.filePath!))
            .map(x => ({ filename: x, ...this.computeKeyAndInfoWithFilename(x) }))
            .filter(x => x.key === key && x.sessionid === options.sessionid)
            .sort((a, b) => a.date > b.date ? 1 : -1);
        if (files.length === 0) return null;
        const mostRecentFileContent = await this.readFile(`${this.filePath}/${files[0].filename}`);
        return {
            value: mostRecentFileContent,
            shouldBeRenewed: options?.shouldBeRenewAfterMillis
                ? new Date().getTime() - files[0].date.getTime() > options.shouldBeRenewAfterMillis
                : false
        };
    }

    public async delete(key: string){
        this.ensureInitialization();
        throw new Error('Not implemented');
    }

    public async deleteAll(){
        this.ensureInitialization();
        const files = await this.getFilesInFolder(this.filePath!);
        for (const file of files){
            const path = `${this.filePath}/${file}`;
            await this.deleteFile(path);
        }
        this.logService.log('CacheServiceFile', LogLevel.INFO, 'Cleared cache folder');
    }

    private ensureInitialization(){
        if (!this.filePath){
            throw new NotInitializedError('CacheServiceFile not initialized');
        }
    }

    private doesPathExists(path: string){
        return new Promise<boolean>((resolve, reject) => {
            fs.exists(path, exists => resolve(exists));
        });
    }

    private createFolder(path: string){
        return new Promise((resolve, reject) => {
            fs.mkdir(path, err => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    private readFile(path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(path, (err, data) => {
                if (err) reject(err);
                else resolve(data.toString('utf8'));
            });
        });
    }

    private saveFile(path: string, content: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, content, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    private deleteFile(path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.unlink(path, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    private getFilesInFolder(folder: string){
        return new Promise<string[]>((resolve, reject) => {
            fs.readdir(folder, (err, files) => {
                if (err) reject(err);
                resolve(files);
            });
        });
    }

    private computeFilenameWithKey(key: string, options: { sessionid: string }){
        const separator = CacheServiceFile.ENCODING_SEPARATOR;
        return Buffer
            .from(`${key}${separator}${new Date().toISOString()}${separator}${options.sessionid}`)
            .toString('base64');
    }

    private computeKeyAndInfoWithFilename(filename: string){
        const [ key, date, sessionid ] = Buffer
            .from(filename, 'base64')
            .toString('utf8')
            .split(CacheServiceFile.ENCODING_SEPARATOR);
        return { key, date: new Date(date), sessionid };
    }

}