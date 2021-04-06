// Somewhat adapted from this library:
// https://github.com/ulrichformann/jpeg-extract/blob/master/index.js
// Maybe consider getting rid of axios in favor of pure fetch? idk
// Then again, it does allow proxying and cancelling... think on it
// https://stackoverflow.com/questions/62121310/how-to-handle-streaming-data-using-fetch

import axios, { AxiosInstance, AxiosProxyConfig, CancelTokenSource } from "axios";
// No typings from this
const httpAdapter = require("axios/lib/adapters/http");
import * as EventEmitter from "eventemitter3";

export default class MJPEGDecode {
    public readonly url: string;
    public canvasEl: HTMLCanvasElement;
    public events: EventEmitter;

    private axios: AxiosInstance;
    private cancelToken?: CancelTokenSource;
    private currentState: keyof typeof state;
    private refreshRate: number;
    private stream?: ReadableStreamDefaultReader;

    constructor(options: {
        url: string,
        refreshRate?: number,
        proxy?: AxiosProxyConfig
    }) {
        // Check if URL is defined early
        if (!options.url) throw new Error("No URL supplied!");
        this.url = options.url;

        // Refresh rate in milliseconds
        this.refreshRate = 1000 / (options.refreshRate || 3);

        this.canvasEl = document.createElement("canvas");
        document.body.appendChild(this.canvasEl);

        // Create axios instance
        this.currentState = "inactive";
        this.axios = axios.create({
            timeout: 5000,
            responseType: "stream",
            adapter: httpAdapter,
            proxy: options.proxy || undefined
        });
        
        this.events = new EventEmitter();
    }
    
    public async start(): Promise<void> {
        this.currentState = "connecting";
        try {
            this.cancelToken = axios.CancelToken.source();
            const res = await this.axios.get<ReadableStream>(this.url, {
                cancelToken: this.cancelToken.token
            });
            this.stream = res.data.getReader();
            this.currentState = "active";
        } catch (err) {
            this.currentState = "inactive";
            throw new Error("Could not start video stream!");
        }
    }

    public stop(): void {
        this.cancelToken?.cancel("Operation cancelled");
    }

    get state(): string {
        return this.currentState;
    }
}

enum state {
    "inactive",
    "connecting",
    "active"
}