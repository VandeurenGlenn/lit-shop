import { imgurAlbumParams, imgurCreateAlbumResponse, imgurImageParams, imgurImageResponse } from "./types.js";
export default class Imgur {
    #private;
    constructor({ clientId, accessToken, anonymous }: {
        clientId?: string;
        accessToken?: string;
        anonymous?: boolean;
    });
    get headers(): Headers;
    createAlbum({ ids, title, description, cover }: imgurAlbumParams): Promise<imgurCreateAlbumResponse>;
    removeAlbum(deleteHash: any): Promise<string>;
    getAlbum(id: any): Promise<any>;
    getAlbumImages(id: any): Promise<imgurImageResponse[]>;
    /**
     * Upload image to Imgur (pass deletahash if album is anonymous)
     * @param imgurImageParams
     * @param album
     * @returns
     */
    addImage({ image, title, description, album, type }: imgurImageParams): Promise<imgurImageResponse>;
    getImage(id: any): Promise<any>;
    removeImage(deleteHash: any): Promise<string>;
}
