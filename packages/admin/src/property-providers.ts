import { property } from '@vandeurenglenn/lite'
import { FirebasePropertyProvider } from './firebase-property-provider.js'

export class PropertyProviders extends FirebasePropertyProvider {
  @property({ provides: true }) accessor albums = []

  @property({ provides: true }) accessor album

  @property({ provides: true }) accessor images

  @property({ provides: true }) accessor image

  @property({ provides: true, type: Array }) accessor products: []

  @property({ provides: true }) accessor product

  @property({ provides: true, batches: true, batchDelay: 500 }) accessor orders

  @property({ provides: true, batches: true, batchDelay: 500 }) accessor categories

  @property({ provides: true }) accessor stats

  @property({ provides: true }) accessor imgurBaseImages

  @property({ type: Boolean, reflect: true }) accessor loading

  @property({ provides: true, batches: true, batchDelay: 500 }) accessor qrcodes

  @property({ provides: true, batchDelay: 500 }) accessor giftcards

  /**
   * collection of providers and their types, events and or extra properties needed
   */
  propertyProviders = {
    products: ['products', 'categories', 'images'],
    product: ['products', 'categories', 'images'],
    'add-product': ['products', 'categories', 'images', 'stats'],
    orders: ['orders', 'products', 'categories'],
    stock: ['products', 'orders', 'categories'],
    qrcodes: ['qrcodes'],
    giftcards: [{ name: 'giftcards', type: 'object' }],
    sales: [
      'products',
      'categories'
      //   {
      //     name: 'payconiqTransactions',
      //     type: 'array',
      //     events: { onChildChanged: (val) => this.salesView.payconiqPaymentChange(val) }
      //   }
    ],
    settings: ['categories'],

    images: ['images'],
    categories: ['categories'],
    members: ['members', { name: 'attendance', type: 'object' }],
    planning: [{ name: 'planning', type: 'object' }],
    calendar: ['members', { name: 'planning', type: 'object' }, { name: 'calendar', type: 'object' }],
    files: ['members', { name: 'files', type: 'object' }],
    'add-event': ['events', 'categories', 'products']
  }
}
