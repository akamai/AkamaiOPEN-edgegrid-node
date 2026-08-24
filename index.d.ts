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
     * Resolves with { statusCode, headers, body, url } on a 2xx response.
     * Rejects with an EdgeGridError on HTTP errors (4xx/5xx) or network failures.
     */
    send(request: EdgeGrid.EdgeGridRequest): Promise<EdgeGrid.SendResult>;
    /**
     * @deprecated Use `send(request)` (Promise API) instead.
     * Callback support will be removed in a future major version.
     *
     * Compatibility mode: the callback is invoked with (err, response, body) and `this` is returned
     * for chaining, matching the pre-v5 behavior.
     */
    send(request: EdgeGrid.EdgeGridRequest, callback: (
        error: EdgeGrid.EdgeGridError | null,
        response?: EdgeGrid.SendResult | null,
        body?: string | Buffer | null
    ) => void): this;

    enableLogging(option: boolean | object): this;
}

declare namespace EdgeGrid {
    /** Request options passed to send(). */
    export interface EdgeGridRequest {
        /** API path, e.g. '/identity-management/v3/user-profile'. */
        path: string;
        /** HTTP method. Defaults to 'GET'. */
        method?: string;
        /** Request headers. */
        headers?: Record<string, string>;
        /** Request body. Objects are JSON-serialised automatically. */
        body?: string | Buffer | Uint8Array | object;
        /** Query string parameters as a key-value map. */
        qs?: Record<string, string | number | boolean>;
        /** Ordered list of header names to include in the EdgeGrid signature. */
        headersToSign?: Record<string, string>;
    }

    /** Resolved value of the Promise returned by send(). */
    export interface SendResult {
        /** HTTP status code. */
        statusCode: number;
        /** Response headers. */
        headers: Record<string, string | string[]>;
        /**
         * Response body.
         * - string  for text responses: text/*, application/json, application/xml,
         *           application/javascript, and any *+json or *+xml type
         * - Buffer  for all other content types (binary/unknown), or when
         *           responseType: 'arraybuffer' is explicitly set
         */
        body: string | Buffer;
        /** Final URL of the request, after any redirects. */
        url: string;
    }

    /** Error thrown (Promise rejection) for HTTP errors (4xx, 5xx) or network failures. */
    export interface EdgeGridError extends Error {
        /** HTTP status code. Absent for network-level errors (e.g. connection refused). */
        statusCode?: number;
        /** Response headers. Absent for network-level errors. */
        headers?: Record<string, string | string[]>;
        /** Response body. Absent for network-level errors. */
        body?: string | Buffer;
        /** URL that was requested when the error occurred. */
        url?: string;
        /** Underlying transport error from undici, present for network-level failures. */
        cause?: Error;
    }
}

export = EdgeGrid;