const assert = require('assert'),
    fs = require('fs'),
    os = require('os'),
    path = require('path'),
    edgerc = require('../../src/edgerc');

describe('edgerc', function () {
    beforeEach(function () {
        process.env['AKAMAI_HOST'] = '';
        process.env['AKAMAI_CLIENT_TOKEN'] = '';
        process.env['AKAMAI_CLIENT_SECRET'] = '';
        process.env['AKAMAI_ACCESS_TOKEN'] = '';
    });
    describe('the parsed edgerc file it returns', function () {
        describe('when it is not passed a second argument indicating config section', function () {
            beforeEach(function () {
                this.config = edgerc(path.resolve(__dirname, '../test_edgerc'));
            });

            it('reports the default host', function () {
                assert.strictEqual(this.config.host, 'https://example.luna.akamaiapis.net');
            });

            it('reports the default client_token', function () {
                assert.strictEqual(this.config.client_token, 'clientToken');
            });

            it('reports the default client_secret', function () {
                assert.strictEqual(this.config.client_secret, 'clientSecret');
            });

            it('reports the default access_token', function () {
                assert.strictEqual(this.config.access_token, 'accessToken');
            });

            it('reports the default max_body', function () {
                assert.equal(this.config.max_body, 131072);
            });
        });

        describe('when it is passed a second argument indicating config section', function () {
            beforeEach(function () {
                this.config = edgerc(path.resolve(__dirname, '../test_edgerc'), 'section');
            });

            it('reports the host associated with the section', function () {
                assert.strictEqual(this.config.host, 'https://sectionexample.luna.akamaiapis.net');
            });

            it('reports the client_token associated with the section', function () {
                assert.strictEqual(this.config.client_token, 'sectionClientToken');
            });

            it('reports the client_secret associated with the section', function () {
                assert.strictEqual(this.config.client_secret, 'sectionClientSecret');
            });

            it('reports the access_token associated with the section', function () {
                assert.strictEqual(this.config.access_token, 'sectionAccessToken');
            });

            it('reports the max_body associated with the section', function () {
                assert.equal(this.config.max_body, 131072);
            });
        });

        describe('when it is passed a second argument indicating config section without specified max_body', function () {
            beforeEach(function () {
                this.config = edgerc(path.resolve(__dirname, '../test_edgerc'), 'no-max-body');
            });

            it('reports the host associated with the section without specified max_body', function () {
                assert.strictEqual(this.config.host, 'https://sectionexample.luna.akamaiapis.net');
            });

            it('reports the client_token associated with the section without specified max_body', function () {
                assert.strictEqual(this.config.client_token, 'sectionClientToken');
            });

            it('reports the client_secret associated with the section without specified max_body', function () {
                assert.strictEqual(this.config.client_secret, 'sectionClientSecret');
            });

            it('reports the access_token associated with the section without specified max_body', function () {
                assert.strictEqual(this.config.access_token, 'sectionAccessToken');
            });

            it('reports the max_body associated with the section without specified max_body', function () {
                assert.equal(this.config.max_body, 131072);
            });
        });

        describe('when it is passed a second argument indicating config section with custom `max_body` value', function () {
            beforeEach(function () {
                this.config = edgerc(path.resolve(__dirname, '../test_edgerc'), 'custom:max_body');
            });

            it('reports the host associated with the section with with custom `max_body`', function () {
                assert.strictEqual(this.config.host, 'https://sectionexample.luna.akamaiapis.net');
            });

            it('reports the client_token associated with the section with with custom `max_body`', function () {
                assert.strictEqual(this.config.client_token, 'sectionClientToken');
            });

            it('reports the client_secret associated with the section with with custom `max_body`', function () {
                assert.strictEqual(this.config.client_secret, 'sectionClientSecret');
            });

            it('reports the access_token associated with the section with with custom `max_body`', function () {
                assert.strictEqual(this.config.access_token, 'sectionAccessToken');
            });

            it('reports the max_body associated with the section with with custom `max_body`', function () {
                assert.equal(this.config.max_body, 131072);
            });
        });

        describe('when the section contains a host with the "https://" protocal specified', function () {
            beforeEach(function () {
                this.config = edgerc(path.resolve(__dirname, '../test_edgerc'), 'https');
            });

            it('reports a host with a valid URI string', function () {
                assert.strictEqual(this.config.host, 'https://example.luna.akamaiapis.net');
            });
        });

        describe('when the section passed does not exist', function () {
            it('throws the proper error', function () {
                assert.throws(
                    function () {
                        return edgerc(path.resolve(__dirname, '../test_edgerc'), 'blah');
                    },
                    /An error occurred parsing the .edgerc file. You probably specified an invalid section name./
                );
            });
        });

        describe('when the section has comments', function () {
            beforeEach(function () {
                this.config = edgerc(path.resolve(__dirname, '../test_edgerc'), 'comment-test');
            });

            it('has six configuration items', function () {
                assert.strictEqual(Object.keys(this.config).length, 6);
            });

            it('parses a value with a semicolon properly', function () {
                assert.strictEqual(this.config.client_secret, "client;secret");
            });

            it('parses a complex value properly', function () {
                assert.strictEqual(this.config.other, 'The "most" \\\'interesting\\\' ; value in the \\";world\\"');
            });
        });

        describe('when the envs are used with default section', function () {
            beforeEach(function () {
                process.env['AKAMAI_HOST'] = 'https://example.luna.akamaiapis.net';
                process.env['AKAMAI_CLIENT_TOKEN'] = 'clientToken';
                process.env['AKAMAI_CLIENT_SECRET'] = 'clientSecret';
                process.env['AKAMAI_ACCESS_TOKEN'] = 'accessToken';
                this.config = edgerc();
            });

            it('has five configuration items', function () {
                assert.strictEqual(Object.keys(this.config).length, 5);
            });

            it('has valid config values', function () {
                assert.strictEqual(this.config.host, "https://example.luna.akamaiapis.net");
                assert.strictEqual(this.config.client_token, "clientToken");
                assert.strictEqual(this.config.client_secret, "clientSecret");
                assert.strictEqual(this.config.access_token, "accessToken");
                assert.equal(this.config.max_body, 131072);
            });
        });

        describe('when the envs are used with custom section', function () {
            beforeEach(function () {
                process.env['AKAMAI_SOME_SECTION_HOST'] = 'https://example.luna.akamaiapis.net';
                process.env['AKAMAI_SOME_SECTION_CLIENT_TOKEN'] = 'clientToken';
                process.env['AKAMAI_SOME_SECTION_CLIENT_SECRET'] = 'clientSecret';
                process.env['AKAMAI_SOME_SECTION_ACCESS_TOKEN'] = 'accessToken';
                this.config = edgerc(undefined, 'some_section');
            });
            afterEach(function () {
                process.env['AKAMAI_SOME_SECTION_HOST'] = '';
                process.env['AKAMAI_SOME_SECTION_CLIENT_TOKEN'] = '';
                process.env['AKAMAI_SOME_SECTION_CLIENT_SECRET'] = '';
                process.env['AKAMAI_SOME_SECTION_ACCESS_TOKEN'] = '';
            });

            it('has valid config values', function () {
                assert.strictEqual(this.config.host, "https://example.luna.akamaiapis.net");
                assert.strictEqual(this.config.client_token, "clientToken");
                assert.strictEqual(this.config.client_secret, "clientSecret");
                assert.strictEqual(this.config.access_token, "accessToken");
                assert.equal(this.config.max_body, 131072);
            });
        });
    });

    describe('when no path and no env vars are provided', function () {
        let originalHome;

        beforeEach(function () {
            originalHome = process.env['HOME'];
            this.tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edgerc-test-'));
            process.env['HOME'] = this.tmpDir;
        });

        afterEach(function () {
            process.env['HOME'] = originalHome;
            fs.rmSync(this.tmpDir, { recursive: true, force: true });
        });

        describe('and ~/.edgerc exists', function () {
            beforeEach(function () {
                fs.copyFileSync(path.resolve(__dirname, '../test_edgerc'), path.join(this.tmpDir, '.edgerc'));
                this.config = edgerc();
            });

            it('falls back to reading ~/.edgerc', function () {
                assert.strictEqual(this.config.host, 'https://example.luna.akamaiapis.net');
                assert.strictEqual(this.config.client_token, 'clientToken');
            });
        });

        describe('and ~/.edgerc does not exist', function () {
            it('throws a descriptive error', function () {
                assert.throws(
                    function () {
                        return edgerc();
                    },
                    /No '\.edgerc' file found at '.*\.edgerc' and no matching AKAMAI_\* environment variables were set\./
                );
            });
        });
    });
});
