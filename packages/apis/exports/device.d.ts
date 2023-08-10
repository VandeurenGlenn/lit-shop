export declare type VideoFacingModes = {
    user: boolean;
    environment: boolean;
    front: boolean;
    back: boolean;
};
export declare class DeviceApi {
    #private;
    facingModes(): Promise<VideoFacingModes>;
    hasFrontCam(): Promise<boolean>;
    hasBackCam(): Promise<boolean>;
    /**
     * @param {string} facingMode ['environment'|'user'] -
     * the desired camera to use
     */
    _createCameraStream(facingMode?: string): Promise<void>;
    /**
     * @param {HTMLElement} el
     * @param {string} facingMode ['environment'|'user'] -
     * the desired camera to use
     */
    _previewCamera(el: any, facingMode: any): Promise<void>;
    _close(): void;
    /**
     * @return {object} { preview(), takePhoto(facingMode) } - camera methods
     *
     */
    get camera(): {
        preview: (el: any, facingMode: any) => Promise<void>;
        takePhoto: (facingMode: any) => Promise<any>;
        close: any;
    };
}
