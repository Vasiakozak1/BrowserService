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
            callback(null, {success: true});
        } 
        catch (error) 
        {
            callback(error, {success: false});
        }
    },
    refreshPage: async (call, callback) => {
        try{
            let browserGuid = call.request.browserGuid;
            await browserService.RefreshPageAsync(browserGuid);
            callback(null, {success: true});
        }
        catch(error){
            callback(error, {success: false});
        }
    },
    getCurrentUrl: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
            let url = await browserService.GetCurrentUrlAsync(browserGuid);
            callback(null, {url});
        } catch (error) {
            callback(error, {url: null});
        }
        callback(null, null);
    },
    injectJs: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
        let jsCode = call.request.jsCode;
        await browserService.InjectJSCodeAsync(browserGuid, jsCode);
        callback(null, {success: true});
        } catch (error) {
            callback(error, {success: false});
        }
    },
    injectJsWithResult: async (call, callback) => {
        try {
            let browserGuid = call.request.browserGuid;
        let jsCode = call.request.jsCode;
        let result = await browserService.InjectJSCodeWithResultAsync(browserGuid, jsCode);
        callback(null, {success: true, result});
        } catch (error) {
            console.log(error);
            callback(error, {success: false, result: null});
        }
    }
});

server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure());
server.start();