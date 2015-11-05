// Instrument the tests
var assert = require("assert");

// Libraries
var auth = require('../src/auth.js');

var base_url = "https://akaa-baseurl-xxxxxxxxxxx-xxxxxxxxxxxxx.luna.akamaiapis.net/",
    access_token = "akab-access-token-xxx-xxxxxxxxxxxxxxxx",
    client_token = "akab-client-token-xxx-xxxxxxxxxxxxxxxx",
    client_secret = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=",
    nonce = "nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    timestamp = "20140321T19:34:21+0000";

var test_auth = null;

describe('Signature Generation', function() {
    describe('simple GET', function() {
        it('should return the expected string when the signing request is run.', function() {
            var expected_header = "EG1-HMAC-SHA256 client_token=akab-client-token-xxx-xxxxxxxxxxxxxxxx;access_token=akab-access-token-xxx-xxxxxxxxxxxxxxxx;timestamp=20140321T19:34:21+0000;nonce=nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;signature=tL+y4hxyHxgWVD30X3pWnGKHcPzmrIF+LThiAOhMxYU=";
            var request = {
                //"url": "https://akaa-kax6r2oleojomqr3-q2i5ed3v35xfwe3j.luna.akamaiapis.net/billing-usage/v1/contractusagedata/contract/C-6JGLXF/6/2014",
                "path": "",
                "method": "GET"
            };
            test_auth = auth.generate_auth(request, client_token, client_secret, access_token, base_url, false, false, nonce, timestamp);
            assert.equal(test_auth.headers.Authorization, expected_header);
        });
    });
    describe('get with querystring', function() {
        it('should return the expected string when the signing request is run.', function() {
            var expected_header = "EG1-HMAC-SHA256 client_token=akab-client-token-xxx-xxxxxxxxxxxxxxxx;access_token=akab-access-token-xxx-xxxxxxxxxxxxxxxx;timestamp=20140321T19:34:21+0000;nonce=nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;signature=hKDH1UlnQySSHjvIcZpDMbQHihTQ0XyVAKZaApabdeA=";
            var request = {
                //"url": "https://akaa-kax6r2oleojomqr3-q2i5ed3v35xfwe3j.luna.akamaiapis.net/billing-usage/v1/contractusagedata/contract/C-6JGLXF/6/2014",
                "path": "testapi/v1/t1?p1=1&p2=2",
                "method": "GET"
            };
            test_auth = auth.generate_auth(request, client_token, client_secret, access_token, base_url, false, false, nonce, timestamp);
            assert.equal(test_auth.headers.Authorization, expected_header);
        });
    });
    describe('POST inside limit', function() {
        it('should return the expected string when the signing request is run.', function() {
            var expected_header = "EG1-HMAC-SHA256 client_token=akab-client-token-xxx-xxxxxxxxxxxxxxxx;access_token=akab-access-token-xxx-xxxxxxxxxxxxxxxx;timestamp=20140321T19:34:21+0000;nonce=nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;signature=hXm4iCxtpN22m4cbZb4lVLW5rhX8Ca82vCFqXzSTPe4=";
            var data = "datadatadatadatadatadatadatadata";
            var request = {
                //"url": "https://akaa-kax6r2oleojomqr3-q2i5ed3v35xfwe3j.luna.akamaiapis.net/billing-usage/v1/contractusagedata/contract/C-6JGLXF/6/2014",
                "path": "testapi/v1/t3",
                "method": "POST",
                "body": data
            };
            test_auth = auth.generate_auth(request, client_token, client_secret, access_token, base_url, false, false, nonce, timestamp);
            assert.equal(test_auth.headers.Authorization, expected_header);
        });
    });

    describe('Post uses passed-max-body', function() {
        it('should return the expected string when the signing request is run.', function() {
            var expected_header = "EG1-HMAC-SHA256 client_token=akab-client-token-xxx-xxxxxxxxxxxxxxxx;access_token=akab-access-token-xxx-xxxxxxxxxxxxxxxx;timestamp=20140321T19:34:21+0000;nonce=nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;signature=asJgKWm9tB/YhFByqnOtpcgvmzR+zpTGBgaSY/IhbNA=";
            var data = "datadatadatadatadatadatadatadata";
            var request = {
                //"url": "https://akaa-kax6r2oleojomqr3-q2i5ed3v35xfwe3j.luna.akamaiapis.net/billing-usage/v1/contractusagedata/contract/C-6JGLXF/6/2014",
                "path": "testapi/v1/t3",
                "method": "POST",
                "body": data
            };
            test_auth = auth.generate_auth(request, client_token, client_secret, access_token, base_url, false, 10, nonce, timestamp);
            assert.equal(test_auth.headers.Authorization, expected_header);
        });
    });

    describe('POST too large', function() {
        it('should return the expected string when the signing request is run.', function() {
            var expected_header = "EG1-HMAC-SHA256 client_token=akab-client-token-xxx-xxxxxxxxxxxxxxxx;access_token=akab-access-token-xxx-xxxxxxxxxxxxxxxx;timestamp=20140321T19:34:21+0000;nonce=nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;signature=6Q6PiTipLae6n4GsSIDTCJ54bEbHUBp+4MUXrbQCBoY=";
            var data = "ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd";

            var request = {
                //"url": "https://akaa-kax6r2oleojomqr3-q2i5ed3v35xfwe3j.luna.akamaiapis.net/billing-usage/v1/contractusagedata/contract/C-6JGLXF/6/2014",
                "path": "testapi/v1/t3",
                "method": "POST",
                "body": data
            };
            test_auth = auth.generate_auth(request, client_token, client_secret, access_token, base_url, false, false, nonce, timestamp);
            assert.equal(test_auth.headers.Authorization, expected_header);
        });
    });

    describe('POST length equals max_body', function() {
        it('should return the expected string when the signing request is run.', function() {
            var expected_header = "EG1-HMAC-SHA256 client_token=akab-client-token-xxx-xxxxxxxxxxxxxxxx;access_token=akab-access-token-xxx-xxxxxxxxxxxxxxxx;timestamp=20140321T19:34:21+0000;nonce=nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;signature=6Q6PiTipLae6n4GsSIDTCJ54bEbHUBp+4MUXrbQCBoY=";
            var data = "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd";
            var request = {
                //"url": "https://akaa-kax6r2oleojomqr3-q2i5ed3v35xfwe3j.luna.akamaiapis.net/billing-usage/v1/contractusagedata/contract/C-6JGLXF/6/2014",
                "path": "testapi/v1/t3",
                "method": "POST",
                "body": data
            };
            test_auth = auth.generate_auth(request, client_token, client_secret, access_token, base_url, false, false, nonce, timestamp);
            assert.equal(test_auth.headers.Authorization, expected_header);
        });
    });

    describe('POST empty body', function() {
        it('should return the expected string when the signing request is run.', function() {
            var expected_header = "EG1-HMAC-SHA256 client_token=akab-client-token-xxx-xxxxxxxxxxxxxxxx;access_token=akab-access-token-xxx-xxxxxxxxxxxxxxxx;timestamp=20140321T19:34:21+0000;nonce=nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;signature=1gEDxeQGD5GovIkJJGcBaKnZ+VaPtrc4qBUHixjsPCQ=";
            var data = "";
            var request = {
                //"url": "https://akaa-kax6r2oleojomqr3-q2i5ed3v35xfwe3j.luna.akamaiapis.net/billing-usage/v1/contractusagedata/contract/C-6JGLXF/6/2014",
                "path": "testapi/v1/t6",
                "method": "POST",
                "body": data
            };
            test_auth = auth.generate_auth(request, client_token, client_secret, access_token, base_url, false, false, nonce, timestamp);
            assert.equal(test_auth.headers.Authorization, expected_header);

        });
    });

    describe('simple header signing with GET', function() {
        it('should return the expected string when the signing request is run.', function() {
            var expected_header = "EG1-HMAC-SHA256 client_token=akab-client-token-xxx-xxxxxxxxxxxxxxxx;access_token=akab-access-token-xxx-xxxxxxxxxxxxxxxx;timestamp=20140321T19:34:21+0000;nonce=nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;signature=8F9AybcRw+PLxnvT+H0JRkjROrrUgsxJTnRXMzqvcwY=";
            var headers = {
                "X-Test1": "test-simple-header"
            };
            var request = {
                //"url": "https://akaa-kax6r2oleojomqr3-q2i5ed3v35xfwe3j.luna.akamaiapis.net/billing-usage/v1/contractusagedata/contract/C-6JGLXF/6/2014",
                "path": "testapi/v1/t4",
                "method": "GET",
                "headers": headers
            };
            test_auth = auth.generate_auth(request, client_token, client_secret, access_token, base_url, ["X-Test1"], false, nonce, timestamp);
            assert.equal(test_auth.headers.Authorization, expected_header);
        });
    });

    describe('headers containing spaces', function() {
        it('should return the expected string when the signing request is run.', function() {
            var expected_header = "EG1-HMAC-SHA256 client_token=akab-client-token-xxx-xxxxxxxxxxxxxxxx;access_token=akab-access-token-xxx-xxxxxxxxxxxxxxxx;timestamp=20140321T19:34:21+0000;nonce=nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;signature=ucq2AbjCNtobHfCTuS38fdkl5UDdWHZhQX46fYR8CqI=";
            var headers = {
                "X-Test1": "\"     test-header-with-spaces     \""
            };
            var request = {
                //"url": "https://akaa-kax6r2oleojomqr3-q2i5ed3v35xfwe3j.luna.akamaiapis.net/billing-usage/v1/contractusagedata/contract/C-6JGLXF/6/2014",
                "path": "testapi/v1/t4",
                "method": "GET",
                "headers": headers
            };
            test_auth = auth.generate_auth(request, client_token, client_secret, access_token, base_url, ["X-Test1"], false, nonce, timestamp);
            assert.equal(test_auth.headers.Authorization, expected_header);
        });
    });

    describe('headers with leading and interior spaces', function() {
        it('should return the expected string when the signing request is run.', function() {
            var headers = {
                "X-Test1": "     first-thing      second-thing"
            };
            var expected_header = "EG1-HMAC-SHA256 client_token=akab-client-token-xxx-xxxxxxxxxxxxxxxx;access_token=akab-access-token-xxx-xxxxxxxxxxxxxxxx;timestamp=20140321T19:34:21+0000;nonce=nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;signature=WtnneL539UadAAOJwnsXvPqT4Kt6z7HMgBEwAFpt3+c=";
            var request = {
                //"url": "https://akaa-kax6r2oleojomqr3-q2i5ed3v35xfwe3j.luna.akamaiapis.net/billing-usage/v1/contractusagedata/contract/C-6JGLXF/6/2014",
                "path": "testapi/v1/t4",
                "method": "GET",
                "headers": headers
            };
            test_auth = auth.generate_auth(request, client_token, client_secret, access_token, base_url, ["X-Test1"], false, nonce, timestamp);
            assert.equal(test_auth.headers.Authorization, expected_header);
        });
    });

    describe('headers out of order', function() {
        it('should return the expected string when the signing request is run.', function() {
            var headers = {
                "X-Test2": "t2",
                "X-Test1": "t1",
                "X-Test3": "t3"
            };
            var expected_header = "EG1-HMAC-SHA256 client_token=akab-client-token-xxx-xxxxxxxxxxxxxxxx;access_token=akab-access-token-xxx-xxxxxxxxxxxxxxxx;timestamp=20140321T19:34:21+0000;nonce=nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;signature=Wus73Nx8jOYM+kkBFF2q8D1EATRIMr0WLWwpLBgkBqY=";
            var request = {
                //"url": "https://akaa-kax6r2oleojomqr3-q2i5ed3v35xfwe3j.luna.akamaiapis.net/billing-usage/v1/contractusagedata/contract/C-6JGLXF/6/2014",
                "path": "testapi/v1/t4",
                "method": "GET",
                "headers": headers
            };
            test_auth = auth.generate_auth(request, client_token, client_secret, access_token, base_url, ["X-Test1", "X-Test2", "X-Test3"], false, nonce, timestamp);
            assert.equal(test_auth.headers.Authorization, expected_header);
        });
    });

    describe('extra header', function() {
        it('should return the expected string when the signing request is run.', function() {
            var headers = {
                "X-Test2": "t2",
                "X-Test1": "t1",
                "X-Test3": "t3",
                "X-Extra": "this won't be included"
            };
            var expected_header = "EG1-HMAC-SHA256 client_token=akab-client-token-xxx-xxxxxxxxxxxxxxxx;access_token=akab-access-token-xxx-xxxxxxxxxxxxxxxx;timestamp=20140321T19:34:21+0000;nonce=nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;signature=Knd/jc0A5Ghhizjayr0AUUvl2MZjBpS3FDSzvtq4Ixc=";
            var request = {
                //"url": "https://akaa-kax6r2oleojomqr3-q2i5ed3v35xfwe3j.luna.akamaiapis.net/billing-usage/v1/contractusagedata/contract/C-6JGLXF/6/2014",
                "path": "testapi/v1/t5",
                "method": "GET",
                "headers": headers
            };
            test_auth = auth.generate_auth(request, client_token, client_secret, access_token, base_url, ["X-Test1", "X-Test2", "X-Test3"], false, nonce, timestamp);
            assert.equal(test_auth.headers.Authorization, expected_header);
        });
    });

    describe('PUT test', function() {
        it('should return the expected string when the signing request is run.', function() {
            var data = "PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP";
            var expected_header = "EG1-HMAC-SHA256 client_token=akab-client-token-xxx-xxxxxxxxxxxxxxxx;access_token=akab-access-token-xxx-xxxxxxxxxxxxxxxx;timestamp=20140321T19:34:21+0000;nonce=nonce-xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;signature=GNBWEYSEWOLtu+7dD52da2C39aX/Jchpon3K/AmBqBU=";
            var request = {
                //"url": "https://akaa-kax6r2oleojomqr3-q2i5ed3v35xfwe3j.luna.akamaiapis.net/billing-usage/v1/contractusagedata/contract/C-6JGLXF/6/2014",
                "path": "testapi/v1/t6",
                "method": "PUT",
                "body": data
            };
            test_auth = auth.generate_auth(request, client_token, client_secret, access_token, base_url, false, false, nonce, timestamp);
            assert.equal(test_auth.headers.Authorization, expected_header);
        });
    });

});

//
