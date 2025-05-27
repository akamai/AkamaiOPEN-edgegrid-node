const pino = require('pino');

const VALID_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];

const silentLogger = createLogger({level: 'silent'});

// zero logging by default.
let currentLogger = silentLogger;

/**
 * Enables logging based on the provided option.
 *
 * @param {boolean|object} option - If true, configures the logger using environment variables.
 *                                  If an valid object, uses it as the logger instance.
 *                                  Otherwise, reverts to silent logging.
 */
function enableLogging(option) {
    if (option === true) {
        const envLogLevel = process.env.AKAMAI_LOG_LEVEL || 'info';
        if (!VALID_LEVELS.includes(envLogLevel)) {
            throw new Error(`Invalid AKAMAI_LOG_LEVEL value "${envLogLevel}". Expected one of: ${VALID_LEVELS.join(', ')}.`);
        }
        currentLogger = createLogger({
            level: envLogLevel,
            pretty: process.env.AKAMAI_LOG_PRETTY === 'true'
        });
    } else if (option === false) {
        currentLogger = silentLogger;
    } else if (isValidLoggerObject(option)) {
        currentLogger = option;
    } else {
        throw new Error('Invalid argument passed to enableLogging. Expected true, false, or a logger object.');
    }
}

/**
 * Checks if the provided object implements the necessary logger methods.
 *
 * @param {Object} option - The object to validate.
 * @returns {boolean} - Returns true if the object is a valid logger, false otherwise.
 */
function isValidLoggerObject(option) {
    return ['info', 'debug', 'error', 'warn'].every(fn => typeof option[fn] === 'function');
}

/**
 * Creates and configures a Pino logger instance.
 *
 * @param {Object} options - Configuration options for the logger.
 * @param {string} [options.level='info'] - The minimum level of logs to output.
 * @param {boolean} [options.pretty=false] - Whether to enable pretty-printing of logs.
 * @returns {Object} - Configured Pino logger instance.
 */
function createLogger({level = 'info', pretty = false} = {}) {
    return pino({
        level,
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
        transport: pretty ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'yyyy-mm-dd HH:MM:ss.l',
                ignore: 'pid,hostname'
            }
        } : undefined
    });
}

/**
 * Returns the current logger instance.
 */
function getLogger() {
    return currentLogger;
}

if (process.env.EDGEGRID_ENV !== 'test') {
    if (process.env.AKAMAI_LOG_LEVEL || process.env.AKAMAI_LOG_PRETTY) {
        enableLogging(true);
    }
}

module.exports = { enableLogging, getLogger };