import { StreamDeckPluginHandler } from "streamdeck-typescript";
import { WebcamOverlayAction } from "./webcamOverlay";

export default class OctoPrintControl extends StreamDeckPluginHandler {
    constructor() {
        super();
        new WebcamOverlayAction(this, this.actionName("webcamOverlay"));
    }
    
    private actionName(name: string): string {
        return `me.theapplefreak.octoprintcontrol.${name}`;
    }
}


new OctoPrintControl();