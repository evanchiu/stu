'use strict';
var fs = require('fs');

// Map of routes to functions
var routes = {
  '/': index
}

// Handler provides routing
exports.handler = function(event, context, callback) {
  console.log(event);
  if (routes[event.path]) {
    return routes[event.path](event, context, callback);
  } else {
    return done(404, '{"status": "Not Found"}', 'application/json', callback);
  }
};

// Serve the index page
function index(event, context, callback) {
  var contents = fs.readFileSync("public/index.html");
  done(200, contents.toString(), 'text/html', callback);
}

// We're done with this lambda, return to the client with given parameters
function done(statusCode, body, contentType, callback, isBase64Encoded = false) {
  callback(null, {
    statusCode: statusCode,
    isBase64Encoded: isBase64Encoded,
    body: body,
    headers: {
      'Content-Type': contentType
    }
  });
}
