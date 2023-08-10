import {createContext} from '@lit-labs/context';
import { Offer } from './offer.js';


declare type Offers = { [index: string]: Offer }

export type { Offers }

export const OffersContext = createContext<Offers>('offers');