import {createContext} from '@lit-labs/context';
import { imgurBaseImage } from '@lit-shop/apis/imgur-base';

declare type Image = imgurBaseImage

export type { Image }

export const ImageContext = createContext<Image>('image');