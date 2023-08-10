import {createContext} from '@lit-labs/context';
import { firebaseImgurAlbum } from '@lit-shop/apis/imgur-base';

declare type Album = firebaseImgurAlbum

export type { Album }

export const AlbumContext = createContext<Album>('album');