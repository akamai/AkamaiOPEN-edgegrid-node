import type { Dispatcher } from 'undici';

declare class EdgeGrid {
    constructor(clientTokenOrOptions: string | object,
                clientSecret?: string,
                accessToken?: string,
                host?: string,
                max_body?: number);

    config: object;
    _dispatcher: Dispatcher | null | undefined;

    /**
     * Authenticates and executes a request, returning a Promise.
     *
     * Resolves with { response, body } on a 2xx response.
     * Rejects with an EdgeGridError on HTTP errors (4xx/5xx) or network failures.
     *
     */
    send(request: object): Promise<EdgeGrid.SendResult>;
    /** @deprecated Use the Promise overload instead. Callback support will be removed in a future major version. */
    send(request: object, callback: (
        error: EdgeGrid.EdgeGridError | null,
        response?: Dispatcher.ResponseData | null,
        body?: string | Buffer | null
    ) => void): this;

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
        /** Response body. Present only for HTTP errors. */
        body?: string | Buffer;
    }

    /** Resolved value of the Promise returned by send(). */
    export interface SendResult {
        /** The undici response object (statusCode, headers, …). */
        response: Dispatcher.ResponseData;
        /**
         * Response body.
         * - string  for text responses: text/*, application/json, application/xml,
         *           application/javascript, and any *+json or *+xml type
         * - Buffer  for all other content types (binary/unknown), or when
         *           responseType: 'arraybuffer' is explicitly set
         */
        body: string | Buffer;
    }
}

export = EdgeGrid;