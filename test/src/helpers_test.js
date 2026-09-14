const assert = require('assert'),
    helpers = require('../../src/helpers'),
    os = require('os');

describe('helpers', function () {
    describe('#base64Sha256', function () {
        it('returns a base 64 encoded Sha256 of the string it is passed', function () {
            assert.strictEqual(helpers.base64Sha256('foo'), 'LCa0a2j/xo/5m0U8HTBBNBNCLXBkg7+g+YpeiGJm564=');
        });
    });

    describe('#base64HmacSha256', function () {
        it('returns a base 64 encoded Hmac Sha256 of the message and key it is passed', function () {
            assert.strictEqual(helpers.base64HmacSha256('message', 'secret'), 'i19IcCmVwVmMVz2x4hhmqbgl1KeU0WnXBgoDYFeWNgs=');
        });
    });

    describe('#canonicalizeHeaders', function () {
        it('turns the headers into a tab separate string of key/value pairs', function () {
            assert.strictEqual(helpers.canonicalizeHeaders({
                Foo: 'bar',
                Baz: '  baz\t zoo   '
            }), 'foo:bar\tbaz:baz zoo');
        });
    });

    describe('#contentHash', function () {
        describe('when the request is not a POST', function () {
            it('returns an empty string', function () {
                assert.strictEqual(helpers.contentHash({
                    method: 'GET'
                }), '');
            });
        });

        describe('when the request is a POST', function () {
            it('returns a base64 encoded sha256 of the body', function () {
                assert.strictEqual(helpers.contentHash({
                    body: 'foo',
                    method: 'POST'
                }), 'LCa0a2j/xo/5m0U8HTBBNBNCLXBkg7+g+YpeiGJm564=');
            });

            ['application/gzip', 'application/tar+gzip'].forEach(function (contentType) {
                it(`does not serialize a ${contentType} bundle`, function () {
                    const body = new Uint8Array([0x1f, 0x8b, 0x08, 0x00]);
                    const request = {
                        body,
                        method: 'POST',
                        headers: { 'Content-Type': contentType }
                    };

                    assert.strictEqual(
                        helpers.contentHash(request),
                        helpers.base64Sha256(body)
                    );
                    assert.strictEqual(request.body, body);
                });
            });
        });
    });

    describe('#isBinaryBundle', function () {
        it('recognizes tar+gzip content types with parameters case-insensitively', function () {
            assert.strictEqual(
                helpers.isBinaryBundle(new Uint8Array(), 'Application/Tar+Gzip; charset=binary'),
                true
            );
        });
    });

    describe('#dataToSign', function () {
        it('properly formats the request data to sign', function () {
            assert.strictEqual(helpers.dataToSign({
                method: 'get',
                url: 'http://example.com/foo'
            }, 'authHeader'), 'GET\thttp\texample.com\t/foo\t\t\tauthHeader');
        });

        it('properly formats the request data when passing headersToSign', function () {
            assert.strictEqual(helpers.dataToSign({
                    method: 'get',
                    url: 'http://example.com/foo',
                    headersToSign: {
                        foo: "bar"
                    }
                },
                'authHeader'),
                'GET\thttp\texample.com\t/foo\tfoo:bar\t\tauthHeader'
            );
        });
    });

    describe('#signingKey', function () {
        it('returns the proper signing key', function () {
            assert.strictEqual(helpers.signingKey('timestamp', 'secret'), 'ydMIxJIPPypuUya3KZGJ0qCRwkYcKrFn68Nyvpkf1WY=');
        });
    });

    describe('#isRedirect', function () {
        describe('when it is passed a status code indicating a redirect', function () {
            it('returns true when it is passed a 300', function () {
                assert.strictEqual(helpers.isRedirect(300), true);
            });

            it('returns true when it is passed a 301', function () {
                assert.strictEqual(helpers.isRedirect(301), true);
            });

            it('returns true when it is passed a 302', function () {
                assert.strictEqual(helpers.isRedirect(302), true);
            });

            it('returns true when it is passed a 303', function () {
                assert.strictEqual(helpers.isRedirect(303), true);
            });

            it('returns true when it is passed a 307', function () {
                assert.strictEqual(helpers.isRedirect(307), true);
            });
        });

        describe('when it is passed a status code that does not indicate a redirect', function () {
            it('returns false when it is passed a 200', function () {
                assert.strictEqual(helpers.isRedirect(200), false);
            });
        });
    });

    describe('#resolveHome', function () {
        it('resolves ~', function () {
            assert.strictEqual(helpers.resolveHome('~/testdir'), os.homedir()+"/testdir");
        });

        it('resolves path without ~', function () {
            assert.strictEqual(helpers.resolveHome('some/path/testdir'), "some/path/testdir");
        });
    });

    describe('#extendHeaders', function () {
        describe('when Content-Type is not provided', function () {
            it('should set application/json as default', function () {
                headers = helpers.extendHeaders({})
                assert.strictEqual(headers['Content-Type'], 'application/json')
            })
        })

        describe('when Content-Type is provided', function () {
            it('should preserve the value', function () {
                contentType = 'text/html'
                headers = helpers.extendHeaders({
                    'Content-Type': contentType
                })
                assert.strictEqual(headers['Content-Type'], contentType)
            })
        })

        describe('when Accept is not provided', function () {
            it('should set aapplication/json as default', function () {
                headers = helpers.extendHeaders({})
                assert.strictEqual(headers['Accept'], 'application/json')
            })
        })

        describe('when Accept is provided', function () {
            it('should preserve the value', function () {
                accept = 'text/html'
                headers = helpers.extendHeaders({
                    'Accept': accept
                })
                assert.strictEqual(headers['Accept'], accept)
            })
        })

        describe('when akamai cli user agent env is not provided', function () {
            describe('when user agent is set in headers', function () {
                it('should preserve the value and not append anything', function () {
                    testAgent = 'testAgent/1.0.0'
                    headers = helpers.extendHeaders({
                        'User-Agent': testAgent
                    });
                    assert.strictEqual(headers['User-Agent'], testAgent)
                });
            });

            describe('when no user agent is set in headers', function () {
                it('should do nothing', function () {
                    headers = helpers.extendHeaders({})
                    assert.equal(headers.hasOwnProperty('User-Agent'), false)
                });
            });
        });

        describe('when akamai cli user agent env is provided', function () {
            beforeEach(function () {
                process.env['AKAMAI_CLI'] = 'AkamaiCLI';
                process.env['AKAMAI_CLI_VERSION'] = '1.0.0';
                process.env['AKAMAI_CLI_COMMAND'] = 'command';
                process.env['AKAMAI_CLI_COMMAND_VERSION'] = '0.0.1';
                this.akamaiCLIAgent = 'AkamaiCLI/1.0.0 AkamaiCLI-command/0.0.1'
            });

            afterEach(function () {
                process.env['AKAMAI_CLI'] = '';
                process.env['AKAMAI_CLI_VERSION'] = '';
                process.env['AKAMAI_CLI_COMMAND'] = '';
                process.env['AKAMAI_CLI_COMMAND_VERSION'] = '';
            });

            describe('when user agent is set in headers', function () {
                it('should append akamaiCLI agent', function () {
                    testAgent = 'testAgent/1.0.0'
                    headers = helpers.extendHeaders({
                        'User-Agent': testAgent
                    });
                    expectedAgent = testAgent + " " + this.akamaiCLIAgent
                    assert.strictEqual(headers['User-Agent'], expectedAgent)
                });
            });

            describe('when no user agent is set in headers', function () {
                describe('when both akamaiCLI and command env is set', function () {
                    it('should set two user agents', function () {
                        headers = helpers.extendHeaders({})
                        assert.strictEqual(headers['User-Agent'], this.akamaiCLIAgent)
                    });
                });

                describe("when only AkamaiCLI info is set", function () {
                    beforeEach(function () {
                        process.env['AKAMAI_CLI_COMMAND'] = '';
                        process.env['AKAMAI_CLI_COMMAND_VERSION'] = '';
                        this.akamaiCLIAgent = 'AkamaiCLI/1.0.0'
                    });
    
                    it("should only set AkamaiCLI/version User-Agent", function () {
                        headers = helpers.extendHeaders({})
                        assert.strictEqual(headers['User-Agent'], this.akamaiCLIAgent);
                    });
                });
    
                describe("when only AkamaiCLI command info is set", function () {
                    beforeEach(function () {
                        process.env['AKAMAI_CLI'] = '';
                        process.env['AKAMAI_CLI_VERSION'] = '';
                        this.akamaiCLIAgent = 'AkamaiCLI-command/0.0.1'
                    });
    
                    it("should only set AkamaiCLI/version User-Agent", function () {
                        headers = helpers.extendHeaders({})
                        assert.strictEqual(headers['User-Agent'], this.akamaiCLIAgent);
                    });
                });
            });

        })
    })
});
