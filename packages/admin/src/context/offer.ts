import {createContext} from '@lit-labs/context';

declare type Offer = {
  timestamp: EpochTimeStamp
  price: number
  currency: string
  name: string
  id: string | number
  index: number,
  public: boolean,
  images: string[],
  description: string
}

export type { Offer }

export const OfferContext = createContext<Offer>('offer');