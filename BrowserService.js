const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

export class BrowserService {
    constructor() {
        this.Browsers = new Map();
    }

    CreateNew(pathToExtension) {
        let browser = puppeteer.launch({
            headless: false,
            args: [
                '-noframemerging',
                '--disable-extensions-except=' + pathToExtension,
                '--load-extension=' + pathToExtension,
            ]
        });

        const page = await browser.newPage();
        let browserGuid = this.generateBrowserGuid();
        this.Browsers.set(browserGuid, browser);

        return browserGuid;
    }

    generateBrowserGuid(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
    }
}