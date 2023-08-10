import {createContext} from '@lit-labs/context';
import { firebaseImgurImage } from '@lit-shop/apis/imgur-base';

declare type Image = firebaseImgurImage

export type { Image }

export const ImageContext = createContext<Image>('image');