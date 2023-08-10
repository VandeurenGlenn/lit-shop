/**
 * imgur image hash (use deletehash for anonymous images)
 */
export declare type imgurImageHash = string;
export declare type imgurAlbumParams = {
    ids?: imgurImageHash[];
    title: string;
    description: string;
    cover?: imgurImageHash;
};
export declare type imgurCreateAlbumResponse = {
    id: string;
    deletehash: string;
};
export declare type imgurImageUploadType = 'base64' | string;
export declare type imgurImageParams = {
    image: string;
    title: string;
    description: string;
    album?: string;
    type: imgurImageUploadType;
    disable_audio?: boolean;
};
export declare type imgurImageResponse = {
    id: string;
    title: string | null;
    description: string | null;
    datetime: EpochTimeStamp;
    type: string | 'image/gif';
    animated: boolean;
    width: number;
    height: number;
    size: number;
    views: number;
    bandwidth: number;
    vote: null | string;
    favorite: boolean;
    nsfw: null | string;
    section: null | string;
    account_url: null;
    account_id: 0;
    is_ad: false;
    in_most_viral: false;
    tags: [];
    ad_type: 0;
    ad_url: string;
    in_gallery: false;
    deletehash: string;
    name: string;
    link: string;
};
