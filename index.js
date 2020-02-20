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
        let browserGuid = call.request.browserGuid;
        let redirectUrl = call.request.url;
        await browserService.RedirectToAsync(browserGuid, redirectUrl);
        callback(null, {success: true});
    },
    refreshPage: (call, callback) => {
        callback(null, null);
    },
    getCurrentUrl: (call, callback) => {
        console.log(call);
        callback(null, null);
    },
    injectJs: async (call, callback) => {
        let browserGuid = call.request.browserGuid;
        let jsCode = call.request.jsCode;
        await browserService.InjectJSCodeAsync(browserGuid, jsCode);
        callback(null, {success: true});
    },
    injectJsWithResult: async (call, callback) => {
        let browserGuid = call.request.browserGuid;
        let jsCode = call.request.jsCode;
        let result = await browserService.InjectJSCodeWithResultAsync(browserGuid, jsCode);
        callback(null, {success: true, result});
    }
});

server.bind('127.0.0.1:50051', grpc.ServerCredentials.createInsecure());
server.start();