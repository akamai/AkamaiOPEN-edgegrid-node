import type { Dispatcher } from 'undici';

declare class EdgeGrid {
    constructor(clientTokenOrOptions: string | object,
                clientSecret?: string,
                accessToken?: string,
                host?: string,
                debug?: boolean,
                max_body?: number);

    request: object;
    config: object;
    _dispatcher: Dispatcher | null | undefined;

    /**
     * Executes the request prepared by auth() and returns a Promise.
     *
     * Resolves with { response, body } on a 2xx response.
     * Rejects with an EdgeGrid.EdgeGridError on HTTP errors (4xx/5xx) or network failures.
     *
     * If a callback is provided, the library operates in compatibility mode:
     * the callback is invoked with (err, response, body) and `this` is returned
     * for chaining, matching the pre-v5 behavior.
     */
    send(): Promise<EdgeGrid.SendResult>;
    send(callback: (
        error: EdgeGrid.EdgeGridError | null,
        response?: Dispatcher.ResponseData | null,
        body?: string | Buffer | null
    ) => void): this;

    /**
     * Builds the request using the properties of the local config Object.
     *
     * @param req The request Object. Can optionally contain a
     *            'headersToSign' property: An ordered list of header names
     *            that will be included in the signature.
     * @return EdgeGrid object (self)
     */
    auth(req: object): this;

    enableLogging(option: boolean | object): this;
}

declare namespace EdgeGrid {
    /** Error thrown (Promise rejection) for HTTP errors (4xx, 5xx) or network failures. */
    export interface EdgeGridError extends Error {
        /** HTTP status code. Absent for network-level errors (e.g. connection refused). */
        statusCode?: number;
        /** Response headers. Present only for HTTP errors, not network errors. */
        headers?: Record<string, string | string[]>;
        /** Full undici ResponseData for advanced consumers. Present only for HTTP errors. */
        response?: Dispatcher.ResponseData;
    }

    /** Resolved value of the Promise returned by send(). */
    export interface SendResult {
        /** The undici response object (statusCode, headers, …). */
        response: Dispatcher.ResponseData;
        /**
         * Response body.
         * - string  for text/JSON responses
         * - Buffer  for binary responses (application/gzip, application/tar+gzip,
         *           application/octet-stream, or when responseType: 'arraybuffer' is set)
         */
        body: string | Buffer;
    }
}

export = EdgeGrid;