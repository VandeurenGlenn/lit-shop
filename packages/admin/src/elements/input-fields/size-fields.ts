import { LiteElement, html, css, customElement, property } from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/row.js'
import './size-field.js'
import { Product } from '@lit-shop/types'

@customElement('size-fields')
export class SizeFields extends LiteElement {
  @property({ type: Array })
  accessor fields

  addSize() {
    this.fields.push({ price: 0, size: 0, stock: 0, unit: 'ml' })
    this.requestRender()
  }

  getValues() {
    const values = []
    for (const field of this.fields) {
      values.push({
        size: field.size,
        price: field.price,
        stock: field.stock,
        unit: field.unit,
        EAN: field.EAN
      })
    }
    return values
  }

  static styles = [
    css`
      :host {
        width: 100%;
      }
    `
  ]

  render() {
    return html`
      ${this.fields
        ? this.fields.map(
            (field) => html`
              <size-field
                .unit=${field.unit}
                .size=${field.size}
                .price=${field.price}
                .stock=${field.stock}></size-field>
            `
          )
        : ''}

      <flex-row
        class="wrapper"
        center-center>
        <custom-icon-button
          icon="add"
          title="add info field"
          @click=${() => this.addSize()}></custom-icon-button>
      </flex-row>
    `
  }
}
