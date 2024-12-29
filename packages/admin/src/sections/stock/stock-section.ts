import { LiteElement, property, html, map, customElement, css } from '@vandeurenglenn/lite'
import '@vandeurenglenn/lite-elements/list.js'
import '@vandeurenglenn/flex-elements/container.js'
import './../../elements/items/stock-item.js'
import '@material/web/fab/fab.js'
import { StockItem } from './../../elements/items/stock-item.js'

@customElement('stock-section')
export class StockSection extends LiteElement {
  @property({ type: Array, consumes: 'products' })
  accessor products

  @property({ type: Boolean })
  accessor editMode

  static styles = [
    css`
      :host {
        display: block;
        justify-content: center;
      }
      md-fab {
        position: absolute;
        bottom: 24px;
        right: 24px;
      }

      custom-list {
        width: 100%;
      }

      stock-item {
        margin-bottom: 16px;
      }
    `
  ]

  checkValidity() {
    this.products.forEach((product) => {
      product.sizes.forEach((size, i) => {
        const el = this.shadowRoot.querySelector(
          `stock-item[key="${product.key}"][size-key="${i}"]`
        ) as StockItem

        if (el.stock === '') {
          el.stock = '0'
        }
      })
    })
  }

  onChange(propertyKey: string, value: any): void {
    if (propertyKey === 'editMode' && value === false) {
      this.checkValidity()
      this.products.forEach((product) => {
        product.sizes.forEach((size, i) => {
          const el = this.shadowRoot.querySelector(
            `stock-item[key="${product.key}"][size-key="${i}"]`
          ) as StockItem

          size.stock = el.stock

          firebase.update(`products/${product.key}/sizes/${i}`, {
            stock: size.stock
          })
        })
      })
    }
  }

  render() {
    return html`
      <flex-container>
        <custom-list class="container">
          ${this.products
            ? this.products.map(
                (product) => html`
                  ${product.sizes.map((size) => {
                    return html`
                      <stock-item
                        .sizeKey=${product.sizes.indexOf(size).toString()}
                        .editMode=${this.editMode}
                        .name=${`${product.name}-${size.size}${size.unit}`}
                        .key=${product.key}
                        .stock=${size.stock}></stock-item>
                    `
                  })}
                `
              )
            : ''}
        </custom-list>
        <md-fab @click=${() => (this.editMode = !this.editMode)}
          >${this.editMode
            ? html` ><custom-icon
                  icon="save"
                  slot="icon"></custom-icon>`
            : html` ><custom-icon
                  icon="edit"
                  slot="icon"></custom-icon>`}
        </md-fab>
      </flex-container>
    `
  }
}
