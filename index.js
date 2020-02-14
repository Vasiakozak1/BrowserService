const grpc = require('grpc')
const notesProto = grpc.load('chromiumManipulatorService.proto');
import { BrowserService } from "./BrowserService";

const browserService = new BrowserService();
const server = new grpc.Server(notesProto.ChromiumManipulatorService.service, {
    startChromiumSession: (call, callback) => {
        console.log(call);
        //let newBrowserGuid = browserService.CreateNew()
        callback(null, {browserSessionGuid: 'It seems to be ok'});
    }

});
server.bind('127.0.0.1:5011', grpc.ServerCredentials.createInsecure());
server.start();