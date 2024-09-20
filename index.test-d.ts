import { expectType } from 'tsd';
import EdgeGrid = require('.')

const eg = new EdgeGrid({
    path: '/path/to/.edgerc',
    section: 'section-name'
});

expectType<EdgeGrid>(eg)

var req = {
    path: '/identity-management/v3/user-profile',
    method: 'GET',
    headers: {},
    body: 'bodyData'
}
expectType<EdgeGrid>(eg.auth(req))

expectType<EdgeGrid>(eg.send((error, resp, body) => console.log(body)))