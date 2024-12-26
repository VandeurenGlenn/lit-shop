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
import { InputFields } from '../../elements/input-fields/input-fields.js'
import { ImageFields } from '../../elements/input-fields/image-fields.js'

const initialStep = (fields) => html` <input-fields .fields=${fields}></input-fields> `

const sizesStep = (fields) => html` <size-fields .fields=${fields}></size-fields> `

const imagesStep = (fields) => html` <image-fields .fields=${fields}></image-fields> `

@customElement('catalog-add-product')
export default class CatalogAddProduct extends LiteElement {
  steps
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

  async onChange(propertyKey: string, value: any): void {
    if (propertyKey === 'categories' && !this.steps && value?.length > 0) {
      console.log(value)

      this.steps = [
        {
          step: 'initial',
          stepRender: initialStep,
          stepValidate: () => {
            const field = this.shadowRoot
              .querySelector('product-flow')
              .shadowRoot.querySelector('input-fields') as InputFields
            return field.checkValidityAndGetValues()
          },
          fields: [
            ['category', { type: 'select', options: value }],
            ['name', ''],
            ['description', '']
          ]
        },
        {
          step: 'sizes',
          stepRender: sizesStep,
          stepValidate: () => {
            const field = this.shadowRoot
              .querySelector('product-flow')
              .shadowRoot.querySelector('size-fields') as InputFields
            return field.checkValidityAndGetValues()
          },
          fields: [{ size: 100, unit: 'ml', price: 10, stock: 10, EAN: '' }]
        },
        {
          step: 'images',
          stepRender: imagesStep,
          stepValidate: () => {
            const field = this.shadowRoot
              .querySelector('product-flow')
              .shadowRoot.querySelector('image-fields') as ImageFields
            return field.checkValidityAndGetValues()
          },
          fields: []
        }
      ]
      console.log(await this.rendered)

      await this.requestRender()
      this.productFlow.startFlow(this.steps)
    }
  }

  // firstRender(): void {
  //   this.sizeFields = []
  //   this.imageFields = []
  //   this.shadowRoot.querySelector('product-flow').addEventListener('step', this._onStep)
  // }

  static styles?: StyleList = [
    css`
      :host([busy]) {
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
      }

      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }

      flex-container {
        height: 100%;
        align-items: center;
      }
    `
  ]

  render() {
    if (this.busy) return html`<busy-animation message="Adding product"></busy-animation>`
    if (!this.steps) return html``
    return html`<flex-container center
      ><product-flow @step=${this._onStep}></product-flow
    ></flex-container>`
  }
}
