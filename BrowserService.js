const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

module.exports = class BrowserService {
    constructor() {
        this.Browsers = new Map();
    }

    async GetActiveBrowserPageAsync(browser) { // There might be better way of getting current tab.
        let pages = await browser.pages();
        return pages[pages.length - 1];
    }

    async CreateNewAsync(pathToExtension) {
        console.log("path:" + pathToExtension);
        let browser = await puppeteer.launch({
            headless: false,
            args: [
                '-noframemerging',
                '--disable-extensions-except=' + pathToExtension,
                '--load-extension=' + pathToExtension,
            ]
        });

        let browserGuid = this.generateBrowserGuid();
        this.Browsers.set(browserGuid, browser);
        return browserGuid;
    }

    async CloseBrowserAsync(browserGuid) {
        let browser = this.Browsers.get(browserGuid);
        await browser.close();
        this.Browsers.delete(browserGuid);
    }

    async RedirectToAsync(browserGuid, url) {
        let browser = this.Browsers.get(browserGuid);
        let currentPage = await this.GetActiveBrowserPageAsync(browser);
        await currentPage.goto(url);
    }

    async InjectJSCodeAsync(browserGuid, jsCode) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);
        await page.evaluateHandle(jsCode);
    }

    async InjectJSCodeWithResultAsync(browserGuid, jsCode) {
        try {
            let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);
        
       // let resultHandle = await page.evaluateHandle(jsCode);
        let resultHandle = await page.evaluate(jsCode);
        console.log(resultHandle);
        let result;
        if(resultHandle.jsonValue) {
            result = await resultHandle.jsonValue();
        }
        else {
            result = resultHandle;
        }
        console.log(result);
        return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async PressButton(browserGuid, button) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);
        await page.keyboard.press(button);
    }

    async DocumentNodeExists(browserGuid, jsCode) {
        try {
            let browser = this.Browsers.get(browserGuid);
            let page = await this.GetActiveBrowserPageAsync(browser);
            let elementExists = await page.evaluate(jsCode + " != null");
            console.log(elementExists)
            return elementExists;
        }
        catch(error) {
            console.log(error);
            throw error;
        }
    }

    async SendKeysToElement(browserGuid, keys) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);
        await page.keyboard.type(keys, {delay: 100});
       // await page.type(elementSelector, keys, {delay: 200});
    }

    async RefreshPageAsync(browserGuid) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);
        await page.reload({waitUntil: ['load', 'domcontentloaded']});
    }

    async GetCurrentUrlAsync(browserGuid) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);
        return page.url();
    }

    generateBrowserGuid(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
    }

    
}