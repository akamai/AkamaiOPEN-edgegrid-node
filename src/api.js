// Copyright 2014 Akamai Technologies, Inc. All Rights Reserved
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var helpers = require('./helpers');

var request = require('./myrequest');
var url = require('url');
var auth = require('./auth');
var edgerc = require('./edgerc');
var logger = require('./logger');

var EdgeGrid = function(client_token, client_secret, access_token, host, debug) {
  // accepting an object containing a path to .edgerc and a config section
  request.debug = process.env.EG_VERBOSE || false;
  if (typeof arguments[0] === 'object') {
    request.debug = request.debug || arguments[0].debug ? true : false;
    this._setConfigFromObj(arguments[0]);
  } else {
    request.debug = request.debug || debug ? true : false;
    this._setConfigFromStrings(client_token, client_secret, access_token, host);
  }
};

/**
 * Builds the request using the properties of the local config Object.
 *
 * @param  {Object} req The request Object. Can optionally contain a
 *                      'headersToSign' property: An ordered list header names
 *                      that will be included in the signature. This will be
 *                      provided by specific APIs.
 */
EdgeGrid.prototype.auth = function(req) {
  req = helpers.extend(req, {
    url: this.config.host + req.path,
    method: 'GET',
    headers: {
      'Content-Type': "application/json"
    },
    followRedirect: false,
    body: ''
  });

  // Convert body object to properly formatted string
  if (req.body) {
    if (typeof(req.body) == 'object') {
      req.body = JSON.stringify(req.body);
    }
  }

  this.request = auth.generateAuth(
    req,
    this.config.client_token,
    this.config.client_secret,
    this.config.access_token,
    this.config.host
  );
  return this;
};

EdgeGrid.prototype.send = function(callback) {
  request(this.request, function(error, response, body) { 
    
    if (error) {
      callback(error);
      return;
    }
    if (helpers.isRedirect(response.statusCode)) {
      this._handleRedirect(response, callback);
      return;
    }

    callback(null, response, body);
  }.bind(this));

  return this;
};

EdgeGrid.prototype._handleRedirect = function(resp, callback) {
  var parsedUrl = url.parse(resp.headers['location']);

  resp.headers['authorization'] = undefined;
  this.request.url = undefined;
  this.request.path = parsedUrl.path;

  this.auth(this.request);
  this.send(callback);
};

/**
 * Creates a config object from a set of parameters.
 *
 * @param {String} client_token    The client token
 * @param {String} client_secret   The client secret
 * @param {String} access_token    The access token
 * @param {String} host            The host
 */
EdgeGrid.prototype._setConfigFromStrings = function(client_token, client_secret, access_token, host) {
  if (!validatedArgs([client_token, client_secret, access_token, host])) {
    throw new Error('Insufficient Akamai credentials');
  }

  this.config = {
    client_token: client_token,
    client_secret: client_secret,
    access_token: access_token,
    host: host.indexOf('https://') > -1 ? host : 'https://' + host
  };
};

function validatedArgs(args) {
  var expected = [
      'client_token', 'client_secret', 'access_token', 'host'
    ],
    valid = true;

  expected.forEach(function(arg, i) {
    if (!args[i]) {
      if (process.env.EDGEGRID_ENV !== 'test') {
        logger.error('No defined ' + arg);
      }

      valid = false;
    }
  });

  return valid;
}

/**
 * Creates a config     Object from the section of a defined .edgerc file.
 *
 * @param {Object} obj  An Object containing a path and section property that
 *                      define the .edgerc section to use to create the Object.
 */
EdgeGrid.prototype._setConfigFromObj = function(obj) {
  this.config = edgerc(obj.path, obj.section);
};

module.exports = EdgeGrid;
