import {
    DidReceiveSettingsEvent,
    KeyDownEvent,
    KeyUpEvent,
    SDOnActionEvent,
    StreamDeckAction,
    WillAppearEvent
} from "streamdeck-typescript";
import OctoPrintControl from "../index";

export default class WebcamOverlayAction extends StreamDeckAction<OctoPrintControl, WebcamOverlayAction> {
    constructor(private plugin: OctoPrintControl, private actionName: string) {
        super(plugin, actionName);
    }
}