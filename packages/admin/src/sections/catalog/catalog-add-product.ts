import { generateSKU } from '@lit-shop/utils'
import { LiteElement, html, customElement, property, query, css } from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/container.js'
import firebase from '../../firebase.js'
import './../../flows/product/product-flow.js'

import '../../elements/input-fields/sku-fields.js'
import './../../elements/input-fields/image-fields.js'
import './../../elements/input-fields/input-fields.js'

import type { StyleList } from '@vandeurenglenn/lite/element'
import type { Product } from '@lit-shop/types'
import type { ProductFlow } from '../../flows/product/product-flow.js'
import type { InputFields } from '../../elements/input-fields/input-fields.js'
import type { ImageFields } from '../../elements/input-fields/image-fields.js'
import type { SkuFields } from '../../elements/input-fields/sku-fields.js'

const initialStep = (fields) => html` <input-fields .fields=${fields}></input-fields> `

const SKUsStep = (fields) => html` <sku-fields .fields=${fields}></sku-fields> `

const imagesStep = (fields) => html` <image-fields .fields=${fields}></image-fields> `

@customElement('catalog-add-product')
export default class CatalogAddProduct extends LiteElement {
  steps
  @property({ type: Array, consumes: 'categories' }) accessor categories

  @property({ type: String }) accessor selected: string

  @property({ type: Boolean, reflect: true }) accessor busy: boolean

  @property({ type: String }) accessor product

  @query('product-flow') accessor productFlow: ProductFlow

  _onStep = (event) => {
    console.log(event.detail)

    if (event.detail.isLastStep) return this.addProduct(event.detail.results)
  }

  _onSelect(event) {
    this.selected = event.detail
  }

  async addProduct(results) {
    console.log({ results })

    const product: Product = {
      ...results.initial,
      SKUs: results.SKUs,
      images: results.images
    }
    this.busy = true

    const key = await firebase.push('products', product)
    const snap = await firebase.get('products')
    const productCount = Object.keys(snap).length
    for (let i = 0; i < product.SKUs.length; i++) {
      const { amount, unit } = product.SKUs[i]

      const sku = generateSKU(product.category, `${amount}${unit}`, key)
      product.SKUs[i].sku = sku
    }
    product.position = productCount - 1
    const time = new Date().getTime()
    product.createdAt = time
    product.changedAt = time

    await firebase.update(`products/${key}`, product)

    location.hash = `#!/catalog/products`
    // remove element completely
    this.remove()
  }

  async onChange(propertyKey: string, value: any): Promise<void> {
    console.log(value)

    if (propertyKey === 'categories' && value?.length > 0) {
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
          step: 'SKUs',
          stepRender: SKUsStep,
          stepValidate: () => {
            const field = this.shadowRoot
              .querySelector('product-flow')
              .shadowRoot.querySelector('sku-fields') as SkuFields
            return field.checkValidityAndGetValues()
          },
          fields: [{ amount: 100, unit: 'ml', price: 10, EAN: '' }]
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

      this.requestRender()
      this.productFlow.startFlow(this.steps)
    }
  }
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
      ><product-flow @step=${(event) => this._onStep(event)}></product-flow
    ></flex-container>`
  }
}
