import { expectType } from 'tsd';
import EdgeGrid = require('.')

const eg = new EdgeGrid({
    path: '/path/to/.edgerc',
    section: 'section-header'
});

expectType<EdgeGrid>(eg)

var req: EdgeGrid.EdgeGridRequest = {
    path: '/identity-management/v3/user-profile',
    method: 'GET',
    headers: {},
    body: {}
}
expectType<Promise<EdgeGrid.SendResult>>(eg.send(req))
expectType<EdgeGrid>(eg.send(req, (error, resp, body) => console.log(body)))