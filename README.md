# EdgeGrid for Node.js

[![Build Status](https://travis-ci.org/akamai/AkamaiOPEN-edgegrid-node.svg?branch=master)](https://travis-ci.org/akamai/AkamaiOPEN-edgegrid-node)

This library implements an Authentication handler for the [Akamai OPEN](hhttps://developer.akamai.com/introduction/) EdgeGrid Authentication scheme in Node.js For more infomation visit the [Akamai {OPEN} Developer Portal](https://developer.akamai.com/).

## Installation

`npm install --save edgegrid`

## Example

#### Credentials

To use the Akamai OPEN APIs you must first register and authorize a set of credentials through the [LUNA Control Center](https://control.akamai.com/homeng/view/main). More information on creating and authorizing credentials can be found at [https://developer.akamai.com/introduction/Prov_Creds.html](https://developer.akamai.com/introduction/Prov_Creds.html)

#### .edgerc Authentication

The preferred method of using the library involves providing the path to an '.edgerc' file which contains the authenticaion credentials which will be used to sign your requests.

__NOTE__: Requests to the API are signed with a timestamp and therefore should be executed immediately.

```javascript
var EdgeGrid = require('edgegrid');

var data = 'bodyData';

// Supply the path to your .edgerc file and name
// of the section with authorization to the client
// you are calling (default section is 'default')
var eg = new EdgeGrid({
  path: '/path/to/.edgerc',
  section: 'section-name'
});

eg.auth({
  path: '/diagnostic-tools/v1/locations',
  method: 'GET',
  headers: {},
  body: data
});

eg.send(function(error, response, body) {
  console.log(body);
});
```

An `.edgerc` file contains sections of credentials and is usually hosted in your home directory:

```plaintext
[default]
host = akaa-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.luna.akamaiapis.net/
client_token = akab-XXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXX
client_secret = XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
access_token = akab-XXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXX
max-body = 131072

[section-name]
host = akaa-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.luna.akamaiapis.net/
client_token = akab-XXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXX
client_secret = XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
access_token = akab-XXXXXXXXXXXXXXXX-XXXXXXXXXXXXXXXX
max-body = 131072
```

#### Manual Authentication

In addition supplying credentials via an .edgerc file as above, you may also authenticate manually by hard-coding your credential values and passing them to the EdgeGrid client:

```javascript
var clientToken = "akab-client-token-xxx-xxxxxxxxxxxxxxxx",
    clientSecret = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=",
    accessToken = "akab-access-token-xxx-xxxxxxxxxxxxxxxx",
    baseUri = "https://akaa-baseurl-xxxxxxxxxxx-xxxxxxxxxxxxx.luna.akamaiapis.net/";

var eg = new EdgeGrid(clientToken, clientSecret, accessToken, baseUri);
```

#### Chaining

Calls using the edgegrid client can also be chained as per the following;

```javascript
...
eg.auth({
  path: 'billing-usage/v1/products',
  method: 'POST',
  headers: {},
  body: data
}).send(function (error, response, body) {
  console.log(body);
});
```
#### Headers

Headers for the request must be supplied in an object as name : value pairs. You do not need to supply form-data headers or content lengths - that will cause authentication headers on the API.

```javascript
eg.auth({
  path: 'billing-usage/v1/products',
  method: 'POST',
  headers: {
    'Content-Type': "application/json"
  }
});
```

#### Body Data

The request BODY can be provided as either an object or as a POST data formed string.


```javascript
// Object
eg.auth({
  path: "/ccu/v2/queues/default",
  method: "POST",
  body: {
    action: "invalidate",
    objects: [
      "https://someurl.com/path"
    ]
  }
});
```
  
#### Query String Pameters

Query string parameters must be supplied in an Object as name : value pairs and 
passed to the `auth` method under the `qs` property.

```javascript
eg.auth({
  path: 'billing-usage/v1/dig',
  method: 'GET',
  headers: {},
  body: {},
  qs: {
    "hostname": "developer.akamai.com.",
    "queryType": "A",
    "location": "Florida, United States"
  }}
}).send(function (error, response, body) {
  console.log(body);
});

// Produces request url similar to:
// http://hostaddress.luna.akamaiapis.net/diagnostic-tools/v1/dig?hostname=developer.akamai.com&queryType=A&location=location
```
#### Encoding

When interacting with binary data, such as during retrieval of PDF invoices, `encoding` should be specified as `null` during the `auth` method call. Omission of `encoding` will cause an unreadable or blank PDF.

```javascript
const fs = require('fs');
eg.auth({
  path : `/invoicing-api/v2/contracts/${contractId}/invoices/${invoiceNumber}/files/${fileName}`,
  method: 'GET',
  encoding: null,
  body: {},
  headers: {},
  qs: {
  }
}).send((data,response) => {
  fs.writeFile(`./${fileName}`, response.body,'binary',(err) => {
    if (err){
      return console.log(err);
    }
    console.log('File was saved!');
  });
});  
```

#### Debug

Edgegrid accepts a --debug flag which, when passed, will cause the script to
output additional information about the reqest that can be useful in debugging.

The debug option can be passed in as part of the Edgegrid instantiation object
or as a command line argument. 

```javascript
// Set debug via Edgegrid property
var eg = new EdgeGrid({
  path: edgercPath,
  section: sectionName,
  debug: true
});
```

```bash
// Set debug via commmand line argument
$ node src/diagnostic-tools.js --debug

Preparedbody:  {}
REQUEST { path: '/diagnostic-tools/v1/locations',
  method: 'GET',
  headers: { Authorization: 'EG1-HMAC-SHA256 client_token=akab-zxhviyo3itu3dh4g-xubwmuzfq6veetfo;access_token=akab-km6yeorfbbmc6g2e-lz22p4nksvah5vhk;timestamp=20160204T16:28:47+0000;nonce=d617f5c5-19ac-4141-a35c-9e397daa0e2f;signature=gFDfbpLVPQ7swJblVgCOLcgDZ6K86MchOTXoTpmptkk=' },
  body: '{}',
  url: 'https://akab-onuzphpk5jotmfmj-couz3cnikiderksx.luna.akamaiapis.net/diagnostic-tools/v1/locations',
  followRedirect: false,
  callback: [Function: bound ] }
REQUEST make request https://akab-onuzphpk5jotmfmj-couz3cnikiderksx.luna.akamaiapis.net/diagnostic-tools/v1/locations
REQUEST onRequestResponse https://akab-onuzphpk5jotmfmj-couz3cnikiderksx.luna.akamaiapis.net/diagnostic-tools/v1/locations 200 { server: 'Apache-Coyote/1.1',
  'x-ratelimit-limit': '180',
  'x-ratelimit-remaining': '179',
  'x-content-type-options': 'nosniff',
  'content-type': 'application/json;charset=UTF-8',
  'content-length': '1651',
  date: 'Thu, 04 Feb 2016 16:28:48 GMT',
  connection: 'close' }
REQUEST finish init function https://akab-onuzphpk5jotmfmj-couz3cnikiderksx.luna.akamaiapis.net/diagnostic-tools/v1/locations
REQUEST response end https://akab-onuzphpk5jotmfmj-couz3cnikiderksx.luna.akamaiapis.net/diagnostic-tools/v1/locations 200 { server: 'Apache-Coyote/1.1',
  'x-ratelimit-limit': '180',
  'x-ratelimit-remaining': '179',
  'x-content-type-options': 'nosniff',
  'content-type': 'application/json;charset=UTF-8',
  'content-length': '1651',
  date: 'Thu, 04 Feb 2016 16:28:48 GMT',
  connection: 'close' }
REQUEST end event https://akab-onuzphpk5jotmfmj-couz3cnikiderksx.luna.akamaiapis.net/diagnostic-tools/v1/locations
REQUEST has body https://akab-onuzphpk5jotmfmj-couz3cnikiderksx.luna.akamaiapis.net/diagnostic-tools/v1/locations 1651
REQUEST emitting complete https://akab-onuzphpk5jotmfmj-couz3cnikiderksx.luna.akamaiapis.net/diagnostic-tools/v1/locations
```

## Reporting a bug

To report a bug simply create a new GitHub Issue and describe your problem or suggestion.

Before reporting a bug look around to see if there are any open or closed tickets that cover your issue, and check the [Akamai OPEN Developer Community](https://community.akamai.com/community/developer) to see if there are any posts that might address your concern. And remember the wisdom: pull request > bug report > tweet!

## Contributors

A huge thanks to [Jonatahn Bennett](https://github.com/JonathanBennett) for creating and maintaining the original iteration of this project and to the following contributors:

* [@dariusk](https://github.com/dariusk)
* [@mdb](https://github.com/mdb)
* [@ktyacke](https://github.com/ktyacke)

__NOTE__: If you'd like to contribute please feel free to create a fork and submit a pull request.

## License

Copyright 2016 Akamai Technologies, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
