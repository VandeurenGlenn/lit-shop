import {createContext} from '@lit-labs/context';
import { Album } from './album.js';

declare type Albums = Album[]

export type { Albums, Album }

export const AlbumsContext = createContext<Albums>('albums');