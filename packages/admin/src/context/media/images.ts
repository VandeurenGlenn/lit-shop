import {createContext} from '@lit-labs/context';
import { Image } from './image.js';

declare type Images = Image[]

export type { Images, Image }

export const ImagesContext = createContext<Images>('images');