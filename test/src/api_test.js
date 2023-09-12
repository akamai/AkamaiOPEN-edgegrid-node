// Copyright 2014 Akamai Technologies, Inc. All Rights Reserved
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const assert = require('assert'),
    nock = require('nock'),
    path = require('path'),
    Api = require('../../src/api');

describe('Api', function () {
    beforeEach(function () {
        this.api = new Api(
            'clientToken',
            'clientSecret',
            'accessToken',
            'base.com',
            false,
        );
    });

    // clear env variables which might be set in tests
    beforeEach(function () {
        process.env['AKAMAI_HOST'] = '';
        process.env['AKAMAI_CLIENT_TOKEN'] = '';
        process.env['AKAMAI_CLIENT_SECRET'] = '';
        process.env['AKAMAI_ACCESS_TOKEN'] = '';
    });

    describe('.config', function () {
        it('reports the client token', function () {
            assert.strictEqual(this.api.config.client_token, 'clientToken');
        });

        it('reports the client secret', function () {
            assert.strictEqual(this.api.config.client_secret, 'clientSecret');
        });

        it('reports the access token', function () {
            assert.strictEqual(this.api.config.access_token, 'accessToken');
        });

        it('reports the API host', function () {
            assert.strictEqual(this.api.config.host, 'https://base.com');
        });

        describe('when it is instantiated with an API host that already contains the protocol', function () {
            it('it does not double declare the protocol', function () {
                this.api = new Api(
                    'clientToken',
                    'clientSecret',
                    'accessToken',
                    'https://base.com'
                );

                assert.strictEqual(this.api.config.host, 'https://base.com');
            });
        });

        describe('when it is instantiated with an object', function () {
            beforeEach(function () {
                this.api = new Api({
                    path: path.resolve(__dirname, '../test_edgerc'),
                    section: 'section'
                });
            });

            it('reports the client token from the edgerc associated with the specified section', function () {
                assert.strictEqual(this.api.config.client_token, 'sectionClientToken');
            });

            it('reports the client secret from the edgerc associated with the specified section', function () {
                assert.strictEqual(this.api.config.client_secret, 'sectionClientSecret');
            });

            it('reports the access token from the edgerc associated with the specified section', function () {
                assert.strictEqual(this.api.config.access_token, 'sectionAccessToken');
            });

            it('reports the API host from the edgerc associated with the specified section', function () {
                assert.strictEqual(this.api.config.host, 'https://sectionexample.luna.akamaiapis.net');
            });

            it('reports the max-body from the edgerc associated with the specified section', function() {
                assert.equal(this.api.config.max_body, 131072);
            });

            describe('when it is instantiated with an object with custom `max-body` value', function () {
                beforeEach(function () {
                    this.api = new Api({
                        path: path.resolve(__dirname, '../test_edgerc'),
                        section: 'custom:max-body'
                    });
                });

                it('reports the client token from the edgerc associated with the specified section with custom `max-body`', function () {
                    assert.strictEqual(this.api.config.client_token, 'sectionClientToken');
                });

                it('reports the client secret from the edgerc associated with the specified section with custom `max-body`', function () {
                    assert.strictEqual(this.api.config.client_secret, 'sectionClientSecret');
                });

                it('reports the access token from the edgerc associated with the specified section with custom `max-body`', function () {
                    assert.strictEqual(this.api.config.access_token, 'sectionAccessToken');
                });

                it('reports the API host from the edgerc associated with the specified section with custom `max-body`', function () {
                    assert.strictEqual(this.api.config.host, 'https://sectionexample.luna.akamaiapis.net');
                });

                it('reports the max-body from the edgerc associated with the specified section with custom `max-body`', function () {
                    assert.equal(this.api.config.max_body, 4096);
                });
            });

            describe('when it is instantiated with an object with custom `max_body` value', function () {
                beforeEach(function () {
                    this.api = new Api({
                        path: path.resolve(__dirname, '../test_edgerc'),
                        section: 'custom:max_body'
                    });
                });

                it('reports the client token from the edgerc associated with the specified section with custom `max_body`', function () {
                    assert.strictEqual(this.api.config.client_token, 'sectionClientToken');
                });

                it('reports the client secret from the edgerc associated with the specified section with custom `max_body`', function () {
                    assert.strictEqual(this.api.config.client_secret, 'sectionClientSecret');
                });

                it('reports the access token from the edgerc associated with the specified section with custom `max_body`', function () {
                    assert.strictEqual(this.api.config.access_token, 'sectionAccessToken');
                });

                it('reports the API host from the edgerc associated with the specified section with custom `max_body`', function () {
                    assert.strictEqual(this.api.config.host, 'https://sectionexample.luna.akamaiapis.net');
                });

                it('reports the max-body from the edgerc associated with the specified section with custom `max_body`', function () {
                    assert.equal(this.api.config.max_body, 8192);
                });
            });

            describe('when it is instantiated with an object without specified `max_body` value', function () {
                beforeEach(function () {
                    this.api = new Api({
                        path: path.resolve(__dirname, '../test_edgerc'),
                        section: 'no-max-body'
                    });
                });

                it('reports the client token from the edgerc associated with the specified section without specified `max_body`', function () {
                    assert.strictEqual(this.api.config.client_token, 'sectionClientToken');
                });

                it('reports the client secret from the edgerc associated with the specified section without specified `max_body`', function () {
                    assert.strictEqual(this.api.config.client_secret, 'sectionClientSecret');
                });

                it('reports the access token from the edgerc associated with the specified section without specified `max_body`', function () {
                    assert.strictEqual(this.api.config.access_token, 'sectionAccessToken');
                });

                it('reports the API host from the edgerc associated with the specified section without specified `max_body`', function () {
                    assert.strictEqual(this.api.config.host, 'https://sectionexample.luna.akamaiapis.net');
                });

                it('reports the max-body from the edgerc associated with the specified section without specified `max_body`', function () {
                    assert.equal(this.api.config.max_body, 131072);
                });
            });

            describe('when it is instantiated with an object that does not specify a section', function () {
                beforeEach(function () {
                    this.api = new Api({
                        path: path.resolve(__dirname, '../test_edgerc')
                    });
                });

                it('reports the client token from the edgerc associated with the default section', function () {
                    assert.strictEqual(this.api.config.client_token, 'clientToken');
                });

                it('reports the client secret from the edgerc associated with the default section', function () {
                    assert.strictEqual(this.api.config.client_secret, 'clientSecret');
                });

                it('reports the access token from the edgerc associated with the default section', function () {
                    assert.strictEqual(this.api.config.access_token, 'accessToken');
                });

                it('reports the API host from the edgerc associated with the default section', function () {
                    assert.strictEqual(this.api.config.host, 'https://example.luna.akamaiapis.net');
                });

                it('reports the max-body from the edgerc associated with the default section', function() {
                    assert.equal(this.api.config.max_body, 131072);
                });
            });

            describe('when it is instantiated with an object that does not specify a path nor a section', function () {
                beforeEach(function () {
                    process.env['AKAMAI_HOST'] = 'https://example.luna.akamaiapis.net';
                    process.env['AKAMAI_CLIENT_TOKEN'] = 'clientToken';
                    process.env['AKAMAI_CLIENT_SECRET'] = 'clientSecret';
                    process.env['AKAMAI_ACCESS_TOKEN'] = 'accessToken';
                    this.api = new Api({});
                });
                it('uses config from env variables with default section', function () {
                    assert.strictEqual(this.api.config.host, "https://example.luna.akamaiapis.net");
                    assert.strictEqual(this.api.config.client_token, "clientToken");
                    assert.strictEqual(this.api.config.client_secret, "clientSecret");
                    assert.strictEqual(this.api.config.access_token, "accessToken");
                    assert.strictEqual(this.api.config.max_body, 131072);
                });
            });

            describe('when it is instantiated with an object that specifies an inadequate path', function () {
                it('throws the appropriate error', function () {
                    assert.throws(
                        function () {
                            return new Api({
                                path: ''
                            });
                        },
                        /Either path to '.edgerc' or environment variables with edgerc configuration has to be provided./
                    );
                });
            });
        });
    });

    describe('when it is not instantiated with valid credentials', function () {
        it('throws the appropriate error', function () {
            assert.throws(
                function () {
                    return new Api();
                },
                /Insufficient Akamai credentials/
            );
        });
    });

    describe('#auth', function () {
        it('should be chainable', function () {
            assert.deepStrictEqual(this.api, this.api.auth({path: '/foo'}));
        });

        describe('when minimal request options are passed', function () {
            beforeEach(function () {
                this.api.auth({
                    path: '/foo'
                });
            });

            it('adds an Authorization header to the request it is passed', function () {
                assert.strictEqual(typeof this.api.request.headers.Authorization === 'string', true);
            });

            it('ensures a default Content-Type of application/json', function () {
                assert.strictEqual(this.api.request.headers['Content-Type'], 'application/json');
            });

            it('ensures a default Accept of application/json', function () {
                assert.strictEqual(this.api.request.headers['Accept'], 'application/json');
            });

            it('ensures a default GET method', function () {
                assert.strictEqual(this.api.request.method, 'GET');
            });

            it('ensures a default undefined body', function () {
                assert.strictEqual(this.api.request.body, undefined);
            });

            it('ensures a url is properly declared', function () {
                assert.strictEqual(this.api.request.url, 'https://base.com/foo');
            });

            it('ensures no User-Agent is added when AkamaiCLI env variables not set', function () {
                assert.ok(!this.api.request.headers.hasOwnProperty('User-Agent'));
            });
        });

        describe('when more specific request options are passed', function () {
            beforeEach(function () {
                this.api.auth({
                    path: '/foo',
                    method: 'POST',
                    body: {
                        foo: 'bar'
                    },
                    somethingArbitrary: 'someValue',
                    headers: {
                        'User-Agent': 'testUserAgent',
                        'Accept': 'text/html'
                    }
                });
            });

            it('adds an Authorization header to the request it is passed', function () {
                assert.strictEqual(typeof this.api.request.headers.Authorization === 'string', true);
            });

            it('ensures a default Content-Type of application/json', function () {
                assert.strictEqual(this.api.request.headers['Content-Type'], 'application/json');
            });

            it('uses the specified POST method', function () {
                assert.strictEqual(this.api.request.method, 'POST');
            });

            it('uses the specified body parsed as a JSON string', function () {
                console.log("BODY: ", this.api.request.body);
                assert.strictEqual(this.api.request.body, '{"foo":"bar"}');
            });

            it('extends the default request options with any others specified', function () {
                assert.strictEqual(this.api.request.somethingArbitrary, 'someValue');
            });

            it('ensures provided User-Agent header is preserved', function () {
                assert.strictEqual(this.api.request.headers['User-Agent'], 'testUserAgent');
            });

            it('ensures provided Accept header is preserved', function () {
                assert.strictEqual(this.api.request.headers['Accept'], 'text/html');
            });
        });

        describe("when gzip response format is expected", function () {
            beforeEach(function () {
                this.api.auth({
                    path: '/foo',
                    body: 'someBody',
                    headers: {
                        'Accept': `application/gzip`,
                        'Content-Type': `application/gzip`
                    }
                });
            });

            it('adds an Authorization header to the request it is passed', function () {
                assert.strictEqual(typeof this.api.request.headers.Authorization === 'string', true);
            });

            it('ensures a default GET method', function () {
                assert.strictEqual(this.api.request.method, 'GET');
            });

            it('ensures the specified body is not modified', function () {
                assert.strictEqual(this.api.request.body, 'someBody');
            });

            it('should return response as buffer', function () {
                assert.strictEqual(this.api.request["responseType"], "arraybuffer");
            });
        });

        describe("when tar+gzip response format is expected", function () {
            beforeEach(function () {
                this.api.auth({
                    path: '/foo',
                    body: 'someBody',
                    headers: {
                        'Accept': `application/tar+gzip`,
                        'Content-Type': `application/tar+gzip`
                    }
                });
            });

            it('adds an Authorization header to the request it is passed', function () {
                assert.strictEqual(typeof this.api.request.headers.Authorization === 'string', true);
            });

            it('ensures a default GET method', function () {
                assert.strictEqual(this.api.request.method, 'GET');
            });

            it('ensures the specified body is not modified', function () {
                assert.strictEqual(this.api.request.body, 'someBody');
            });

            it('should return response as buffer', function () {
                assert.strictEqual(this.api.request["responseType"], "arraybuffer");
            });
        });

        describe("when akamai cli user agent is expected", function () {
            beforeEach(function () {
                process.env['AKAMAI_CLI'] = 'AkamaiCLI';
                process.env['AKAMAI_CLI_VERSION'] = '1.0.0';
                process.env['AKAMAI_CLI_COMMAND'] = 'command';
                process.env['AKAMAI_CLI_COMMAND_VERSION'] = '0.0.1';
            });

            afterEach(function () {
                process.env['AKAMAI_CLI'] = '';
                process.env['AKAMAI_CLI_VERSION'] = '';
                process.env['AKAMAI_CLI_COMMAND'] = '';
                process.env['AKAMAI_CLI_COMMAND_VERSION'] = '';
            });

            describe("when no User-Agent set in the request", function () {
                beforeEach(function () {
                    this.api.auth({
                        path: '/foo'
                    });
                });

                it("should set User-Agent", function () {
                    assert.strictEqual(this.api.request.headers['User-Agent'], 'AkamaiCLI/1.0.0 AkamaiCLI-command/0.0.1');
                });
            });

            describe("when User-Agent is already in the request", function () {
                beforeEach(function () {
                    this.api.auth({
                        path: '/foo',
                        headers: {
                            'User-Agent': 'testAgent'
                        }
                    });
                });

                it("should append to already present User-Agent header", function () {
                    assert.strictEqual(this.api.request.headers['User-Agent'], 'testAgent AkamaiCLI/1.0.0 AkamaiCLI-command/0.0.1');
                });
            });

            describe("when only AkamaiCLI info is set", function () {
                beforeEach(function () {
                    process.env['AKAMAI_CLI_COMMAND'] = '';
                    process.env['AKAMAI_CLI_COMMAND_VERSION'] = '';
                    this.api.auth({
                        path: '/foo'
                    });
                });

                it("should only set AkamaiCLI/version User-Agent", function () {
                    assert.strictEqual(this.api.request.headers['User-Agent'], 'AkamaiCLI/1.0.0');
                });
            });

            describe("when only AkamaiCLI command info is set", function () {
                beforeEach(function () {
                    process.env['AKAMAI_CLI'] = '';
                    process.env['AKAMAI_CLI_VERSION'] = '';
                    this.api.auth({
                        path: '/foo'
                    });
                });

                it("should only set AkamaiCLI/version User-Agent", function () {
                    assert.strictEqual(this.api.request.headers['User-Agent'], 'AkamaiCLI-command/0.0.1');
                });
            });
        });
    });

    describe('#send', function () {

        it('should be chainable', function () {
            assert.deepStrictEqual(this.api, this.api.auth({path: '/foo'}).send());
        });

        describe('when authentication is done with a simple options object specifying only a path', function () {
            beforeEach(function () {
                nock('https://base.com')
                    .get('/foo')
                    .reply(200, {
                        foo: 'bar'
                    });
            });

            it('sends the HTTP GET request created by #auth', function (done) {
                this.api.auth({
                    path: '/foo'
                });

                this.api.send(function (err, resp, body) {
                    assert.strictEqual(JSON.parse(body).foo, 'bar');
                    done();
                });
            });
        });

        describe('when authentication is done with a more complex options object specifying only a path', function () {
            beforeEach(function () {
                nock('https://base.com')
                    .post('/foo')
                    .reply(200, {
                        foo: 'bar'
                    });
            });

            it('sends the HTTP created by #auth', function (done) {
                this.api.auth({
                    path: '/foo',
                    method: 'POST'
                });

                this.api.send(function (err, resp, body) {
                    assert.strictEqual(JSON.parse(body).foo, 'bar');
                    done();
                });
            });
        });

        describe('when the initial request redirects', function () {
            it('correctly follows the redirect and re-signs the request', function (done) {
                let authHeader;
                nock('https://base.com')
                    .get('/foo')
                    .reply(function () {
                        authHeader = this.req.headers["authorization"];
                        return [
                            302,
                            '',
                            {'location': 'https://base.com/bar'}
                        ];
                    })
                    .get('/bar')
                    .reply(function () {
                        assert.notStrictEqual(this.req.headers["authorization"], authHeader);
                        return [
                            200,
                            {someKey: 'value'}
                        ];
                    });

                this.api.auth({
                    path: '/foo',
                });

                this.api.send(function (err, resp, body) {
                    assert.strictEqual(JSON.parse(body).someKey, 'value');
                    done();
                });
            });
        });
        describe('when the initial request fails', function () {
            it('correctly handles the error in the callback', function (done) {
                nock('https://base.com')
                    .get('/foo')
                    .replyWithError('something awful happened');

                this.api.auth({
                    path: '/foo',
                });

                this.api.send(function (data) {
                    assert.strictEqual(data.message, 'something awful happened');
                    done();
                });
            });
        });
    });
});
