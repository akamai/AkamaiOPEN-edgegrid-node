const crypto = require('crypto'),
    { getLogger } = require('./logger'),
    path = require('path'),
    os = require('os');
const MAX_BODY = 131072

function twoDigitNumberPad(number) {
    return String(number).padStart(2, '0');
}

module.exports = {
    /**
     * Create timestamp with format "yyyyMMddTHH:mm:ss+0000"
     *
     * @see https://developer.akamai.com/legacy/introduction/Client_Auth.html#authorizationheaderfields
     */
    MAX_BODY,
    createTimestamp: function () {
        const date = new Date(Date.now());

        return date.getUTCFullYear() +
            twoDigitNumberPad(date.getUTCMonth() + 1) +
            twoDigitNumberPad(date.getUTCDate()) +
            'T' +
            twoDigitNumberPad(date.getUTCHours()) + ':' +
            twoDigitNumberPad(date.getUTCMinutes()) +
            ':' +
            twoDigitNumberPad(date.getUTCSeconds()) +
            '+0000';
    },
    contentHash: function (request) {
        var logger = getLogger()
        let contentHash = '',
            preparedBody = request.body || '',
            isTarball = preparedBody instanceof Uint8Array && request.headers['Content-Type'] === 'application/gzip';

        if (typeof preparedBody === 'object' && !isTarball) {
            let postDataNew = '',
                key;

            logger.info('Body content is type Object, transforming to POST data');

            for (key in preparedBody) {
                postDataNew += key + '=' + encodeURIComponent(JSON.stringify(preparedBody[key])) + '&';
            }

            // Strip trailing ampersand
            postDataNew = postDataNew.replace(/&+$/, "");

            preparedBody = postDataNew;
            request.body = preparedBody; // Is this required or being used?
        }

        logger.info({ body: preparedBody }, 'Body');
        logger.debug({ length: preparedBody.length }, 'Prepared body length');

        if (request.method === 'POST' && preparedBody.length > 0) {

            logger.info({ body: preparedBody }, 'Signing content');

            // If body data is too large, cut down to max-body size which is const value
            if (preparedBody.length > MAX_BODY) {
                logger.warn({
                    length: preparedBody.length,
                    maxAllowed: MAX_BODY,
                }, 'Data length exceeds maximum allowed');

                if (isTarball)
                    preparedBody = preparedBody.slice(0, MAX_BODY);
                else
                    preparedBody = preparedBody.substring(0, MAX_BODY);
                logger.info({ newBody: preparedBody }, 'Body truncated');
            }

            logger.debug({ preparedBody }, 'Prepared body content');

            contentHash = this.base64Sha256(preparedBody);
            logger.info({ hash: contentHash }, 'Content hash is');
        }

        return contentHash;
    },
    /**
     *
     * @param {Object} request      The request Object. Can optionally contain a
     *                              'headersToSign' property: An ordered list header names
     *                              that will be included in the signature. This will be
     *                              provided by specific APIs.
     * @param {String} authHeader   The authorization header.
     * @param {Number} maxBody      This value is deprecated.
     * @deprecated maxBody
     */
    dataToSign: function (request, authHeader, maxBody) {
        const parsedUrl = new URL(request.url),
            dataToSign = [
                request.method.toUpperCase(),
                parsedUrl.protocol.replace(":", ""),
                parsedUrl.host,
                parsedUrl.pathname + parsedUrl.search,
                this.canonicalizeHeaders(request.headersToSign),
                this.contentHash(request, maxBody),
                authHeader
            ];

        const dataToSignStr = dataToSign.join('\t').toString();

        getLogger().info({ data: dataToSignStr }, 'Data to sign');

        return dataToSignStr;
    },

    extend: function (a, b) {
        let key;

        for (key in b) {
            if (!a.hasOwnProperty(key)) {
                a[key] = b[key];
            }
        }

        return a;
    },

    extendHeaders: function (headers) {
        if (!headers.hasOwnProperty('Content-Type')) {
            headers['Content-Type'] = "application/json";
        }
        if (!headers.hasOwnProperty('Accept')) {
            headers['Accept'] = "application/json";
        }

        let userAgents = [headers['User-Agent']];
        if (process.env['AKAMAI_CLI'] && process.env['AKAMAI_CLI_VERSION']) {
            userAgents.push(`AkamaiCLI/${process.env['AKAMAI_CLI_VERSION']}`);
        }
        if (process.env['AKAMAI_CLI_COMMAND'] && process.env['AKAMAI_CLI_COMMAND_VERSION']) {
            userAgents.push(`AkamaiCLI-${process.env['AKAMAI_CLI_COMMAND']}/${process.env['AKAMAI_CLI_COMMAND_VERSION']}`);
        }

        userAgents = userAgents.filter(v => v)
        if (userAgents.length > 0) {
            headers['User-Agent'] = userAgents.join(' ')
        }

        return headers;
    },

    isRedirect: function (statusCode) {
        return [
            300, 301, 302, 303, 307
        ].indexOf(statusCode) !== -1;
    },

    base64Sha256: function (data) {
        const shasum = crypto.createHash('sha256').update(data);

        return shasum.digest('base64');
    },

    base64HmacSha256: function (data, key) {
        const encrypt = crypto.createHmac('sha256', key);

        encrypt.update(data);

        return encrypt.digest('base64');
    },

    /**
     * Creates a String containing a tab delimited set of headers.
     * @param  {Object} headers Object containing the headers to add to the set.
     * @return {String}         String containing a tab delimited set of headers.
     */
    canonicalizeHeaders: function (headers) {
        const formattedHeaders = [];
        let key;

        for (key in headers) {
            formattedHeaders.push(key.toLowerCase() + ':' + headers[key].trim().replace(/\s+/g, ' '));
        }

        return formattedHeaders.join('\t');
    },

    signingKey: function (timestamp, clientSecret) {
        const key = this.base64HmacSha256(timestamp, clientSecret);

        getLogger().info({ key }, 'Signing key used');

        return key;
    },
    /**
     *
     * @param {Object} request       The request Object. Can optionally contain a
     *                               'headersToSign' property: An ordered list header names
     *                               that will be included in the signature. This will be
     *                               provided by specific APIs.
     * @param {Date} timestamp       The timestamp with format "yyyyMMddTHH:mm:ss+0000".
     * @param {String} clientSecret  The client secret value from the .edgerc file.
     * @param {String} authHeader    The authorization header.
     * @param maxBody                This value is deprecated.
     * @returns {string}
     * @deprecated maxBody
     */
    signRequest: function (request, timestamp, clientSecret, authHeader, maxBody) {
        return this.base64HmacSha256(this.dataToSign(request, authHeader, maxBody), this.signingKey(timestamp, clientSecret));
    },

    resolveHome: function (filePath) {
        if (filePath[0] === '~') {
            return path.join(os.homedir(), filePath.slice(1));
        }
        return filePath;
    },
};
