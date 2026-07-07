'use strict';

const { request, EnvHttpProxyAgent } = require('undici'),
    auth = require('./auth'),
    edgerc = require('./edgerc'),
    helpers = require('./helpers'),
    { enableLogging, getLogger } = require('./logger');

// Module-level singleton: reads HTTP_PROXY / HTTPS_PROXY env vars and manages connection pooling.
const proxyAgent = new EnvHttpProxyAgent();

/**
 *
 * @param {String} client_token      The client token value from the .edgerc file.
 * @param {String} client_secret     The client secret value from the .edgerc file.
 * @param {String} access_token      The access token value from the .edgerc file.
 * @param {String} host              The host a unique string followed by luna.akamaiapis.net from the .edgerc file.
 * @param {Number} max_body          This value is deprecated.
 * @constructor
 * @deprecated max_body
 */
const EdgeGrid = function (client_token, client_secret, access_token, host, max_body) {
    // accepting an object containing a path to .edgerc and a config section
    if (typeof arguments[0] === 'object') {
        this._setConfigFromObj(arguments[0]);
    } else {
        this._setConfigFromStrings(client_token, client_secret, access_token, host);
    }

    this._dispatcher = proxyAgent;
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
        url: req.path,
        method: 'GET',
        headers: {},
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

    this.request = auth.generateAuth(
        req,
        this.config.client_token,
        this.config.client_secret,
        this.config.access_token,
        this.config.host,
        helpers.MAX_BODY
    );

    if (req.headers['Accept'] === 'application/gzip' || req.headers['Accept'] === 'application/tar+gzip') {
        this.request['responseType'] = 'arraybuffer';
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
    const cb = typeof callback === 'function' ? callback : () => {};
    this._executeRequest(cb).catch(err => cb(err, null, null));
    return this;
};

/**
 * Async implementation of the HTTP dispatch.
 *
 * @param  {Function} callback  Node-style callback(err, response, body).
 * @private
 */
EdgeGrid.prototype._executeRequest = async function (callback) {
    const logger = getLogger();

    logger.debug({ url: this.request.url, method: this.request.method }, 'Starting request');

    // Passing body to undici for these methods causes a RequestContentLengthMismatchError.
    const NO_BODY_METHODS = ['GET', 'HEAD'];
    const response = await request(this.request.url, {
        method: this.request.method,
        headers: this.request.headers,
        body: NO_BODY_METHODS.includes((this.request.method || '').toUpperCase())
            ? null
            : (this.request.body || null),
        maxRedirections: 0,
        // Only pass dispatcher when explicitly set; null/undefined falls back to undici's
        // global dispatcher, allowing callers to opt out of EnvHttpProxyAgent.
        ...(this._dispatcher != null && { dispatcher: this._dispatcher }),
    });

    logger.debug({ statusCode: response.statusCode }, 'Received response');

    if (helpers.isRedirect(response.statusCode)) {
        const rawLocation = response.headers['location'];
        await response.body.dump();

        if (!rawLocation) {
            callback(new Error(`Redirect (${response.statusCode}) received without a Location header`), null, null);
            return;
        }

        const location = Array.isArray(rawLocation) ? rawLocation[0] : rawLocation;
        await this._handleRedirect(location, callback);
        return;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
        const contentType = response.headers['content-type'] || '';
        const isBinaryResponse =
            this.request['responseType'] === 'arraybuffer' ||
            contentType.includes('gzip') ||
            contentType.includes('tar') ||
            contentType.includes('octet-stream');

        let responseBody;
        if (isBinaryResponse) {
            const arrayBuffer = await response.body.arrayBuffer();
            responseBody = Buffer.from(arrayBuffer);
        } else {
            responseBody = await response.body.text();
        }

        callback(null, response, responseBody);
        return;
    }

    await response.body.dump();

    const err = new Error(`Request failed with status code ${response.statusCode}`);
    err.statusCode = response.statusCode;
    err.headers = response.headers;
    err.response = response;
    callback(err, null, null);
};

/**
 * Handles an HTTP redirect by rebuilding the authorization for
 * the new URL and retrying the request.
 * The caller is responsible for consuming (dump()) the redirect response body
 * before invoking this method.
 *
 * @param  {string}   location  Value of the Location header from the redirect response.
 * @param  {Function} callback  Node-style callback(err, response, body).
 * @private
 */
EdgeGrid.prototype._handleRedirect = async function (location, callback) {
    let parsedUrl;
    try {
        parsedUrl = new URL(location);
    } catch {
        parsedUrl = new URL(location, this.request.url);
    }

    this.request.url = undefined;
    this.request.path = parsedUrl.pathname + parsedUrl.search;

    this.auth(this.request);
    await this._executeRequest(callback);
};

/**
 * Creates a config object from a set of parameters.
 *
 * @param {String} client_token      The client token value from the .edgerc file.
 * @param {String} client_secret     The client secret value from the .edgerc file.
 * @param {String} access_token      The access token value from the .edgerc file.
 * @param {String} host              The host a unique string followed by luna.akamaiapis.net from the .edgerc file.
 */
EdgeGrid.prototype._setConfigFromStrings = function (client_token, client_secret, access_token, host) {
    if (!validatedArgs([client_token, client_secret, access_token, host])) {
        throw new Error('Insufficient Akamai credentials');
    }

    this.config = {
        client_token: client_token,
        client_secret: client_secret,
        access_token: access_token,
        host: host.indexOf('https://') > -1 ? host : 'https://' + host,
        max_body: helpers.MAX_BODY
    };
};

function validatedArgs(args) {
    const expected = [
        'client_token', 'client_secret', 'access_token', 'host'
    ];
    let valid = true;

    expected.forEach(function (arg, i) {
        if (!args[i]) {
            getLogger().error({ arg }, 'No defined argument');
            valid = false;
        }
    });

    return valid;
}

/**
 * Creates a config Object from the section of a defined .edgerc file.
 *
 * @param {Object} obj  An Object containing a path and section property that
 *                      define the .edgerc section to use to create the Object.
 */
EdgeGrid.prototype._setConfigFromObj = function (obj) {
    this.config = edgerc(obj.path, obj.section);
};

/**
 * Enables logging based on the provided option.
 *
 * @param {boolean|object} option - If true, configures the logger using environment variables.
 *                                  If a valid object, uses it as the logger instance.
 *                                  If false, disables logging.
 * @return EdgeGrid object (self)
 */
EdgeGrid.prototype.enableLogging = function (option) {
    enableLogging(option);
    return this;
};

module.exports = EdgeGrid;
