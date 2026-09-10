// This example returns a list of your API client credentials.
//
// To run this example:
//
// 1. Specify the path to your `.edgerc` file and the section header of the set of credentials to use.
//
// The defaults here expect the `.edgerc` at your home directory and use the credentials under the heading of `default`.
//
// 2. Open a Terminal or shell instance and run "node example/get-credentials.js".
//
// A successful call returns your credentials grouped by `credentialId`.
//
// For more information on the call used in this example, see https://techdocs.akamai.com/iam-api/reference/get-self-credentials.


var EdgeGrid = require('akamai-edgegrid');

var eg = new EdgeGrid({
  path: '~/.edgerc',
  section: 'default'
});

eg.send({
  path: '/identity-management/v3/api-clients/self/credentials',
  method: 'GET',
  headers: {
    'Accept': "application/json"
  },
  body: {}
}, function(error, response, body) {
  console.log(body, error);
});