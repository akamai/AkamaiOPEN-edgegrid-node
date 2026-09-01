'use strict';

const { request, EnvHttpProxyAgent } = require('undici'),
    auth = require('./auth'),
    edgerc = require('./edgerc'),
    helpers = require('./helpers'),
    { enableLogging, getLogger } = require('./logger');

// Module-level singleton: reads HTTP_PROXY / HTTPS_PROXY env vars and manages connection pooling.
const proxyAgent = new EnvHttpProxyAgent();

// Text MIME types are a small, well-known set. Everything else is treated as binary
// so that unknown or future binary types are handled correctly without code changes.
function isTextContentType(contentType) {
    const base = contentType.split(';')[0].trim().toLowerCase();
    return base.startsWith('text/') ||
        base === 'application/json' ||
        base === 'application/xml' ||
        base === 'application/javascript' ||
        base.endsWith('+json') ||
        base.endsWith('+xml');
}

/**
 * Reads the response body, wrapping any transport error with url context.
 *
 * @param  {object}  responseBody  The undici response body stream.
 * @param  {string}  url           The request URL, for error context.
 * @param  {boolean} isBinary      When true, reads as a Buffer; otherwise reads as a string.
 * @return {Promise<string|Buffer>}
 */
async function consumeBody(responseBody, url, isBinary) {
    try {
        return isBinary
            ? Buffer.from(await responseBody.arrayBuffer())
            : await responseBody.text();
    } catch (networkError) {
        const err = new Error(networkError.message, { cause: networkError });
        err.url = url;
        throw err;
    }
}

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
 * Builds and signs a request using the local configuration.
 *
 * @param  {Object} req The request Object. Can optionally contain a
 *                      'headersToSign' property: An ordered list header names
 *                      that will be included in the signature. This will be
 *                      provided by specific APIs.
 * @return {Object} Signed request.
 * @private
 */
EdgeGrid.prototype._prepareRequest = function (req) {
    req = {
        ...req,
        url: req.path,
        method: req.method || 'GET',
        headers: helpers.extendHeaders({ ...(req.headers || {}) }),
    };

    const isTarball = helpers.isBinaryBundle(req.body, req.headers['Content-Type']);

    // Convert body object to properly formatted string
    if (req.body) {
        if (typeof (req.body) == 'object' && !isTarball) {
            req.body = JSON.stringify(req.body);
        }
    }

    const signedRequest = auth.generateAuth(
        req,
        this.config.client_token,
        this.config.client_secret,
        this.config.access_token,
        this.config.host,
        helpers.MAX_BODY
    );

    if (req.headers['Accept'] === 'application/gzip' || req.headers['Accept'] === 'application/tar+gzip') {
        signedRequest.responseType = 'arraybuffer';
    }

    return signedRequest;
};

/**
 * Sends the request and returns a Promise that resolves with { statusCode, headers, body, url }.
 *
 * On success (2xx) the Promise resolves with:
 *   - statusCode  {number}           HTTP status code
 *   - headers     {object}           Response headers
 *   - body        {string|Buffer}    Text for JSON/plain responses; Buffer for binary ones.
 *   - url         {string}           Final URL after any redirects
 *
 * On failure the Promise rejects with an EdgeGridError that carries:
 *   - err.statusCode  {number}       HTTP status code (absent for network errors)
 *   - err.headers     {object}       Response headers (absent for network errors)
 *   - err.body        {string|Buffer} Response body (absent for network errors)
 *   - err.url         {string}       URL that was requested
 *   - err.cause       {Error}        Underlying network error (present for transport failures)
 *
 * Passing an optional callback enables compatibility mode: the callback is invoked
 * with the Node-style (err, response, body) signature and `this` is returned for
 * chaining, matching the pre-v5 behavior. The callback form is deprecated and will
 * be removed in a future major version. Prefer the Promise API for new code.
 *
 * @param  {Object} requestOptions Request options to authenticate and send.
 * @param  {Function} [callback]  Optional Node-style callback(err, response, body).
 *                                Deprecated — use the Promise API instead.
 * @return {Promise<{statusCode, headers, body, url}>|EdgeGrid}  Promise when no callback; `this` otherwise.
 */
