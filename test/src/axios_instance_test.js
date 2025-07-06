const assert = require("assert"),
    EdgeGrid = require('../../src/api.js'),
    axios = require('axios'),
    nock = require('nock');

describe('Axios Instance Injection', function () {
    const testConfig = {
        client_token: "akab-client-token-xxx-xxxxxxxxxxxxxxxx",
        client_secret: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=",
        access_token: "akab-access-token-xxx-xxxxxxxxxxxxxxxx",
        host: "https://akaa-baseurl-xxxxxxxxxxx-xxxxxxxxxxxxx.luna.akamaiapis.net/"
    };

    beforeEach(function() {
        nock.cleanAll();
    });

    afterEach(function() {
        nock.cleanAll();
    });

    describe('Custom axios instance injection', function () {
        it('should use custom axios instance when provided via string parameters', function () {
            const customAxios = axios.create();
            const eg = new EdgeGrid(
                testConfig.client_token,
                testConfig.client_secret,
                testConfig.access_token,
                testConfig.host,
                false, // debug
                undefined, // max_body
                customAxios // axiosInstance
            );
            assert.strictEqual(eg.axiosInstance, customAxios);
            assert.notStrictEqual(eg.axiosInstance, axios);
        });
        it('should use default axios instance when no custom instance provided via string parameters', function () {
            const eg = new EdgeGrid(
                testConfig.client_token,
                testConfig.client_secret,
                testConfig.access_token,
                testConfig.host
            );
            assert.strictEqual(eg.axiosInstance, axios);
        });
    });

    describe('Custom axios instance functionality', function () {
        it('should use custom axios instance for making requests', function (done) {
            this.timeout(5000);
            let customAxiosCalled = false;
            const realAxiosInstance = axios.create();
            // Create a proxy to wrap the axios instance and detect calls
            const customAxios = new Proxy(realAxiosInstance, {
                apply(target, thisArg, argumentsList) {
                    customAxiosCalled = true;
                    return Reflect.apply(target, thisArg, argumentsList);
                }
            });
            nock('https://akaa-baseurl-xxxxxxxxxxx-xxxxxxxxxxxxx.luna.akamaiapis.net')
                .get('/test-endpoint')
                .reply(200, { success: true });
            const eg = new EdgeGrid(
                testConfig.client_token,
                testConfig.client_secret,
                testConfig.access_token,
                testConfig.host,
                false,
                undefined,
                customAxios
            );
            eg.auth({
                path: '/test-endpoint',
                method: 'GET',
                headers: {
                    'Accept': "application/json"
                }
            });
            eg.send(function(error, response, body) {
                assert.strictEqual(customAxiosCalled, true);
                assert.strictEqual(error, null);
                done();
            });
        });
        it('should use custom axios instance with custom configuration', function (done) {
            const customAxios = axios.create({
                timeout: 5000,
                headers: {
                    'X-Custom-Header': 'test-value'
                }
            });
            let customHeadersSent = false;
            nock('https://akaa-baseurl-xxxxxxxxxxx-xxxxxxxxxxxxx.luna.akamaiapis.net')
                .get('/test-endpoint')
                .reply(function(uri, requestBody) {
                    if (this.req.headers['x-custom-header'] === 'test-value') {
                        customHeadersSent = true;
                    }
                    return [200, { success: true }];
                });
            const eg = new EdgeGrid(
                testConfig.client_token,
                testConfig.client_secret,
                testConfig.access_token,
                testConfig.host,
                false,
                undefined,
                customAxios
            );
            eg.auth({
                path: '/test-endpoint',
                method: 'GET',
                headers: {
                    'Accept': "application/json"
                }
            });
            eg.send(function(error, response, body) {
                assert.strictEqual(customHeadersSent, true);
                assert.strictEqual(error, null);
                done();
            });
        });
        it('should use custom axios instance with interceptors', function (done) {
            const customAxios = axios.create();
            let interceptorCalled = false;
            customAxios.interceptors.request.use(function(config) {
                interceptorCalled = true;
                config.headers['X-Interceptor-Test'] = 'interceptor-value';
                return config;
            });
            nock('https://akaa-baseurl-xxxxxxxxxxx-xxxxxxxxxxxxx.luna.akamaiapis.net')
                .get('/test-endpoint')
                .reply(function(uri, requestBody) {
                    if (this.req.headers['x-interceptor-test'] === 'interceptor-value') {
                        return [200, { success: true }];
                    }
                    return [400, { error: 'Interceptor header not found' }];
                });
            const eg = new EdgeGrid(
                testConfig.client_token,
                testConfig.client_secret,
                testConfig.access_token,
                testConfig.host,
                false,
                undefined,
                customAxios
            );
            eg.auth({
                path: '/test-endpoint',
                method: 'GET',
                headers: {
                    'Accept': "application/json"
                }
            });
            eg.send(function(error, response, body) {
                assert.strictEqual(interceptorCalled, true);
                assert.strictEqual(error, null);
                assert.strictEqual(response.status, 200);
                done();
            });
        });
        it('should handle errors from custom axios instance', function (done) {
            const customAxios = axios.create();
            nock('https://akaa-baseurl-xxxxxxxxxxx-xxxxxxxxxxxxx.luna.akamaiapis.net')
                .get('/test-endpoint')
                .replyWithError('Network Error');
            const eg = new EdgeGrid(
                testConfig.client_token,
                testConfig.client_secret,
                testConfig.access_token,
                testConfig.host,
                false,
                undefined,
                customAxios
            );
            eg.auth({
                path: '/test-endpoint',
                method: 'GET',
                headers: {
                    'Accept': "application/json"
                }
            });
            eg.send(function(error, response, body) {
                assert.notStrictEqual(error, null);
                assert.strictEqual(error.message, 'Network Error');
                done();
            });
        });
        it('should maintain backward compatibility with default axios', function (done) {
            nock('https://akaa-baseurl-xxxxxxxxxxx-xxxxxxxxxxxxx.luna.akamaiapis.net')
                .get('/test-endpoint')
                .reply(200, { success: true });
            const eg = new EdgeGrid(
                testConfig.client_token,
                testConfig.client_secret,
                testConfig.access_token,
                testConfig.host
            );
            eg.auth({
                path: '/test-endpoint',
                method: 'GET',
                headers: {
                    'Accept': "application/json"
                }
            });
            eg.send(function(error, response, body) {
                assert.strictEqual(error, null);
                assert.strictEqual(response.status, 200);
                done();
            });
        });
    });
}); 