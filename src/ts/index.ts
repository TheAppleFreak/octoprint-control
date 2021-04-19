import { StreamDeckPluginHandler } from "streamdeck-typescript";
import { WebcamOverlayAction } from "./webcamOverlay";

export default class OctoPrintControl extends StreamDeckPluginHandler {
    constructor() {
        super();
        new WebcamOverlayAction(this, "me.theapplefreak.octoprintcontrol.webcamoverlay");
    }
}


const plugin = new OctoPrintControl();