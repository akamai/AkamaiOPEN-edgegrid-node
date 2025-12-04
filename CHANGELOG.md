# Release notes


## 4.0.0 (Dec 4, 2025)

### Breaking Changes

* Replaced `log4js` with `pino` for logging and removed the `log4js` dependency.
* Updated logging configuration with the following environment variables:
    * `AKAMAI_LOG_LEVEL` - controls log severity. Possible values are: `fatal`, `error`, `warn`, `info`, `debug`, or `trace`. Defaults to `info`.
    * `AKAMAI_LOG_PRETTY` - enables pretty-printed, human-readable log format when set to `true`. Defaults to `false`.
* Logging is now disabled by default, ensuring zero logging unless explicitly enabled.
* Introduced the `enableLogging(option)` function to programmatically control logging:
    * Passing `true` enables logging based on environment variables.
    * Passing a valid "pino-like" logger object sets the current logger. Custom loggers must implement the `info`, `debug`, `error`, and `warn` methods.
* Exported `enableLogging` for external use, replacing the previous default `logger` export.
* Removed support for the `EG_VERBOSE` environment variable; Axios interceptors now always log at the `debug` level.
* Removed support for the `debug` parameter from the EdgeGrid constructor; debugging is now fully managed through `enableLogging()`.

### Features/Enhancements

* Updated various dependencies.

## 3.5.6 (Oct 15, 2025)

### Bug fixes

* Replaced `uuid` package with `crypto` after uuid v13 dropped CommonJS support, to fix the compatibility issues.

## 3.5.5 (Oct 8, 2025)

### Features/Enhancements

* Updated various dependencies.
* Removed support for Node.js versions 18, 21, and 23.

## 3.5.4 (Jul 24, 2025)

### Features/Enhancements

* Updated various dependencies.
* Removed support for Node.js versions 14 and 16.

## 3.5.3 (Apr 09, 2025)

### Features/Enhancements

* Updated various dependencies.

## 3.5.2 (Dec 05, 2024)

### Features/Enhancements

* Updated various dependencies.

## 3.5.1 (Sep 10, 2024)

### Features/Enhancements

* Updated various dependencies.

## 3.5.0 (Jul 02, 2024)

### Features/Enhancements

* Updated various dependencies.

### Bug fixes

* `max_body` is deprecated, ignored and replaced with a constant value of 131072 bytes.

## 3.4.5 (Apr 3, 2024)

### Bug fixes

* Fixed a bug where the `max_body` parameter was not utilized when generating the authentication header.
* Implemented support for the `max_body` parameter when the configuration is provided as a function parameter.

### Features/Enhancements

* Updated various dependencies.

## 3.4.4 (Nov 15, 2023)

### Features/Enhancements

* Updated various dependencies.

## 3.4.3 (Oct 23, 2023)

### Features/Enhancements

* Updated various dependencies.

## 3.4.2 (Sep 12, 2023)

### Bug fixes

* Don't set the default `''` (empty) body in the requests.

### Features/Enhancements

* Updated various dependencies.

## 3.4.1 (May 09, 2023)

### Features/Enhancements

* Updated various dependencies.

## 3.4.0 (Jan 26, 2023)

### Features/Enhancements

* Added reading of the `max_body` (alias `max-body`) field from `.edgerc` config file with a default value of `131072` ([PR#1](https://github.com/akamai/AkamaiOPEN-edgegrid-node/pull/1)).
* Added a default Accept header (related to [PR#43](https://github.com/akamai/AkamaiOPEN-edgegrid-node/pull/43) and [I#33](https://github.com/akamai/AkamaiOPEN-edgegrid-node/issues/33)).
* Added the README section explaining how to use proxy (related to [PR#35](https://github.com/akamai/AkamaiOPEN-edgegrid-node/pull/35) and [I#59](https://github.com/akamai/AkamaiOPEN-edgegrid-node/issues/59)).
* Added the README section explaining how to change request encoding (related to [PR#58](https://github.com/akamai/AkamaiOPEN-edgegrid-node/pull/58)).
* Updated various dependencies.

## 3.3.0 (Nov 08, 2022)

### Features/Enhancements

* Updated various dependencies.

### Bug fixes

* Fixed adding the `User-Agent` header to the request.

## 3.2.0 (Apr 26, 2022)

### Features/Enhancements

* Added the Typescript declaration file ([#71](https://github.com/akamai/AkamaiOPEN-edgegrid-node/issues/71)).

## 3.1.4 (Mar 24, 2022)

### Features/Enhancements

* Removed a deprecated `moment` dependency.

### Bug fixes

* Fixed the response when Content-Type is `application/gzip` ([#83](https://github.com/akamai/AkamaiOPEN-edgegrid-node/issues/83)).

## 3.1.3 (Feb 22, 2022)

### Features/Enhancements

* Updated various dependencies.

### Bug fixes

* Bumped axios to 0.26.0 to get rid of vulnerability in [follow-redirects](https://security.snyk.io/vuln/SNYK-JS-FOLLOWREDIRECTS-2396346).

## 3.1.2 (Nov 3, 2021)

### Notes

* [IMPORTANT] Changed the npm package name from `edgegrid` to `akamai-edgegrid`.
* Cleaned up `README.md` to include working examples and got rid of inconsistencies.

## 3.1.1 (Sep 28, 2021)

### Bug fixes

* Updated the version of axios to 0.21.4 to get rid of the ReDoS vulnerability.

## 3.1.0 (Sep 27, 2021)

### Bug fixes

* Fixed support of environment variables ([#27](https://github.com/akamai/AkamaiOPEN-edgegrid-node/issues/27)).
* Fixed an error when Tarball exceeds a max-body size ([#33](https://github.com/akamai/cli-edgeworkers/issues/33)).

### Features/Enhancements

* Replaced the `request` package with axios ([#64](https://github.com/akamai/AkamaiOPEN-edgegrid-node/issues/64)).
* Fixed code quality issues.
* Updated the version of mocha.
* Added a resolving ~ sign in the edgerc path.
