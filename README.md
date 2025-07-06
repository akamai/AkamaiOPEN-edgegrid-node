# EdgeGrid for Node.js

![Build Status](https://github.com/akamai/AkamaiOPEN-edgegrid-node/actions/workflows/test.yml/badge.svg)

This library implements an Authentication handler for the Akamai EdgeGrid Authentication scheme in Node.js for Node v14 and above.

You can find the most up-to-date package in [NPM](https://www.npmjs.com/package/akamai-edgegrid) under `akamai-edgegrid`.

## Install

`npm install --save akamai-edgegrid`

## Authentication

You can obtain the authentication credentials through an API client. Requests to the API are marked with a timestamp and a signature and are executed immediately.

1. [Create authentication credentials](https://techdocs.akamai.com/developer/docs/set-up-authentication-credentials).

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

```javascript
var EdgeGrid = require('akamai-edgegrid');

var eg = new EdgeGrid({
  path: '/path/to/.edgerc',
  section: 'section-header'
});

eg.auth({
  path: '/identity-management/v3/user-profile',
  method: 'GET',
  headers: {
    'Accept': "application/json"
  },
  body: {}
});

eg.send(function(error, response, body) {
  console.log(body);
});
```

### Chaining

You can also chain calls by combining the execution of `auth` and `send` methods.

```javascript
eg.auth({
  path: '/identity-management/v3/user-profile',
  method: 'GET',
  headers: {},
  body: {}
}).send(function (error, response, body) {
  console.log(body);
});
```

### Query string parameters

When entering query parameters use the `qs` property under the `auth` method. Set up the parameters as name-value pairs in a object.

```javascript
eg.auth({
    path: '/identity-management/v3/user-profile',
    method: 'GET',
    headers: {},
    qs: {
        authGrants: true,
        notifications: true,
        actions: true
    },
    body: {}
})
```

### Headers

Enter request headers as name-value pairs in an object.

> **Note:** You don't need to include the `Content-Type` and `Content-Length` headers. The authentication layer adds these values.

```javascript
eg.auth({
  path: '/identity-management/v3/user-profile',
  method: 'GET',
  headers: {
    'Accept': "application/json"
  }
});
```

### Body data

Provide the request body as an object or as a POST data formatted string.

```javascript
// Object
eg.auth({
    path: '/identity-management/v3/user-profile/basic-info',
    method: 'PUT',
    headers: {},
    body: {
        contactType: "Billing",
        country: "USA",
        firstName: "John",
        lastName: "Smith",
        phone: "3456788765",
        preferredLanguage: "English",
        sessionTimeOut: 30,
        timeZone: "GMT"
   }
});
```

### Encoding

When interacting with binary data, such as during the retrieval of PDF invoices, specify the `responseType` as an `arraybuffer` in the `auth` method call. Omitting the `responseType` will cause an unreadable or blank response.

```javascript
const fs = require('fs');

eg.auth({
  path : `/invoicing-api/v2/contracts/${contractId}/invoices/${invoiceNumber}/files/${fileName}`,
  method: 'GET',
  responseType: 'arraybuffer', // Important
}).send((err, response) => {
  if (err) {
    return console.log(err);
  }
  fs.writeFile(`./${fileName}`, response.data, 'binary', (err) => {
    if (err){
      return console.log(err);
    }
    console.log('File was saved!');
  });
});
```

### Proxy

To use edgegrid with proxy, you can configure it with one of these methods:

- Add the `proxy` argument to the `EdgeGrid()` method.

  ```javascript
  eg.auth({
    path : `/identity-management/v3/user-profile`,
    method: 'GET',
    proxy: {
      host: 'my.proxy.com',
      protocol: "https",
      port: 3128,
      auth: {
        username: 'my-user',
        password: 'my-password'
      }
    }
  }).send((err, response) => {
    if (err) {
      return console.log(err);
    }
    console.log('Success!');
    // Do something with the response
  });
  ```

- Set the `HTTPS_PROXY` environment variable.

  ```shell
  $ export HTTPS_PROXY=https://username:password@host:port
  $ node myapp.js
  ```

### Debug

Enable debugging to get additional information about a request. You can configure this with one of these methods:

- Add the `debug` argument to the `EdgeGrid()` method.

  ```javascript
  var eg = new EdgeGrid({
    path: '/path/to/.edgerc',
    section: 'section-header'
    debug: true
  });
  ```

- Set the `EG_VERBOSE` environment variable.

  ```shell
  $ export EG_VERBOSE=true
  $ node src/main.js
  ```

### Custom Axios Instance

You can inject a custom axios instance to use instead of the default one. This allows you to configure custom timeouts, interceptors, or other axios-specific features.

#### Using string parameters:

```javascript
const axios = require('axios');

// Create a custom axios instance
const customAxios = axios.create({
    timeout: 30000, // 30 second timeout
    headers: {
        'User-Agent': 'MyCustomApp/1.0'
    }
});

// Add custom interceptors
customAxios.interceptors.request.use(config => {
    console.log('Making request to:', config.url);
    return config;
});

// Use with EdgeGrid
var eg = new EdgeGrid(
    'your-client-token',
    'your-client-secret', 
    'your-access-token',
    'your-host.luna.akamaiapis.net',
    false, // debug
    undefined, // max_body
    customAxios // custom axios instance
);
```

#### Using object configuration:

```javascript
var eg = new EdgeGrid({
    path: '/path/to/.edgerc',
    section: 'section-header',
    axiosInstance: customAxios
});
```

If no custom axios instance is provided, the library will use the default axios instance.



## Reporting issues

To report an issue or make a suggestion, create a new [GitHub issue](https://github.com/akamai/AkamaiOPEN-edgegrid-node/issues).

## License

Copyright 2025 Akamai Technologies, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use these files except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.