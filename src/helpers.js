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

var isGas = false;

try {
  //try to eval process to detect gas.
  if(process){
    isGas = false;
  }
} catch (err){
  isGas = true;
}

var crypto = require('./mycrypto');
var url = require('url');
var logger = require('./logger');

module.exports = {
  isGas : isGas,

  createTimestamp: function() {
    function pad2(n) {  // always returns a string
      return (n < 10 ? '0' : '') + n;
    }
    var d = new Date();
    return d.getUTCFullYear() +
      pad2(d.getUTCMonth() + 1) +
      pad2(d.getUTCDate()) + 'T' +
      pad2(d.getUTCHours()) + ':' +
      pad2(d.getUTCMinutes()) + ':' +
      pad2(d.getUTCSeconds()) + '+0000'
    ;
  },

  contentHash: function(request, maxBody) {
    var contentHash = '',
      preparedBody = request.body || '';

    if (typeof preparedBody === 'object') {
      var postDataNew = '',
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

    logger.info('Body is \"' + preparedBody + '\"');
    logger.debug('PREPARED BODY LENGTH', preparedBody.length);
    
    if (request.method === 'POST' && preparedBody.length > 0) {
      logger.info('Signing content: \"' + preparedBody + '\"');

      // If body data is too large, cut down to max-body size
      if (preparedBody.length > maxBody) {
        logger.warn('Data length (' + preparedBody.length + ') is larger than maximum ' + maxBody);
        preparedBody = preparedBody.substring(0, maxBody);
        logger.info('Body truncated. New value \"' + preparedBody + '\"');
      }

      logger.debug('PREPARED BODY', preparedBody);

      contentHash = crypto.base64Sha256(preparedBody);
      logger.info('Content hash is \"' + contentHash + '\"');
    }

    return contentHash;
  },

  dataToSign: function(request, authHeader, maxBody) {
    var parsedUrl = url.parse(request.url, true),
      dataToSign = [
        request.method.toUpperCase(),
        parsedUrl.protocol.replace(":", ""),
        parsedUrl.host,
        parsedUrl.path,
        this.canonicalizeHeaders(request.headersToSign),
        this.contentHash(request, maxBody),
        authHeader
      ];

    dataToSign = dataToSign.join('\t').toString();

    logger.info('Data to sign: "' + dataToSign + '" \n');

    return dataToSign;
  },

  extend: function(a, b) {
    var key;

    for (key in b) {
      if (!a.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }

    return a;
  },

  isRedirect: function(statusCode) {
    return [
      300, 301, 302, 303, 307
    ].indexOf(statusCode) !== -1;
  },
  base64Sha256: crypto.base64Sha256,

  base64HmacSha256: crypto.base64HmacSha256,


  /**
   * Creates a String containing a tab delimited set of headers.
   * @param  {Object} headers Object containing the headers to add to the set.
   * @return {String}         String containing a tab delimited set of headers.
   */
  canonicalizeHeaders: function(headers) {
    var formattedHeaders = [],
      key;

    for (key in headers) {
      formattedHeaders.push(key.toLowerCase() + ':' + headers[key].trim().replace(/\s+/g, ' '));
    }

    return formattedHeaders.join('\t');
  },

  signingKey: function(timestamp, clientSecret) {
    var key = this.base64HmacSha256(timestamp, clientSecret);

    logger.info('Signing key: ' + key + '\n');

    return key;
  },

  signRequest: function(request, timestamp, clientSecret, authHeader, maxBody) {
    return this.base64HmacSha256(this.dataToSign(request, authHeader, maxBody), this.signingKey(timestamp, clientSecret));
  }
};
