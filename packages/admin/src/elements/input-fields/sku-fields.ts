import { LiteElement, html, css, customElement, property, queryAll } from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/row.js'
import './sku-field.js'
import type { SkuField } from './sku-field.js'
import { Product, SKU } from '@lit-shop/types'

@customElement('sku-fields')
export class SkuFields extends LiteElement {
  @property({ type: Array })
  accessor fields: SKU[]

  addsku() {
    const field = {}
    if (!this.fields) this.fields = [field]
    else this.fields.push(field)
    this.requestRender()
  }

  getValues() {
    const values = []
    const skuFields = Array.from(this.shadowRoot.querySelectorAll('sku-field')) as SkuField[]
    for (const field of skuFields) {
      values.push(field.field)
    }
    return values
  }

  checkValidityAndGetValues() {
    const fields = Array.from(this.shadowRoot.querySelectorAll('sku-field')) as SkuField[]
    const values = []

    let error = false
    for (const field of fields) {
      if (!field.checkValidity()) {
        error = true
        field.error = true
      }
      values.push(field.field)
    }
    return { error, values }
  }

  reset() {
    this.fields = []
  }

  static styles = [
    css`
      :host {
        width: 100%;
      }
    `
  ]

  _removeField(EAN) {
    let index
    for (let i = 0; i < this.fields.length; i++) {
      if (this.fields[i].EAN === EAN) {
        index = i
        break
      }
    }
    this.fields
  }

  render() {
    return html`
      ${this.fields
        ? this.fields.map(
            (field) => html`
              <sku-field
                @click=${() => this._removeField(field.EAN)}
                .field=${field}></sku-field>
            `
          )
        : ''}

      <flex-row
        class="wrapper"
        center-center>
        <custom-icon-button
          icon="add"
          title="add info field"
          @click=${() => this.addsku()}></custom-icon-button>
      </flex-row>
    `
  }
}
