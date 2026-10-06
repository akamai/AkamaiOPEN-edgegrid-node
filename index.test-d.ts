import { expectType } from 'tsd';
import EdgeGrid = require('.')

const eg = new EdgeGrid({
    path: '/path/to/.edgerc',
    section: 'section-header'
});

expectType<EdgeGrid>(eg)

// positional string-args constructor overload
expectType<EdgeGrid>(new EdgeGrid('clientToken', 'clientSecret', 'accessToken', 'host.example.com'));
expectType<EdgeGrid>(new EdgeGrid('clientToken', 'clientSecret', 'accessToken', 'host.example.com', 131072));

// @ts-expect-error - options object form rejects unknown/misspelled properties
new EdgeGrid({ path: '/path/to/.edgerc', sectionn: 'typo' });
// @ts-expect-error - string-args form requires all four positional credentials
new EdgeGrid('clientToken', 'clientSecret');

const req: EdgeGrid.EdgeGridRequest = {
    path: '/identity-management/v3/user-profile',
    method: 'GET',
    headers: {},
    body: {}
}
expectType<Promise<EdgeGrid.SendResult>>(eg.send(req))
expectType<EdgeGrid>(eg.send(req, (error, resp, body) => console.log(body)))

// @ts-expect-error - send() requires a 'path' property
eg.send({ method: 'GET' });

// _dispatcher accepts any object that structurally satisfies HttpDispatcher
const mockDispatcher: EdgeGrid.HttpDispatcher = {
    dispatch(_options: object, _handler: object): boolean { return true; }
};
expectType<EdgeGrid.HttpDispatcher | null | undefined>(eg._dispatcher)
eg._dispatcher = mockDispatcher;
eg._dispatcher = null;
eg._dispatcher = undefined;

// _dispatcher rejects objects that don't structurally satisfy HttpDispatcher
// @ts-expect-error - _dispatcher requires a dispatch method
eg._dispatcher = { notDispatch: () => true };
