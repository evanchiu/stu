'use strict';

const aws = require('aws-sdk');
const doc = new aws.DynamoDB.DocumentClient();

const crypto = require('crypto');
const fs = require('fs');

// Map of routes to functions
var routes = {
  '/': index,
  '/create': create
};

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

// Create a new teeny url
function create(event, context, callback) {
  var json;
  if (!event.body) {
    return done(400, '{"error": "Missing body"}', 'application/json', callback);
  }
  try {
    json = JSON.parse(event.body);
  } catch (e) {
    return done(400, '{"error": "Invalid JSON body"}', 'application/json', callback);
  }

  shortSave(json.longUrl, function(err, data) {
    if (err) {
      return done(500, '{"error": "Internal Server Error"}', 'application/json', callback);
    } else {
      return done(200, data.toString(), 'application/json', callback);
    }
  });
}

// Generate the short path for the given url and store it in the database
function shortSave(longUrl, callback) {
  var shortUrl = shorten(longUrl);
  var params = {
    TableName: process.env.URL_TABLE,
    Item: {
      shortUrl: shortUrl,
      longUrl: longUrl
    }
  };

  doc.put(params, function(err, data) {
    if (err) {
      console.error('DyanmoDB error on save: ', err);
      return callback(err);
    } else {
      return callback(null, JSON.stringify({shortUrl: shortUrl}));
    }
  });
}

// For this demo, we're just going to use the first 7 base-64 encoded characters of the sha256 hash
// This gives us about 4 trillion possibilities
function shorten(url) {
  var hash = crypto.createHash('sha256');
  hash.update(url);
  return hash.digest('base64').substring(0, 7);
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
