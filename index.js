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
  var shortKey = getShortKey(event.path);
  loadLong(shortKey, function(err, longUrl) {
    if (err) {
      return done(404, '{"status": "Not Found"}', 'application/json', callback);
    } else {
      console.log('Redirecting short key ' + shortKey + ' to ' + longUrl);
      return callback(null, {
        statusCode: 302,
        body: '',
        headers: {
          'Location': longUrl
        }
      });
    }
  });
}

// shortKey is the first url segment e.g. 'abc' in '/abc' or '/abc/def'
function getShortKey(path) {
  var shortKey = path.substring(1);
  var slashIndex = shortKey.indexOf('/');
  if (slashIndex > 0) {
    shortKey = shortKey.substring(0, slashIndex);
  }
  return shortKey;
}

// Generate the short path for the given url and store it in the database
function shortSave(longUrl, callback, keyHash = '', length = 2) {
  // hash the url if necessary
  if (!keyHash) {
    keyHash = hash(longUrl);
  }

  // calculate the shortKey based on the received length
  var shortKey = keyHash.substring(0, length);

  // Store the mapping of shortKey to longUrl, only if the shortKey is new
  // or this data is already stored
  var params = {
    TableName: process.env.URL_TABLE,
    Item: {
      id: shortKey,
      longUrl: longUrl
    },
    ConditionExpression: 'attribute_not_exists(id) or longUrl = :url',
    ExpressionAttributeValues: {
      ':url': longUrl
    }
  };
  doc.put(params, function(err, data) {
    if (err) {
      if (err.code === 'ConditionalCheckFailedException') {
        // Key collision, try again with a longer shortKey
        if (length < keyHash.length) {
          shortSave(longUrl, callback, keyHash, length + 1);
        } else {
          console.error('Key collision, but cannot make key longer: ', err);
          return callback(err);
        }
      } else {
        console.error('DyanmoDB error on save: ', err);
        return callback(err);
      }
    } else {
      // Key saved: return success
      return callback(null, JSON.stringify({shortKey: shortKey}));
    }
  });
}

// Sha256 the given url
function hash(url) {
  var sha = crypto.createHash('sha256');
  sha.update(url);
  return sha.digest('base64');
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
      console.log('Got data: ', data);
      return callback(null, data.Item.longUrl);
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
