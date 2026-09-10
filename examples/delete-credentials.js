// This example deletes your API client credentials.
//
// To run this example:
//
// 1. Specify the path to your `.edgerc` file and the section header of the set of credentials to use.
//
// The defaults here expect the `.edgerc` at your home directory and use the credentials under the heading of `default`.
//
// 2. Add the `credentialId` from the update example to the path. You can only delete inactive credentials. Sending the request on an active set will return a 400. Use the update credentials example for deactivation.
//
// **Important:** Don't use the credentials you're actively using when deleting a set of credentials. Otherwise, you'll block your access to the Akamai APIs.
//
// 3. Open a Terminal or shell instance and run "node example/delete-credentials.js".
//
// A successful call returns an empty response body.
//
// For more information on the call used in this example, see https://techdocs.akamai.com/iam-api/reference/delete-self-credential.


var EdgeGrid = require('akamai-edgegrid');

var eg = new EdgeGrid({
  path: '~/.edgerc',
  section: 'default'
});

eg.send({
  path: '/identity-management/v3/api-clients/self/credentials/123456',
  method: 'DELETE',
  headers: {
    'Accept': "application/json"
  },
  body: {}
}, function(error, response, body) {
  console.log(body, error);
});