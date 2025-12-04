const assert = require('assert');
const logger = require('../../src/logger');

describe('enableLogging', function () {
    it('should accept a custom logger object', function () {
        const logs = [];
        const customLogger = {
            info: (msg) => logs.push(`INFO: ${msg}`),
            debug: (msg) => logs.push(`DEBUG: ${msg}`),
            error: (msg) => logs.push(`ERROR: ${msg}`),
            warn: (msg) => logs.push(`WARN: ${msg}`)
        };

        logger.enableLogging(customLogger);

        const log = logger.getLogger();
        log.info('test info');
        log.debug('test debug');
        log.error('test error');
        log.warn('test warn');

        assert.strictEqual(logs[0], 'INFO: test info');
        assert.strictEqual(logs[1], 'DEBUG: test debug');
        assert.strictEqual(logs[2], 'ERROR: test error');
        assert.strictEqual(logs[3], 'WARN: test warn');
    });
    
    it('should throw an error for an invalid custom logger object', function () {
        const invalidLogger = {
            info: () => {} // Missing 'debug', 'error', 'warn' methods
        };

        try {
            logger.enableLogging(invalidLogger);
            assert.fail('Expected error to be thrown'); // If no error is thrown, this will fail
        } catch (error) {
            assert.strictEqual(error.message, 'Invalid argument passed to enableLogging. Expected true, false, or a logger object.');
        }
    });
});