EdgeGrid.prototype.send = function (requestOptions, callback) {
    if (requestOptions === undefined || requestOptions === null || typeof requestOptions !== 'object') {
        throw new TypeError('requestOptions must be an object');
    }
    if (!requestOptions.path) {
        throw new TypeError('requestOptions.path is required');
    }
    if (callback !== undefined && typeof callback !== 'function') {
        throw new TypeError('callback must be a function');
    }
    const promise = this._executeRequest(this._prepareRequest(requestOptions));

    if (callback === undefined) {
        return promise;
    }

    // Compatibility mode: wrap the Promise result into the pre-v5 callback
    // signature so existing call sites can migrate incrementally.
    promise
        .then(
            (result) => callback(null, result, result.body),
            err => callback(err, null, null)
        );
    return this; // preserve old chainable return value
};

/**
 * Async implementation of the HTTP dispatch.
 *
 * @param  {Object} requestOptions Signed request options from _prepareRequest.
 * @return {Promise<{statusCode: number, headers: object, body: string|Buffer, url: string}>}
 * @private
 */
EdgeGrid.prototype._executeRequest = async function (requestOptions) {
    const logger = getLogger();

    logger.debug({ url: requestOptions.url, method: requestOptions.method }, 'Starting request');

    // Passing body to undici for GET/HEAD causes a RequestContentLengthMismatchError.
    const NO_BODY_METHODS = ['GET', 'HEAD'];
    let response;
    try {
        response = await request(requestOptions.url, {
            method: requestOptions.method,
            headers: requestOptions.headers,
            body: NO_BODY_METHODS.includes((requestOptions.method || '').toUpperCase())
                ? null
                : (requestOptions.body || null),
            maxRedirections: 0,
            // Only spread dispatcher when explicitly set; omitting it lets undici fall back to
            // its global dispatcher, allowing callers to opt out of EnvHttpProxyAgent.
            ...(this._dispatcher != null && { dispatcher: this._dispatcher }),
        });
    } catch (networkError) {
        const err = new Error(networkError.message, { cause: networkError });
        err.url = requestOptions.url;
        throw err;
    }

    logger.debug({ statusCode: response.statusCode }, 'Received response');

    if (helpers.isRedirect(response.statusCode)) {
        const rawLocation = response.headers['location'];
        // Consume the redirect body to release the TCP socket back to the pool
        // before opening a new connection to the redirect target.
        try {
            await response.body.dump();
        } catch (networkError) {
            const err = new Error(networkError.message, { cause: networkError });
            err.url = requestOptions.url;
            throw err;
        }

        if (!rawLocation) {
            const err = new Error(`Redirect (${response.statusCode}) received without a Location header`);
            err.statusCode = response.statusCode;
            err.url = requestOptions.url;
            throw err;
        }

        // HTTP allows duplicate Location headers; take the first value.
        const location = Array.isArray(rawLocation) ? rawLocation[0] : rawLocation;
        return this._handleRedirect(location, requestOptions);
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
        const rawContentType = response.headers['content-type'];
        const contentType = Array.isArray(rawContentType) ? rawContentType[0] : (rawContentType || '');

        // Treat as binary when responseType is explicitly set, or when the Content-Type is not a known text type.
        const isBinaryResponse =
            requestOptions.responseType === 'arraybuffer' ||
            !isTextContentType(contentType);

        const body = await consumeBody(response.body, requestOptions.url, isBinaryResponse);

        return {
            statusCode: response.statusCode,
            headers: response.headers,
            body,
            url: requestOptions.url,
        };
    }

    const rawContentType = response.headers['content-type'];
    const contentType = Array.isArray(rawContentType) ? rawContentType[0] : (rawContentType || '');
    const body = await consumeBody(response.body, requestOptions.url, !isTextContentType(contentType));

    const err = new Error(`Request failed with status code ${response.statusCode}`);
    err.statusCode = response.statusCode;
    err.headers = response.headers;
    err.body = body;
    err.url = requestOptions.url;
    throw err;
};

/**
 * Handles an HTTP redirect by rebuilding the EdgeGrid authorization signature
 * for the new URL and retrying the request.
 *
 * @param  {string} location  Resolved value of the Location header.
 * @param  {Object} requestOptions  Original request options, which will be modified for the redirect.
 * @return {Promise<{statusCode: number, headers: object, body: string|Buffer, url: string}>}
 * @private
 */
EdgeGrid.prototype._handleRedirect = async function (location, requestOptions) {
    let parsedUrl;
    try {
        parsedUrl = new URL(location);
    } catch {
        parsedUrl = new URL(location, requestOptions.url);
    }

    requestOptions.url = undefined;
    requestOptions.path = parsedUrl.pathname + parsedUrl.search;

    return this._executeRequest(this._prepareRequest(requestOptions));
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
