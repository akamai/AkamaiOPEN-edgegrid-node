# EdgeGrid for Node.js

![Build Status](https://github.com/akamai/AkamaiOPEN-edgegrid-node/actions/workflows/test.yml/badge.svg)

This library implements an Authentication handler for the Akamai EdgeGrid Authentication scheme in Node.js for Node v22 and higher LTS versions.

You can find the most up-to-date package in [NPM](https://www.npmjs.com/package/akamai-edgegrid) under `akamai-edgegrid`.

## Install

`npm install --save akamai-edgegrid`

## Authentication

You can obtain the authentication credentials through an API client. Requests to the API are marked with a timestamp and a signature and are executed immediately.

1. [Create authentication credentials](https://techdocs.akamai.com/developer/docs/edgegrid).

2. Place your credentials in an EdgeGrid file `~/.edgerc`, in the `[default]` section.

    ```
    [default]
    client_secret = C113nt53KR3TN6N90yVuAgICxIRwsObLi0E67/N8eRN=
    host = akab-h05tnam3wl42son7nktnlnnx-kbob3i3v.luna.akamaiapis.net
    access_token = akab-acc35t0k3nodujqunph3w7hzp7-gtm6ij
    client_token = akab-c113ntt0k3n4qtari252bfxxbsl-yvsdj
    ```

3. Use your local `.edgerc` by providing the path to your resource file and credentials' section header.

    ```javascript
    var eg = new EdgeGrid({
      path: '/path/to/.edgerc',
      section: '<section-header>'
    });
    ```

    Alternatively, you can hard code your credentials by passing the credential values to the `EdgeGrid()` method.

    ```javascript
    var clientToken = "akab-c113ntt0k3n4qtari252bfxxbsl-yvsdj",
        clientSecret = "C113nt53KR3TN6N90yVuAgICxIRwsObLi0E67/N8eRN=",
        accessToken = "akab-acc35t0k3nodujqunph3w7hzp7-gtm6ij",
        baseUri = "akab-h05tnam3wl42son7nktnlnnx-kbob3i3v.luna.akamaiapis.net";

    var eg = new EdgeGrid(clientToken, clientSecret, accessToken, baseUri);
    ```

## Use

To use the library, provide the path to your `.edgerc`, your credentials section header, and the appropriate endpoint information.

### Promise API (recommended)

```javascript
const EdgeGrid = require('akamai-edgegrid');

const eg = new EdgeGrid({
  path: '/path/to/.edgerc',
  section: 'section-header'
});

try {
  const { statusCode, body } = await eg.send({
    path: '/identity-management/v3/user-profile',
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });

  console.log(statusCode); // 200
  console.log(JSON.parse(body));
} catch (err) {
  console.error(err.statusCode, err.message);
}
```

### Callback API (deprecated)

> **Deprecated:** The callback form of `send()` is deprecated and will be removed in a future major version. New code should use the Promise API. Use this only to keep existing call sites working while migrating incrementally.

Passing a callback to `send()` enables the Node-style `(err, response, body)` interface.

```javascript
eg.send({
  path: '/identity-management/v3/user-profile',
  method: 'GET',
  headers: { 'Accept': 'application/json' }
}, function (err, response, body) {
  if (err) return console.error(err);
  console.log(response.statusCode); // note: statusCode is now a direct property of the result
  console.log(body);
});
```

### Concurrent requests

`send()` owns the complete request state, so one `EdgeGrid` instance can safely
send multiple requests at once.

```javascript
const [users, profile] = await Promise.all([
  eg.send({ path: '/users', method: 'GET' }),
  eg.send({ path: '/user-profile', method: 'GET' })
]);
```

### Query string parameters

When entering query parameters use the `qs` property in the request passed to `send()`. Set up the parameters as name-value pairs in an object.

```javascript
const { statusCode, body } = await eg.send({
    path: '/identity-management/v3/user-profile',
    method: 'GET',
    headers: {},
    qs: {
        authGrants: true,
        notifications: true,
        actions: true
    }
});
```

### Headers

Enter request headers as name-value pairs in an object.

> **Note:** You don't need to include the `Content-Type` and `Content-Length` headers. The authentication layer adds these values.

```javascript
const { statusCode, body } = await eg.send({
  path: '/identity-management/v3/user-profile',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
});
```

### Body data

Provide the request body as an object or as a POST data formatted string.

```javascript
const { statusCode, body } = await eg.send({
    path: '/identity-management/v3/user-profile/basic-info',
    method: 'PUT',
    headers: {},
    body: {
        contactType: 'Billing',
        country: 'USA',
        firstName: 'John',
        lastName: 'Smith',
        phone: '3456788765',
        preferredLanguage: 'English',
        sessionTimeOut: 30,
        timeZone: 'GMT'
    }
});
```

### Encoding

The library automatically detects binary responses by content type — any response that is not a known text type (`text/*`, `application/json`, `application/xml`, etc.) is returned as a native `Buffer`. You can also force binary mode by setting `Accept` to `application/gzip` or `application/tar+gzip`.

```javascript
const fs = require('fs');

// Promise style (recommended)
const { body } = await eg.send({
  path: `/invoicing-api/v2/contracts/${contractId}/invoices/${invoiceNumber}/files/${fileName}`,
  method: 'GET',
  headers: { 'Accept': 'application/gzip' }
});

fs.writeFileSync(`./${fileName}`, body); // body is already a Buffer

// Callback style (compatibility)
eg.send({
  path: `/invoicing-api/v2/contracts/${contractId}/invoices/${invoiceNumber}/files/${fileName}`,
  method: 'GET',
  headers: { 'Accept': 'application/gzip' }
}, (err, response, body) => {
  if (err) return console.error(err);
  fs.writeFile(`./${fileName}`, body, (writeErr) => {
    if (writeErr) return console.error(writeErr);
    console.log('File was saved!');
  });
});
```

### Logging
The library supports configurable logging through the `enableLogging()` method.

- Enable logging with environment variables.
  - `AKAMAI_LOG_LEVEL`. Sets the verbosity level of the emitted log messages. Valid values are `error`, `warn`, `info`, `debug`, `fatal`, and `trace`. Default to `info.`
  - `AKAMAI_LOG_PRETTY`. Controls whether the log output is formatted in a human-friendly way. Valid values are `true` or `false`. Defaults to `false`.

  ```javascript
  const edgeGrid = require('akamai-edgegrid');

  // Set environment variables before enabling logging
  process.env.AKAMAI_LOG_LEVEL = 'debug';
  process.env.AKAMAI_LOG_PRETTY = 'true';

  var eg = new EdgeGrid({
      path: '/path/to/.edgerc', 
      section: '<section-header>'
  });
  eg.enableLogging(true);
  ```

- Disable logging.

  ```javascript
  const edgeGrid = require('akamai-edgegrid');
  var eg = new EdgeGrid({
      path: '/path/to/.edgerc',
      section: '<section-header>'
  });
  eg.enableLogging(false);
  ```

- Add a custom logger.
  - You can also pass a custom logger object to the `enableLogging()` method. The object must have the `info`, `debug`, `error`, and `warn` methods.
  - If you pass a logger object that doesn't implement the required methods, you'll get an error.

  ```javascript
  const edgeGrid = require('akamai-edgegrid');
  // custom logger
  const logger = {
    info: (msg, ...args) => console.log('INFO:', msg, ...args),
    debug: (msg, ...args) => console.log('DEBUG:', msg, ...args),
    error: (msg, ...args) => console.error('ERROR:', msg, ...args),
    warn: (msg, ...args) => console.warn('WARN:', msg, ...args)  
  };

  var eg = new EdgeGrid({
      path: '/path/to/.edgerc',
      section: '<section-header>'
  });

  eg.enableLogging(logger); // Pass the custom logger 

  logger.info('Using custom logger for logging.');
  logger.error('An error occurred!');
  ```

### Proxy

The library uses [`undici`](https://github.com/nodejs/undici)'s `EnvHttpProxyAgent` under the hood, which automatically reads the standard `HTTP_PROXY` and `HTTPS_PROXY` environment variables.

- Set the `HTTPS_PROXY` environment variable.

  ```shell
  $ export HTTPS_PROXY=https://username:password@host:port
  $ node myapp.js
  ```

- Configure a proxy programmatically for a specific `EdgeGrid` instance using undici's `ProxyAgent`.

  ```javascript
  const { ProxyAgent } = require('undici');

  var eg = new EdgeGrid({
    path: '/path/to/.edgerc',
    section: 'section-header'
  });

  // Override the default dispatcher with a per-instance proxy
  eg._dispatcher = new ProxyAgent('https://username:password@my.proxy.com:3128');

  eg.send({ path: '/identity-management/v3/user-profile', method: 'GET' })
    .then(({ statusCode, body }) => console.log(statusCode, body))
    .catch(err => console.error(err));
  ```

## Migrating from v4 (axios → undici)

v5 replaces `axios` with `undici` as the HTTP transport. The following changes affect **all consumers** regardless of whether you use the Promise or callback API.

### `response.statusCode` replaces `response.status`

```javascript
// v4 (axios)
if (response.status === 200) { console.log('ok'); }

// v5 (undici)
if (response.statusCode === 200) { console.log('ok'); }
```

### Error shape

```javascript
// v4 (axios) — callback style
eg.auth({ path: '/foo' }).send(function (err, response, body) {
  if (err) {
    console.log(err.response.status);  // HTTP status
    console.log(err.response.data);    // response body
  }
});

// v5 (undici) — Promise style
try {
  const { statusCode, body } = await eg.send({ path: '/foo' });
} catch (err) {
  console.log(err.statusCode); // HTTP status; undefined for network errors (connection refused, DNS failure etc.)
  console.log(err.headers);    // response headers
  console.log(err.message);    // human-readable message
}
```

### Binary responses

```javascript
// v4 — binary data was only in response.data; body was unusable
eg.auth({ path: '/file.gz', responseType: 'arraybuffer' }).send(function (err, response) {
  const buffer = response.data; // axios-specific field
  fs.writeFileSync('file.gz', buffer);
});

// v5 — body is a native Buffer automatically for binary content types
const { body } = await eg.send({
  path: '/file.gz',
  headers: { 'Accept': 'application/gzip' }
});
fs.writeFileSync('file.gz', body);
```

### Proxy

```javascript
// v4 — proxy configured inside auth()
eg.auth({ path: '/foo', proxy: { host: 'proxy.host', port: 3128 } });

// v5 — use environment variables (automatic, no code needed)
// export HTTPS_PROXY=http://proxy.host:3128

// v5 — or programmatic per-instance proxy
const { ProxyAgent } = require('undici');
eg._dispatcher = new ProxyAgent('http://proxy.host:3128');
```

---

## Migrating from callback to Promise API

Use this guide to migrate existing callback-based call sites to the Promise API.

### Basic request

```javascript
// Before (callback)
eg.send({ path: '/foo', method: 'GET' }, function (err, response, body) {
  if (err) { console.error(err); return; }
  console.log(response.statusCode, body);
});

// After (Promise)
try {
  const { statusCode, body } = await eg.send({ path: '/foo', method: 'GET' });
  console.log(statusCode, body);
} catch (err) {
  console.error(err.statusCode, err.message);
}
```

### Error handling

```javascript
// Before (callback) — must check err manually on every call
eg.send({ path: '/foo' }, function (err, response, body) {
  if (err) {
    console.error(err.statusCode, err.message);
    return;
  }
  console.log(response.statusCode, body); // happy path
});

// After (Promise) — single catch block handles all errors for the whole async flow
try {
  const { statusCode, body } = await eg.send({ path: '/foo' });
  console.log(statusCode, body); // happy path
} catch (err) {
  console.error(err.statusCode, err.message);
}
```

### Parallel requests

```javascript
// Before (callback) — requires manual coordination with a shared counter or object
let results = {};
eg.send({ path: '/users' }, (err, r, body) => {
  if (!err) results.users = body;
  if (results.users && results.profile) console.log(results);
});
eg.send({ path: '/user-profile' }, (err, r, body) => {
  if (!err) results.profile = body;
  if (results.users && results.profile) console.log(results);
});

// After (Promise) — standard Promise.all
const [users, profile] = await Promise.all([
  eg.send({ path: '/users' }),
  eg.send({ path: '/user-profile' })
]);
console.log(JSON.parse(users.body), JSON.parse(profile.body));
```

## Reporting issues

To report an issue or make a suggestion, create a new [GitHub issue](https://github.com/akamai/AkamaiOPEN-edgegrid-node/issues).

## License

Copyright 2026 Akamai Technologies, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use these files except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.