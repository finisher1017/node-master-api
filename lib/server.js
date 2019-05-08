/*
 * Server-related tasks
 *
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const _data = require('./data');
const handlers = require('./handlers');
const helpers = require('./helpers');
var path = require('path');
const util = require('util');
const debug = util.debuglog('server');

// Instantiate the server module object
let server = {};

// helpers.sendTwilioSms('6123800479','Hello', (err) => {
//     debug('this was the error',err);
// });


// Instantiating the HTTP server
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});


// Instantiate the HTTPS sever
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, (req,res) => {
    server.unifiedServer(req, res);
});


// All the logic for the http and https server
server.unifiedServer = (req, res) => {
    // Get the URL and parse it
    let parsedUrl = url.parse(req.url,true);
    // Get the path from the URL
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g,'');
    // Get the query string as an object
    let queryStringObject = parsedUrl.query;
    // Get the http Method
    let method = req.method.toLowerCase();
    // Get the headers as an object
    let headers = req.headers;
    // Get the payload , if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();
        // Choose the handler this request should go to
        // If one is not found, use the notFound handler
        let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;
        

        // Construct the data object to send to the handler
        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)

        }

        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            // Use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string
            let payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            
            // If the response is 200 print green, otherwise print red
            if(statusCode === 200) {
                debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
            } else {
                debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
            }
            
        });
    });  
};


// Define a request router
server.router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
};


// Init script
server.init = () => {
    // Start the HTTP server
    server.httpServer.listen(config.httpPort,() => {
        // console.log("The server is listening on port", config.httpPort);
        console.log('\x1b[36m%s\x1b[0m',"The server is listening on port "+config.httpPort);
    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort,() => {
        // console.log("The server is listening on port", config.httpsPort);
        console.log('\x1b[35m%s\x1b[0m',"The server is listening on port "+config.httpsPort);
    });

};

module.exports = server;