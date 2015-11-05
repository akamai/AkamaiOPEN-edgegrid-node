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

var assert = require('assert'),
    nock = require('nock'),
    path = require('path'),
    Api = require('../../src/api');

describe('Api', function() {
    beforeEach(function() {
        this.api = new Api(
            'clientToken',
            'clientSecret',
            'accessToken',
            'base.com',
            1000
        );
    });

    describe('.config', function() {
        it('reports the client token', function() {
            assert.equal(this.api.config.client_token, 'clientToken');
        });

        it('reports the client secret', function() {
            assert.equal(this.api.config.client_secret, 'clientSecret');
        });

        it('reports the access token', function() {
            assert.equal(this.api.config.access_token, 'accessToken');
        });

        it('reports the API host', function() {
            assert.equal(this.api.config.host, 'https://base.com');
        });

        it('reports the max body', function() {
            assert.equal(this.api.config.max_body, 1000);
        });

        describe('when it is instantiated with an API host that already contains the protocol', function() {
            it('it does not double declare the protocol', function() {
                this.api = new Api(
                    'clientToken',
                    'clientSecret',
                    'accessToken',
                    'https://base.com'
                );

                assert.equal(this.api.config.host, 'https://base.com');
            });
        });

        describe('when it is instantiated with an object', function() {
            beforeEach(function() {
                this.api = new Api({
                    path: path.resolve(__dirname, '../test_edgerc'),
                    section: 'section'
                });
            });

            it('reports the client token from the edgerc associated with the specified section', function() {
                assert.equal(this.api.config.client_token, 'sectionClientToken');
            });

            it('reports the client secret from the edgerc associated with the specified section', function() {
                assert.equal(this.api.config.client_secret, 'sectionClientSecret');
            });

            it('reports the access token from the edgerc associated with the specified section', function() {
                assert.equal(this.api.config.access_token, 'sectionAccessToken');
            });

            it('reports the API host from the edgerc associated with the specified section', function() {
                assert.equal(this.api.config.host, 'https://sectionexample.luna.akamaiapis.net');
            });

            it('reports the max-body from the edgerc associated with the specified section', function() {
                assert.equal(this.api.config.max_body, 131072);
            });

            describe('when it is instantiated with an object that does not specfy a section', function() {
                beforeEach(function() {
                    this.api = new Api({
                        path: path.resolve(__dirname, '../test_edgerc')
                    });
                });

                it('reports the client token from the edgerc associated with the default section', function() {
                    assert.equal(this.api.config.client_token, 'clientToken');
                });

                it('reports the client secret from the edgerc associated with the default section', function() {
                    assert.equal(this.api.config.client_secret, 'clientSecret');
                });

                it('reports the access token from the edgerc associated with the default section', function() {
                    assert.equal(this.api.config.access_token, 'accessToken');
                });

                it('reports the API host from the edgerc associated with the default section', function() {
                    assert.equal(this.api.config.host, 'https://example.luna.akamaiapis.net');
                });
                it('reports the max-body from the edgerc associated with the default section', function() {
                    assert.equal(this.api.config.max_body, 131072);
                });
            });

            describe('when it is instantiated with an object that does not specify a path nor a section', function() {
                it('throws the appropriate error', function() {
                    assert.throws(
                        function() {
                            return new Api({});
                        },
                        /No edgerc path/
                    );
                });
            });

            describe('when it is instantiated with an object that specifies an inadequate path', function() {
                it('throws the appropriate error', function() {
                    assert.throws(
                        function() {
                            return new Api({
                                path: ''
                            });
                        },
                        /No edgerc path/
                    );
                });
            });
        });
    });

    describe('when it is not instantiated with valid credentials', function() {
        it('throws the appropriate error', function() {
            assert.throws(
                function() {
                    return new Api();
                },
                /Insufficient Akamai credentials/
            );
        });
    });

    describe('#auth', function() {
        describe('when minimal request options are passed', function() {
            beforeEach(function() {
                this.api.auth({
                    path: '/foo'
                });
            });

            it('adds an Authorization header to the request it is passed', function() {
                assert.equal(typeof this.api.request.headers.Authorization === 'string', true);
            });

            it('ensures a default Content-Type of application/json', function() {
                assert.equal(this.api.request.headers['Content-Type'], 'application/json');
            });

            it('ensures a default GET method', function() {
                assert.equal(this.api.request.method, 'GET');
            });

            it('ensures a default empty body', function() {
                assert.equal(this.api.request.body, '');
            });

            it('ensures a url is properly declared', function() {
                assert.equal(this.api.request.url, 'https://base.com/foo');
            });
        });

        describe('when more specific request options are passed', function() {
            beforeEach(function() {
                this.api.auth({
                    path: '/foo',
                    method: 'POST',
                    body: {
                        foo: 'bar'
                    },
                    somethingArbitrary: 'someValue'
                });
            });

            it('adds an Authorization header to the request it is passed', function() {
                assert.equal(typeof this.api.request.headers.Authorization === 'string', true);
            });

            it('ensures a default Content-Type of application/json', function() {
                assert.equal(this.api.request.headers['Content-Type'], 'application/json');
            });

            it('uses the specified GET method', function() {
                assert.equal(this.api.request.method, 'POST');
            });

            it('uses the specified body parsed as a key/value pair string', function() {
                assert.equal(this.api.request.body, 'foo=%22bar%22&');
            });

            it('extends the default request options with any others specified', function() {
                assert.equal(this.api.request.somethingArbitrary, 'someValue');
            });
        });
    });

    describe('#send', function() {
        describe('when authentication is done with a simple options object specifying only a path', function() {
            beforeEach(function() {
                var akamaiResp = nock('https://base.com')
                    .get('/foo')
                    .reply(200, {
                        foo: 'bar'
                    });
            });

            it('sends the HTTP GET request created by #auth', function(done) {
                this.api.auth({
                    path: '/foo'
                });

                this.api.send(function(data, resp) {
                    assert.equal(JSON.parse(data).foo, 'bar');
                    done();
                });
            });
        });

        describe('when authentication is done with a more complex options object specifying only a path', function() {
            beforeEach(function() {
                var akamaiResp = nock('https://base.com')
                    .post('/foo')
                    .reply(200, {
                        foo: 'bar'
                    });
            });

            it('sends the HTTP created by #auth', function(done) {
                this.api.auth({
                    path: '/foo',
                    method: 'POST'
                });

                this.api.send(function(data, resp) {
                    assert.equal(JSON.parse(data).foo, 'bar');
                    done();
                });
            });
        });

        describe('when the initial request redirects', function() {
            it('correctly follows the redirect and re-signs the request', function(done) {
                nock('https://base.com')
                    .get('/foo')
                    .reply(302, undefined, {
                        'Location': 'https://base.com/bar'
                    })
                    .get('/bar')
                    .reply(200, {
                        bar: 'bim'
                    });

                this.api.auth({
                    path: '/foo',
                });

                this.api.send(function(data, resp) {
                    assert.equal(JSON.parse(data).bar, 'bim');
                    done();
                });
            });
        })
    });
});
