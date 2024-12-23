import '../../image-nails.js'
// import 'custom-input';
import '@vandeurenglenn/custom-date/custom-date.js'
import { generateSKU, generateUUID } from '@lit-shop/utils'
import '../../elements/input-fields/input-fields.js'
import { LiteElement, html, customElement, property, query } from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/container.js'
import { StyleList, css } from '@vandeurenglenn/lite/element'
import '@material/web/fab/fab.js'
import '@vandeurenglenn/lite-elements/icon.js'
import '@vandeurenglenn/lite-elements/tabs.js'
import '@vandeurenglenn/lite-elements/tab.js'
import firebase from '../../firebase.js'
import { Product } from '@lit-shop/types'
import './../../flows/product/product-flow.js'
import { ProductFlow } from '../../flows/product/product-flow.js'

@customElement('catalog-add-product')
export default class CatalogAddProduct extends LiteElement {
  @property({ type: Array, consumes: 'categories' }) accessor categories

  @property({ type: String }) accessor selected: string

  @property({ type: Boolean, reflect: true }) accessor busy: boolean

  @property({ type: String }) accessor product

  @property({ type: String }) accessor sku: string

  @query('product-flow') accessor productFlow: ProductFlow

  get uniqueId() {
    return generateUUID()
  }

  @property({ type: Array }) accessor imageFields

  @property({ type: Array }) accessor fields

  @property({ type: Array }) accessor sizeFields

  async connectedCallback() {
    const uniqueId = generateUUID()
  }

  _onStep = (event) => {
    console.log(event)

    console.log(event.detail)

    if (event.detail.step === 'sizes' && !event.detail.isLastStep) {
      this.productFlow.fields = this.sizeFields
      console.log('fields', this.sizeFields)
      return
    }
    if (event.detail.step === 'initial') {
      this.productFlow.fields = this.fields
      return
    }

    if (event.detail.step === 'images' && !event.detail.isLastStep) {
      this.productFlow.fields = this.imageFields
      return
    }
    if (event.detail.isLastStep) return this.addProduct(event.detail.results)
  }

  _onSelect(event) {
    this.selected = event.detail
  }
  async addProduct(results) {
    console.log({ results })

    const product: Product = {
      ...results.initial,
      sizes: results.sizes,
      images: results.images
    }
    console.log({ product })
    this.busy = true

    const key = await firebase.push('products', product)
    const snap = await firebase.get('products')
    const productCount = Object.keys(snap).length
    for (let i = 0; i < product.sizes.length; i++) {
      const { size, unit } = product.sizes[i]

      const sku = generateSKU(product.category, `${size}${unit}`, key)
      product.sizes[i].sku = sku
      let barcode = `${productCount}${i}`

      product.sizes[i].barcode = `${productCount}${i}`
    }
    product.position = productCount - 1

    await firebase.update(`products/${key}`, product)

    location.hash = `#!/catalog/products`
    // remove element completly
    this.remove()
  }

  onChange(propertyKey: string, value: any): void {
    if (propertyKey === 'categories') {
      this.fields = [
        ['category', { type: 'select', options: this.categories }],
        ['name', ''],
        ['description', '']
      ]
      this.productFlow.fields = this.fields
    }
  }

  firstRender(): void {
    this.sizeFields = [{ unit: 'ml', amount: 500, price: 0, stock: 0, EAN: '' }]
    this.imageFields = []
    this.shadowRoot.querySelector('product-flow').addEventListener('step', this._onStep)
  }

  static styles?: StyleList = [
    css`
      :host([busy]) {
        justify-content: center;
        align-items: center;
        height: 100%;
      }

      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      flex-container {
        height: 100%;
        align-items: center;
      }
    `
  ]

  render() {
    if (this.busy) return html`<busy-animation message="Adding product"></busy-animation>`
    return html`<flex-container center
      ><product-flow @step=${this._onStep}></product-flow
    ></flex-container>`
  }
}
