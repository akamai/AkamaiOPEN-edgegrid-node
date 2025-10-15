const { randomUUID } = require('crypto'),
    helpers = require('./helpers'),
    logger = require('./logger'),
    url = require('url');

/**
 *
 * @param {Object} request         The request Object. Can optionally contain a
 *                                 'headersToSign' property: An ordered list header names
 *                                 that will be included in the signature. This will be
 *                                 provided by specific APIs.
 * @param {String} clientToken     The client token value from the .edgerc file.
 * @param {String} accessToken     The access token value from the .edgerc file.
 * @param {String} clientSecret    The client secret value from the .edgerc file.
 * @param {Date} timestamp         The timestamp with format "yyyyMMddTHH:mm:ss+0000".
 * @param {String} nonce           A random string used to detect replayed request messages.
 * @param {Number} maxBody         This parameter is deprecated.
 * @returns {string}
 * @deprecated maxBody
 */
function makeAuthHeader(request, clientToken, accessToken, clientSecret, timestamp, nonce, maxBody) {
    const keyValuePairs = {
        client_token: clientToken,
        access_token: accessToken,
        timestamp: timestamp,
        nonce: nonce
    };
    let joinedPairs = '',
        authHeader,
        signedAuthHeader,
        key;

    for (key in keyValuePairs) {
        joinedPairs += key + '=' + keyValuePairs[key] + ';';
    }

    authHeader = 'EG1-HMAC-SHA256 ' + joinedPairs;

    logger.info('Unsigned authorization header: ' + authHeader + '\n');

    signedAuthHeader = authHeader + 'signature=' + helpers.signRequest(request, timestamp, clientSecret, authHeader, maxBody);

    logger.info('Signed authorization header: ' + signedAuthHeader + '\n');

    return signedAuthHeader;
}

function makeURL(host, path, queryStringObj) {
    const parsed = new URL(path, host);
    if (queryStringObj) {
        const queryFromObject = new url.URLSearchParams();
        for (const key of Object.keys(queryStringObj)) {
            queryFromObject.append(key, queryStringObj[key]);
        }
        parsed.search = queryFromObject.toString();
    }

    return url.format(parsed);
}

module.exports = {
    /**
     *
     * @param {Object} request        The request Object. Can optionally contain a
     *                                'headersToSign' property: An ordered list header names
     *                                that will be included in the signature. This will be
     *                                provided by specific APIs.
     * @param {String} clientToken    The client token value from the .edgerc file.
     * @param {String} clientSecret   The client secret value from the .edgerc file.
     * @param {String} accessToken    The access token value from the .edgerc file.
     * @param {String} host           The host a unique string followed by luna.akamaiapis.net from the .edgerc file.
     * @param {Number} maxBody        This value is deprecated.
     * @param {String} guid           A random string used to detect replayed request messages.
     * @param {Date} timestamp        The timestamp with format "yyyyMMddTHH:mm:ss+0000".
     * @returns {{headers}|*}         The request Object.
     * @deprecated maxBody
     */
    generateAuth: function (request, clientToken, clientSecret, accessToken, host, maxBody, guid, timestamp) {
        guid = guid || randomUUID();
        timestamp = timestamp || helpers.createTimestamp();

        if (!request.hasOwnProperty('headers')) {
            request.headers = {};
        }

        request.url = makeURL(host, request.path, request.qs);
        request.headers.Authorization = makeAuthHeader(request, clientToken, accessToken, clientSecret, timestamp, guid, maxBody);

        return request;
    }
};
