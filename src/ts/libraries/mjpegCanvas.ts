import * as EventEmitter from "eventemitter3";
import "./ESDTimerFix";

export default class MJPEGCanvas {
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    public readonly url: string;

    public readonly events: EventEmitter;

    private size: {
        canvas: {
            width: number;
            height: number;
        }
        frame: {
            width: number;
            height: number;
            xOffset: number;
            yOffset: number;
        }
        stretch: boolean;
        manual: boolean;
    }
    
    private state: boolean;
    private refreshRate: number;
    private frame?: HTMLImageElement;
    private interval?: NodeJS.Timeout;

    constructor(options: {
        url: string,
        width?: number,
        height?: number,
        stretch?: boolean;
        refreshRate?: number,
        id?: string;
    }, document: Document = window.document) {
        // Check if URL is defined
        if (!options.url) throw new Error("URL not supplied!");
        this.url = options.url;

        if ((options.width || options.height) && !(options.width && options.height)) throw new Error("Both width and height must be supplied if you are not leaving it automatic!");

        this.size = {
            canvas: {
                width: options.width || 0,
                height: options.height || 0
            },
            frame: {
                width: 0,
                height: 0,
                xOffset: 0,
                yOffset: 0
            },
            stretch: options.stretch || false,
            manual: (!!options.width || !!options.height)
        };
        
        // Maximum refresh rate in milliseconds
        this.refreshRate = 1000 / (options.refreshRate || 3);
        
        // Are we attaching to an existing element? Make sure that it actually exists first
        if (options.id && document.getElementById(options.id)) {
            const el = document.getElementById(options.id);
            if (el!.tagName === "CANVAS") {
                this.canvas = el as HTMLCanvasElement;
            } else {
                this.canvas = document.createElement("canvas");
                this.canvas.id = Math.random().toString(36).substr(2, 10);
                el!.appendChild(this.canvas);
            }
        } else {
            this.canvas = document.createElement("canvas");
            this.canvas.id = options.id ? options.id : Math.random().toString(36).substr(2, 10);
            document.body.appendChild(this.canvas);
        }
        
        this.ctx = this.canvas.getContext("2d")!;

        this.state = false;
        
        this.events = new EventEmitter();
    }
    
    public start(): void {
        this.frame = new Image();
        this.frame.src = this.url;

        this.events.emit("start");

        // This fires on the first frame
        this.frame.onload = () => {
            this.state = true;

            // Is the canvas size set? There's some math that needs to be done first if so
            if (this.size.manual) {
                // Check aspect ratio of the incoming frame compared to the canvas size ratio
                const frameAspectRatio = this.frame!.width / this.frame!.height;
                const canvasAspectRatio = this.size.canvas.width / this.size.canvas.height;

                if (frameAspectRatio === canvasAspectRatio || this.size.stretch) {
                    this.size.frame = {
                        width: this.size.canvas.width,
                        height: this.size.canvas.height,
                        xOffset: 0,
                        yOffset: 0
                    }
                } else if (frameAspectRatio > canvasAspectRatio) {
                    this.size.frame.width = this.size.canvas.width;
                    this.size.frame.height = Math.floor((this.frame!.height / this.frame!.width) * this.size.canvas.width);
                    this.size.frame.xOffset = 0;
                    this.size.frame.yOffset = Math.floor((this.size.canvas.height - this.size.frame.height) / 2);
                } else {
                    this.size.frame.width = Math.floor((this.frame!.width / this.frame!.height) * this.size.canvas.height);
                    this.size.frame.height = this.size.canvas.height;
                    this.size.frame.xOffset = Math.floor((this.size.canvas.width - this.size.frame.width) / 2);
                    this.size.frame.yOffset = 0;
                }
            } else {
                this.size.canvas = {
                    width: this.frame!.width,
                    height: this.frame!.height
                };
                
                this.size.frame = {
                    width: this.frame!.width,
                    height: this.frame!.height,
                    xOffset: 0,
                    yOffset: 0
                };
            }

            this.canvas.width = this.size.canvas.width;
            this.canvas.height = this.size.canvas.height;

            this.ctx.fillStyle = "black";
            this.ctx.fillRect(0, 0, this.size.canvas.width, this.size.canvas.height);

            this.refreshFrame();

            this.interval = setInterval(() => this.refreshFrame(), this.refreshRate);
        }
    }

    public stop(): void {
        // Don't do anything if we haven't begun actually streaming the feed yet
        if (!this.state) return;

        // @ts-ignore (this breaks otherwise)
        clearInterval(this.interval!);
        this.ctx.clearRect(0, 0, this.size.canvas.width, this.size.canvas.height);
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.frame?.remove();
        this.state = false;
        this.events.emit("stop");
    }

    get isStreaming(): boolean {
        return this.state;
    }

    private refreshFrame(): void {
        this.ctx.drawImage(this.frame!, this.size.frame.xOffset, this.size.frame.yOffset, this.size.frame.width, this.size.frame.height);
        this.events.emit("frame", this.getImageData());
    }

    public getImageData(): string {
        return this.canvas.toDataURL("image/png");
    }
}