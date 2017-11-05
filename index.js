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
    redirect(event, context, callback);
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

// Try to load the long url and redirect, otherwise 404
function redirect(event, context, callback) {
  // shortKey is the first url segment e.g. 'abc' in '/abc' or '/abc/def'
  var shortKey = event.path.substring(1, event.path.indexOf('/', 1));
  loadLong(shortKey, function(err, longUrl) {
    if (err) {
      return done(404, '{"status": "Not Found"}', 'application/json', callback);
    } else {
      return callback(null, {
        statusCode: 302,
        body: JSON.stringify({location: longUrl}),
        headers: {
          'Content-Type': 'application/json',
          'Location': longUrl
        }
      });
    }
  });
}

// Generate the short path for the given url and store it in the database
function shortSave(longUrl, callback) {
  var shortKey = shorten(longUrl);
  var params = {
    TableName: process.env.URL_TABLE,
    Item: {
      id: shortKey,
      longUrl: longUrl
    }
  };

  doc.put(params, function(err, data) {
    if (err) {
      console.error('DyanmoDB error on save: ', err);
      return callback(err);
    } else {
      return callback(null, JSON.stringify({shortKey: shortKey}));
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

// Load the long url from the database
function loadLong(shortKey, callback) {
  var params = {
    TableName: process.env.URL_TABLE,
    Key: {
      id: shortKey
    }
  };

  doc.get(params, function(err, data) {
    if (err) {
      console.log('DynamoDB error on load: ', err);
      return callback(err);
    } else {
      return callback(null, data.longUrl);
    }
  });
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
