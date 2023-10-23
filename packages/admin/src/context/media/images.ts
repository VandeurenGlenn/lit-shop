import {createContext} from '@lit-labs/context';
import { imgurBaseImage } from '@lit-shop/apis/imgur-base';

declare type Images = imgurBaseImage[]

export type { Images, imgurBaseImage as Image }

export const ImagesContext = createContext<Images>('images');