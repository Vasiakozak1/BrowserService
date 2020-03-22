
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
        console.log("extension path:" + pathToExtension);
        let browser = await puppeteer.launch({
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

    async CloseBrowserAsync(browserGuid) {
        let browser = this.Browsers.get(browserGuid);
        await browser.close();
        this.Browsers.delete(browserGuid);
    }

    async RedirectToAsync(browserGuid, url) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);

        await this.waitIfPageLoads(page);

        page.needsWaitForNavigation = true;
        await page.goto(url, {waitUntil: ["domcontentloaded"]}),
        page.needsWaitForNavigation = false;
    }

    async InjectJSCodeAsync(browserGuid, jsCode) {

        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);

        await this.waitIfPageLoads(page);

        await page.evaluateHandle(jsCode);
    }

    async InjectJSCodeWithResultAsync(browserGuid, jsCode) {
        try {
            let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);
        
        await this.waitIfPageLoads(page);

       // let resultHandle = await page.evaluateHandle(jsCode);
        let resultHandle = await page.evaluate(jsCode);
        // console.log('run js:' + jsCode);
        // console.log('resultHandle:');
        // console.log(resultHandle);
        let result;
        if(resultHandle.jsonValue) {
            result = await resultHandle.jsonValue();
        }
        else {
            result = resultHandle.toString();
        }
        // console.log('result');
        // console.log(result);
        return result;
        } catch (error) {
            console.log('error in InjectJSCodeWithResultAsync:' + jsCode);
            console.log(error);
            throw error;
        }
    }

    async PressButton(browserGuid, button) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);
        
        await this.waitIfPageLoads(page);

        await page.keyboard.press(button);
    }

    async UserClickOnElement(browserGuid, elementSelector) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);
        
        await this.waitIfPageLoads(page);
        
        await page.click(elementSelector, {delay: 90});
    }
    async UserTypeToInput(browserGuid, inputSelector, text) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);

        await this.waitIfPageLoads(page);

        await page.type(inputSelector, text, {delay: 90});
    }
    async UserHoverOnElement(browserGuid, elementSelector) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);
        
        await this.waitIfPageLoads(page);

        await page.hover(elementSelector);
    }

    async UserMouseMove(browserGuid, x, y) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);
        let randomSteps = this.getRandomInt(25);
        
        await this.waitIfPageLoads(page);

        await page.mouse.move(x, y, { steps: randomSteps});
    }

    async DocumentNodeExists(browserGuid, jsCode) {
        try {
            let browser = this.Browsers.get(browserGuid);
            let page = await this.GetActiveBrowserPageAsync(browser);

            await this.waitIfPageLoads(page);

            let elementExists = await page.evaluate(jsCode + " != null");
            console.log(elementExists)
            return elementExists;
        }
        catch(error) {
            console.log(error);
            throw error;
        }
    }

    async SendKeysToPage(browserGuid, keys) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);

        await this.waitIfPageLoads(page);

        await page.keyboard.type(keys, {delay: 100});
       // await page.type(elementSelector, keys, {delay: 200});
    }

    async RefreshPageAsync(browserGuid) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);
        
        await this.waitIfPageLoads(page);

        page.needsWaitForNavigation = true;
        await page.reload({waitUntil: ['domcontentloaded']});
        page.needsWaitForNavigation = false;
    }

    async GetCurrentUrlAsync(browserGuid) {
        let browser = this.Browsers.get(browserGuid);
        let page = await this.GetActiveBrowserPageAsync(browser);
        
        await this.waitIfPageLoads(page);

        return page.url();
    }

    async waitIfPageLoads(page) {
        if(page.needsWaitForNavigation) {
            let retryTimes = 0;
            while(page.needsWaitForNavigation && retryTimes < 5) {
                await this.delay(5000);
                retryTimes++;
            }
         }
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
      }

    generateBrowserGuid(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
    }

    delay(milliseconds) { 
        return new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, milliseconds);
        });
      }
    
}