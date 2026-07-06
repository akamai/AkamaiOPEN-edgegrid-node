import type { Dispatcher } from 'undici';

/**
 * Error object passed to the callback when a request fails.
 * In addition to the standard Error fields, it carries the HTTP status code,
 * the response headers, and the full undici ResponseData for advanced consumers.
 */
interface EdgeGridError extends Error {
    /** HTTP status code returned by the server (e.g. 401, 500). */
    statusCode?: number;
    /** Response headers from the server. */
    headers?: Record<string, string | string[]>;
    /** Full undici ResponseData (body already consumed via dump()). */
    response?: Dispatcher.ResponseData;
}

declare class EdgeGrid {
    constructor(clientTokenOrOptions: string | object,
                clientSecret?: string,
                accessToken?: string,
                host?: string,
                debug?: boolean,
                max_body?: number);

    request: object;
    config: object;

    /**
     * Sends the request and invokes the callback function.
     *
     * On success (2xx) calls callback(null, response, body).
     * On network error or HTTP error calls callback(err, null, null).
     *
     * @param callback Node-style callback receiving (error, response, body).
     *                 `body` is a string for text/JSON responses and a Buffer
     *                 for binary responses (gzip, tar, octet-stream).
     * @return EdgeGrid object (self)
     */
    send(callback: (
        error: EdgeGridError | null,
        response?: Dispatcher.ResponseData | null,
        body?: string | Buffer | null
    ) => void): EdgeGrid;

    /**
     * Builds the request using the properties of the local config Object.
     *
     * @param req The request Object. Can optionally contain a
     *            'headersToSign' property: An ordered list of header names
     *            that will be included in the signature.
     * @return EdgeGrid object (self)
     */
    auth(req: object): EdgeGrid;
}

export = EdgeGrid;