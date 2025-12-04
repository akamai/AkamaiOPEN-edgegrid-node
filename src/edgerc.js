const fs = require('fs'),
    { getLogger } = require('./logger'),
    helpers = require('./helpers');

function getSection(lines, sectionName) {
    const match = /^\s*\[(.*)]/,
        section = [];

    lines.some(function (line, i) {
        const lineMatch = line.match(match),
            isMatch = lineMatch !== null && lineMatch[1] === sectionName;

        if (isMatch) {
            // go through section until we find a new one
            lines.slice(i + 1, lines.length).some(function (line) {
                const isMatch = line.match(match) !== null;
                if (!isMatch) {
                    section.push(line);
                }
                return isMatch;
            });
        }
        return isMatch;
    });
    return section;
}

function validatedConfig(config) {
    /**
     * @deprecated max_body - This value is deprecated.
     */
    config.max_body = helpers.MAX_BODY

    if (!(config.host && config.access_token &&
        config.client_secret && config.client_token)) {
        let errorMessage = "";
        const tokens =
            ['client_token', 'client_secret', 'access_token', 'host'];
        tokens.forEach(function (token) {
            if (!config[token]) {
                errorMessage += "\nMissing: " + token;
            }
        });
        getLogger().error({ errorMessage }, 'Missing part of the configuration');
        return {};
    }

    if (config.host.indexOf('https://') > -1) {
        return config;
    }

    config.host = 'https://' + config.host;

    return config;
}

function buildObj(configs) {
    const result = {};
    let index,
        key,
        val,
        parsedValue,
        isComment;

    configs.forEach(function (config) {
        config = config.trim();
        isComment = config.indexOf(";") === 0;
        index = config.indexOf('=');
        if (index > -1 && !isComment) {
            key = config.substr(0, index);
            if (key.startsWith("max-body")) {
                key = key.replace('-', '_');
            }
            val = config.substring(index + 1);
            // remove inline comments
            parsedValue = val.replace(/^\s*(['"])((?:\\\1|.)*?)\1\s*(?:;.*)?$/, "$2");
            if (parsedValue === val) {
                // the value is not contained in matched quotation marks
                parsedValue = val.replace(/\s*([^;]+)\s*;?.*$/, "$1");
            }
            // Remove trailing slash as if often found in the host property
            if (parsedValue.endsWith("/")) {
                parsedValue = parsedValue.substr(0, parsedValue.length - 1);
            }

            result[key.trim()] = parsedValue;
        }
    });

    return validatedConfig(result);
}

function readEnv(section) {
    var logger = getLogger();
    const requiredKeys = ["HOST", "ACCESS_TOKEN", "CLIENT_TOKEN", "CLIENT_SECRET"],
        prefix = !section || section === "default" ? "AKAMAI_" : "AKAMAI_" + section.toUpperCase() + "_",
        envConfig = {};


    for (const key of requiredKeys) {
        const varName = prefix + key;
        if (!process.env[varName]) {
            logger.debug({ varName }, 'Environment variable not set');
            continue;
        }
        envConfig[key.toLowerCase()] = process.env[prefix + key];
    }
    if (Object.keys(envConfig).length < requiredKeys.length) {
        return {};
    }
    logger.info('Using configuration from environment variables');
    return validatedConfig(envConfig);
}

module.exports = function (path, conf) {
    const confSection = conf || 'default',
        envConf = readEnv(confSection);
    if (envConf['host']) {
        return envConf;
    }
    if (!path) {
        throw new Error("Either path to '.edgerc' or environment variables with edgerc configuration has to be provided.");
    }
    path = helpers.resolveHome(path);
    const edgerc = fs.readFileSync(path).toString().split('\n'),
        confData = getSection(edgerc, confSection);

    if (!confData.length) {
        throw new Error('An error occurred parsing the .edgerc file. You probably specified an invalid section name.');
    }

    return buildObj(confData);
};
