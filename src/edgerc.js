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

var fs = require('fs');

function getSection(lines, sectionName) {
    var match = /\[(.*)\]/,
        lineMatch,
        section;

    lines.forEach(function(line, i) {
        lineMatch = line.match(match);

        if (lineMatch && lineMatch[1] === sectionName) {
            section = lines.slice(i + 1, i + 6);
        }
    });

    return section;
}

function validatedConfig(config) {
    if (config.host.indexOf('https://') > -1) {
        return config;
    }

    config.host = 'https://' + config.host;

    return config;
}

function buildObj(configs) {
    var result = {},
        keyVal;

    configs.forEach(function(config) {
        // Break string apart at first occurance of equal sign
        // character in case the character is found in the value
        // strings.
        var index = config.indexOf('='),
            rawkey = config.substr(0, index),
            key = rawkey.replace('-','_'),
            val = config.substr(index + 1, config.length - index - 1);

        result[key.trim()] = val.trim();
    });

    return validatedConfig(result);
}

module.exports = function(path, conf) {
    var edgerc = fs.readFileSync(path).toString().split("\n"),
        confSection = conf || 'default',
        confData = getSection(edgerc, confSection);
    if (!confData) {
        throw new Error('An error occurred parsing the .edgerc file. You probably specified an invalid section name.');
    }
    var configObject = buildObj(confData);
    if (!configObject) {
        throw new Error('An error occurred parsing the .edgerc file. You probably have invalid data within a section.');
    }
    return configObject;
};
