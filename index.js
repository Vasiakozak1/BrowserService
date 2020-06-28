const grpc = require('grpc')
const chromiumServiceProto = grpc.load('chromiumManipulatorService.proto');
const BrowserService = require('./BrowserService');
const browserService = new BrowserService();
const server = new grpc.Server();

server.addService(chromiumServiceProto.ChromiumManipulatorService.service, {
    startChromiumSession: async (call, callback) => {
        let guid = await browserService.CreateNewAsync(call.request.extensionPath);
        callback(null, {browserSessionGuid: guid});
    },
    startChromiumSessionWithoutProxy: async (call, callback) => {
        let guid = await browserService.CreateNewWithoutProxyAsync();
        callback(null, {browserSessionGuid: guid});
    },
    startChromiumSessionWithoutMultipleExtensions: async (call, callback) => {
        let guid = await browserService.CreateNewWithMultipleExtensionsAsync(call.request.extensionsPathes);
        callback(null, {browserSessionGuid: guid});
    },
    endChromiumSession: async (call, callback) => {
        await browserService.CloseBrowserAsync(call.request.browserSessionGuid);        
        callback(null, {success: true});
    },
    redirectTo: async (call, callback) => {
        try 
        {
            let browserGuid = call.request.browserGuid;
            let redirectUrl = call.request.url;
            await browserService.RedirectToAsync(browserGuid, redirectUrl);
            console.log('redirected to:' + redirectUrl);
            callback(null, {success: true});
        } 
        catch (error) 
        {
            console.log('redirectTo error:');
            console.log(error);
            callback(error, {success: false});
        }
    },
    refreshPage: async (call, callback) => {
        try{
            let browserGuid = call.request.browserGuid;
            await browserService.RefreshPageAsync(browserGuid);
            console.log('refreshed page');
            callback(null, {success: true});
        }
        catch(error){
            console.log('refreshPage error');
            console.log(error);
            callback(error, {success: false});
        }
    },
    getCurrentUrl: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
            let url = await browserService.GetCurrentUrlAsync(browserGuid);
            console.log('current url:');
            console.log(url);
            callback(null, {url});
        } catch (error) {
            console.log('get current url error');
            console.log(error);
            callback(error, {url: null});
        }
    },
    injectJs: async (call, callback) => {
        let jsCode;
        try {
            let browserGuid = call.request.browserGuid;
        jsCode = call.request.jsCode;
        await browserService.InjectJSCodeAsync(browserGuid, jsCode);
        console.log('inject:' + jsCode);
        callback(null, {success: true});
        } catch (error) {
            console.log('inject js:' + jsCode + " error");
            console.log(error);
            callback(error, {success: false});
        }
    },
    injectJsWithResult: async (call, callback) => {
        let jsCode;
        try {
            let browserGuid = call.request.browserGuid;
        jsCode = call.request.jsCode;
        let result = await browserService.InjectJSCodeWithResultAsync(browserGuid, jsCode);
        console.log('inject:' + jsCode + " result:" + result);

        callback(null, {success: true, result});
        } catch (error) {
            console.log('inject js:' + jsCode + " error");
            console.log(error);
            callback(error, {success: false, result: null});
        }
    },
    pressButton: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
            let button = call.request.button;
            await browserService.PressButton(browserGuid, button);
            console.log('bressed button: ' + button);
            callback(null, {success: true});
        }
        catch(error) {
            console.log('pressButton error');
            console.log(error);
            callback(error, {success: false});
        }
    },
    setButtonDown: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
            let button = call.request.button;
            await browserService.SetButtonDown(browserGuid, button);
            console.log('set button down: ' + button);
            callback(null, {success: true});

        } catch (error) {
            console.log('setButtonDown error');
            console.log(error);
            callback(error, {success: false});
        }
    },
    setButtonUp: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
            let button = call.request.button;
            await browserService.SetButtonUp(browserGuid, button);
            console.log('set button up: ' + button);
            callback(null, {success: true});
        } catch (error) {
            console.log('setButtonUp error');
            console.log(error);
            callback(error, {success: false});
        }
    },
    sendKeys: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
            let keys = call.request.keys;
            await browserService.SendKeysToPage(browserGuid, keys);
            console.log('sendKeys: ' + keys);
            callback(null, {success: true});
        } catch (error) {
            callback(error, {success: false});
        }
    },
    userClick: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
            let elementSelector = call.request.elementSelector;
            await browserService.UserClickOnElement(browserGuid, elementSelector);
            console.log('user click: ' + elementSelector);
            callback(null, {success: true});
        } catch (error) {
            console.log('userClick error');
            console.log(error);
            callback(error, {success: false});
        }
    },
    userTypeToInput: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
            let elementSelector = call.request.elementSelector;
            let text = call.request.text;
            await browserService.UserTypeToInput(browserGuid, elementSelector, text);
            callback(null, {success: true});
        } catch (error) {
            callback(error, {success: false});
        }
    },
    userHoverOnElement: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
            let elementSelector = call.request.elementSelector;
            await browserService.UserHoverOnElement(browserGuid, elementSelector);
            callback(null, {success: true});

        } catch (error) {
            callback(error, {success: false});

        }
    },
    userMoveMouse: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
            let x = call.request.x;
            let y = call.request.y;
            await browserService.UserMouseMove(browserGuid, x, y);
            callback(null, {success: true});
        } catch (error) {
            callback(error, {success: false});
        }
    },
    DOMElementExists: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
            let jsCode = call.request.jsCode;
            let nodeExists = await browserService.DocumentNodeExists(browserGuid, jsCode);
            callback(null, {success: nodeExists});
        }
        catch(error) {
            console.log(error);
            callback(error, {success: false});

        }
    },
    waitForSelector: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
            let selector = call.request.elementSelector;
            await browserService.WaitForSelector(browserGuid, selector);
            callback(null, {success: true});
        } catch (error) {
            console.log(error);
            callback(error, {success: false});
        }
    },
    waitForXpath: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
            let xpath = call.request.xpath;
            await browserService.WaitForXpath(browserGuid, xpath);
            callback(null, {success: true});
        } catch (error) {
            console.log(error);
            callback(error, {success: false});
        }
    }
});

server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure());
server.start();