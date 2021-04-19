import {
    DidReceiveSettingsEvent,
    KeyDownEvent,
    KeyUpEvent,
    SDOnActionEvent,
    StreamDeckAction,
    WillAppearEvent
} from "streamdeck-typescript";
import OctoPrintControl from "../index";
import MJPEGCanvas from "../libraries/mjpegCanvas";
import "../libraries/ESDTimerFix";

import SettingsInterface from "./pi";

export default class WebcamOverlayAction extends StreamDeckAction<OctoPrintControl, WebcamOverlayAction> {
    private cameraFeed: MJPEGCanvas;
    private context: string;

    constructor(private plugin: OctoPrintControl, actionName: string) {
        super(plugin, actionName);

        this.cameraFeed = new MJPEGCanvas({
            url: "http://192.168.1.155/webcam/?action=stream",
            width: 72,
            height: 72,
            refreshRate: 30
        });

        this.cameraFeed.events.on("frame", (frame: string) => {
            this.updateFrame(frame);
        });
        this.context = "";
    }

    @SDOnActionEvent('willAppear')
    public onAppear(event: WillAppearEvent<SettingsInterface>) {
        this.context = event.context;
    }

    @SDOnActionEvent("keyDown")
    public onKeyDown(event: KeyDownEvent<SettingsInterface>) {
        if (!this.cameraFeed.isStreaming) {
            this.cameraFeed.start();
        } else {
            this.cameraFeed.stop();
            // TODO: Update icon
            this.plugin.setImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAAC4jAAAuIwF4pT92AAAGYmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTA0LTE5VDAzOjQwOjAxLTA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0wNC0xOVQwMzo0Mzo1Ni0wNDowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMS0wNC0xOVQwMzo0Mzo1Ni0wNDowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3YjNlOGEyMy1kZmY2LTlhNGQtYjYyMy0zYTQxN2FiNjg0MWUiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo5ZTM5NjdkYy02MDU2LTkwNDItODM5Yy00Y2IzODVhMjNiZWUiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2NmVhMDc4Ny0xMjA1LTJmNGYtODdjYy05MGVmZjg1MzM2NDEiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjY2ZWEwNzg3LTEyMDUtMmY0Zi04N2NjLTkwZWZmODUzMzY0MSIgc3RFdnQ6d2hlbj0iMjAyMS0wNC0xOVQwMzo0MDowMS0wNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gYXBwbGljYXRpb24vdm5kLmFkb2JlLnBob3Rvc2hvcCB0byBpbWFnZS9wbmciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjdiM2U4YTIzLWRmZjYtOWE0ZC1iNjIzLTNhNDE3YWI2ODQxZSIgc3RFdnQ6d2hlbj0iMjAyMS0wNC0xOVQwMzo0Mzo1Ni0wNDowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Po6JMw4AAAawSURBVHic7ZzNb9NIGMYfB8Q14ePcJpuu9kQTqMSpWpciTrtKKXTvEKTeG2mPC02XO6A9s20PSCstEhCx6oEDCa16q+p0L6wWbRz+ANJcOHB59mCPGTv+TNwktH6kSFZs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", this.context);
        }
    }
    
    @SDOnActionEvent("keyUp") 
    public onKeyUp(event: KeyUpEvent<SettingsInterface>) {

    }

    private updateFrame(frame: string) {
        this.plugin.setImage(frame, this.context);
    }
}