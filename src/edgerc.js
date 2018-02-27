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

function getSection(lines, sectionName) {
  var match = /\[(.*)\]/,
    lineMatch,
    section;

  lines.forEach(function(line, i) {
    lineMatch = line.match(match);

    if (lineMatch && lineMatch[1] === sectionName) {
      section = lines.slice(i + 1, i + 5);
    }
  });

  return section;
}

function validatedConfig(config) {

  if (!(config.host && config.access_token &&
        config.client_secret && config.client_token)) {
          var errorMessage = "";
          var tokens = 
            ['client_token', 'client_secret','access_token','host'];
          tokens.forEach(function(token) {
            if (!config[token]) {
              errorMessage += "\nMissing: " + token;
            }
          })
          console.log('Missing part of the configuration:\n' + errorMessage);
          return {};
        }

  if (config.host.indexOf('https://') > -1) {
    return config;
  }

  config.host = 'https://' + config.host;
      
  return config;
}

function buildObj(configs) {
  var result = {},
    index,
    key,
    val;

  configs.forEach(function(config) {
    index = config.indexOf('=');
    key = config.substr(0, index);
    val = config.substr(index + 1, config.length - index - 1);

    // Remove trailing slash as if often found in the host property
    val = val.replace(/\/$/, '');

    result[key.trim()] = val.trim();
  });

  return validatedConfig(result);
}

function readEnv(section) {
  // If any are set, we're committed
  var envConf = {};
  var envPrefix = "AKAMAI_" + section.toUpperCase()
  var tokens = 
    ['client_token', 'client_secret','access_token','host'];

  tokens.forEach(function(token){
    var envcheck = envPrefix + "_" + token.toUpperCase()
    if (process.env[envcheck]) {
      envConf[token] = process.env[envcheck];
    }
  })
  
  if (Object.keys(envConf).length > 0) {
    console.log("Using configuration from environment variables")
    return validatedConfig(envConf);
  }
  return {};
}

module.exports = function(path, conf) {
  var confSection = conf || 'default'
  var envConf = readEnv(confSection);
  if (envConf['host']) {
    return envConf;
  }

  if (!path) {
    if (process.env.EDGEGRID_ENV !== 'test') {
      logger.error('No .edgerc path');
    }

    throw new Error('No edgerc path');
  }
  /*
  var edgerc = fs.readFileSync(path).toString().split('\n'),
    confSection,
    confData = getSection(edgerc, confSection);
  */
  var confData;
  if (!confData) {
    throw new Error('An error occurred parsing the .edgerc file. You probably specified an invalid section name.');
  }

  return buildObj(confData);
};
