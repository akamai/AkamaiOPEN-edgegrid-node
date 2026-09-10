// This example updates the credentials from the create credentials example.
//
// To run this example:
//
// 1. Specify the path to your `.edgerc` file and the section header of the set of credentials to use.
//
// The defaults here expect the `.edgerc` at your home directory and use the credentials under the heading of `default`.
//
// 2. Add the `credentialId` for the set of credentials created using the create example as a path parameter.
//
// 3. Edit the `expiresOn` date to today's date. Optionally, you can change the `description` value.
//
// **Important:** Don't use the credentials you're actively using when inactivating a set of credentials. Otherwise, you'll block your access to the Akamai APIs.
//
// 4. Open a Terminal or shell instance and run "node example/update-credentials.js".
//
// A successful call returns an object with modified credentials.
//
// For more information on the call used in this example, see https://techdocs.akamai.com/iam-api/reference/put-self-credential.

var EdgeGrid = require('akamai-edgegrid');

var eg = new EdgeGrid({
  path: '~/.edgerc',
  section: 'default',
  debug: true
});

eg.send({
  path: '/identity-management/v3/api-clients/self/credentials/123456',
  method: 'PUT',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  body: {
    description: 'Update this credential',
    status: 'INACTIVE',
    expiresOn: '2024-12-25T22:09:24.000Z' // the date cannot be more than two years out or it will return a 400
 }
}, function(error, response, body) {
  console.log(error, body);
});