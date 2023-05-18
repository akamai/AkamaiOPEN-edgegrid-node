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

const axios = require('axios'),
    auth = require('./auth'),
    edgerc = require('./edgerc'),
    helpers = require('./helpers'),
    logger = require('./logger');

const EdgeGrid = function (client_token, client_secret, access_token, host, debug) {
    // accepting an object containing a path to .edgerc and a config section
    if (typeof arguments[0] === 'object') {
        let edgercPath = arguments[0];
        this._setConfigFromObj(edgercPath);
    } else {
        this._setConfigFromStrings(client_token, client_secret, access_token, host);
    }
    if (process.env.EG_VERBOSE || debug || (typeof arguments[0] === 'object' && arguments[0].debug)) {
        axios.interceptors.request.use(request => {
            console.log('Starting Request', request);
            return request;
        });
        axios.interceptors.response.use(response => {
            console.log('Response:', response);
            return response;
        });
    }
};

/**
 * Builds the request using the properties of the local config Object.
 *
 * @param  {Object} req The request Object. Can optionally contain a
 *                      'headersToSign' property: An ordered list header names
 *                      that will be included in the signature. This will be
 *                      provided by specific APIs.
 * @return EdgeGrid object (self)
 */
EdgeGrid.prototype.auth = function (req) {
    req = helpers.extend(req, {
        baseURL: this.config.host,
        url: req.path,
        method: 'GET',
        headers: {},
        maxRedirects: 0
    });

    req.headers = helpers.extendHeaders(req.headers);

    let isTarball = req.body instanceof Uint8Array &&
        (req.headers['Content-Type'] === 'application/gzip' || req.headers['Content-Type'] === 'application/tar+gzip');

    // Convert body object to properly formatted string
    if (req.body) {
        if (typeof (req.body) == 'object' && !isTarball) {
            req.body = JSON.stringify(req.body);
        }
    }
    // this assignment is done in order to assert backwards compatibility of this library - a `body` field is accepted in this library, whereas axios expects the request body to be in `data` field
    req.data = req.body;

    this.request = auth.generateAuth(
        req,
        this.config.client_token,
        this.config.client_secret,
        this.config.access_token,
        this.config.host
    );
    if (req.headers['Accept'] === 'application/gzip' || req.headers['Accept'] === 'application/tar+gzip') {
        this.request["responseType"] = 'arraybuffer';
    }
    return this;
};

/**
 * Sends the request and invokes the callback function.
 *
 * @param  {Function} callback The callback function.
 * @return EdgeGrid object (self)
 */
EdgeGrid.prototype.send = function (callback) {
    axios(this.request).then(response => {
        callback(null, response, JSON.stringify(response.data));
    }).catch(error => {
        // handling redirects has to be handled in catch (with maxRedirects set to 0) because axios does not allow modifying headers between redirects
        if (error.response && helpers.isRedirect(error.response.status)) {
            this._handleRedirect(error.response, callback);
            return;
        }
        callback(error);
    });

    return this;
};

EdgeGrid.prototype._handleRedirect = function (resp, callback) {
    const parsedUrl = new URL(resp.headers['location']);

    resp.headers['authorization'] = undefined;
    this.request.url = undefined;
    this.request.path = parsedUrl.pathname + parsedUrl.search;

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
EdgeGrid.prototype._setConfigFromStrings = function (client_token, client_secret, access_token, host) {
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
    const expected = [
        'client_token', 'client_secret', 'access_token', 'host'
    ];
    let valid = true;

    expected.forEach(function (arg, i) {
        if (!args[i]) {
            logger.error('No defined ' + arg);
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
EdgeGrid.prototype._setConfigFromObj = function (obj) {
    this.config = edgerc(obj.path, obj.section);
};

module.exports = EdgeGrid;
