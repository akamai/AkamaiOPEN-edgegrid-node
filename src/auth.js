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

var uuid = require('node-uuid'),
    moment = require('moment'),
    crypto = require('crypto'),
    _ = require('underscore'),
    url = require('url'),
    logger = require('./logger');

var _headers_to_sign = null,
    _max_body = null;

var createTimestamp = function() {
    var timestamp = moment().utc().format('YYYYMMDDTHH:mm:ss+0000');
    return timestamp;
};

var base64_hmac_sha256 = function(data, key) {
    var encrypt = crypto.createHmac("sha256", key);
    encrypt.update(data);
    return encrypt.digest("base64");
};

var canonicalize_headers = function(request) {
    logger.debug("HEADERS TO SIGN", _headers_to_sign);
    var new_headers = [];
    var cleansed_headers = {};
    _.each(request.headers, function(value, header) {
        if (value) {
            header = header.toLowerCase();
            if (typeof value == "string") {
                value = value.trim();
                value = value.replace(/\s+/g, ' ');
            }

            cleansed_headers[header.toLowerCase()] = value;
        }
    });

    _.each(_headers_to_sign, function(header) {
        new_headers.push(header.toLowerCase() + ":" + cleansed_headers[header.toLowerCase()]);
    });


    new_headers = new_headers.join("\t");
    return new_headers;
};

var make_content_hash = function(request) {
    var max_body = _max_body;

    var content_hash = "",
        prepared_body = request.body || "";

    if (typeof prepared_body == "object") {
        logger.info("body content is type object, transforming to post data");
        var post_data_new = "";
        _.each(prepared_body, function(value, index) {
            // logger.log(encodeURIComponent(JSON.stringify(value)));
            post_data_new += index + "=" + encodeURIComponent(JSON.stringify(value)) + "&";
        });
        prepared_body = post_data_new;
        request.body = prepared_body;
    }

    logger.info("body is \"" + prepared_body + "\"");
    logger.debug("PREPARED BODY LENGTH", prepared_body.length);

    if (request.method == "POST" && prepared_body.length > 0) {
        logger.info("Signing content: \"" + prepared_body + "\"");
        // logger.log(prepared_body.length);
        if (prepared_body.length > max_body) {
            logger.warn("Data length (" + prepared_body.length + ") is larger than maximum " + max_body);
            prepared_body = prepared_body.substring(0, max_body);
            logger.info("Body truncated. New value \"" + prepared_body + "\"");
        }

        logger.debug("PREPARED BODY", prepared_body);

        var shasum = crypto.createHash('sha256');
        shasum.update(prepared_body);
        content_hash = shasum.digest("base64");
        logger.info("Content hash is \"" + content_hash + "\"");
    }

    return content_hash;
};

var make_data_to_sign = function(request, auth_header) {
    var parsed_url = url.parse(request.url, true);
    var data_to_sign = [
        request.method.toUpperCase(),
        parsed_url.protocol.replace(":", ""),
        parsed_url.host,
        parsed_url.path,
        canonicalize_headers(request),
        make_content_hash(request),
        auth_header
    ].join("\t").toString();

    logger.info('data to sign: "' + data_to_sign + '" \n');

    return data_to_sign;
};

var sign_request = function(request, timestamp, client_secret, auth_header) {
    return base64_hmac_sha256(make_data_to_sign(request, auth_header), make_signing_key(timestamp, client_secret));
};

var make_signing_key = function(timestamp, client_secret) {
    var signing_key = base64_hmac_sha256(timestamp, client_secret);
    logger.info("Signing key: " + signing_key + "\n");
    return signing_key;
};

var make_auth_header = function(request, client_token, access_token, client_secret, timestamp, nonce) {
    var key_value_pairs = {
        "client_token": client_token,
        "access_token": access_token,
        "timestamp": timestamp,
        "nonce": nonce
    };

    var joined_pairs = "";
    _.each(key_value_pairs, function(value, key) {
        joined_pairs += key + "=" + value + ";";
    });

    var auth_header = "EG1-HMAC-SHA256 " + joined_pairs;

    logger.info("Unsigned authorization header: " + auth_header + "\n");

    var signed_auth_header = auth_header + "signature=" + sign_request(request, timestamp, client_secret, auth_header);

    logger.info("Signed authorization header: " + signed_auth_header + "\n");

    return signed_auth_header;
};

module.exports = {
  generate_auth: function(request, client_token, client_secret, access_token, host, headers_to_sign, max_body, guid, timestamp) {

        _max_body = max_body || 2048;
        _headers_to_sign = headers_to_sign || [];

        guid = guid || uuid.v4();
        timestamp = timestamp || createTimestamp();

        if (!request.hasOwnProperty("headers")) {
            request.headers = {};
        }
        request.url = host + request.path;
        request.headers.Authorization = make_auth_header(request, client_token, access_token, client_secret, timestamp, guid);
        return request;
    }
};
