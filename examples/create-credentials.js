// This example creates your new API client credentials.
//
// To run this example:
//
// 1. Specify the path to your `.edgerc` file and the section header of the set of credentials to use.
//
// The defaults here expect the `.edgerc` at your home directory and use the credentials under the heading of `default`.
//
// 2. Open a Terminal or shell instance and run "node examples/create-credentials.js".
//
// A successful call returns a new API client with its `credentialId`. Use this ID in both the update and delete examples.
//
// For more information on the call used in this example, see https://techdocs.akamai.com/iam-api/reference/post-self-credentials.

var EdgeGrid = require('akamai-edgegrid');

var eg = new EdgeGrid({
  path: '~/.edgerc',
  section: 'default',
  debug: true
});

eg.send({
  path: '/identity-management/v3/api-clients/self/credentials',
  method: 'POST',
  headers: {
    'Accept': "application/json"
  },
  body: {}
}, function(error, response, body) {
  console.log(body, error);
});