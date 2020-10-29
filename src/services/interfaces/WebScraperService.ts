export interface WebScraperService {
    init(): Promise<void>;
    fetchPage(url: string): Promise<string>;
}