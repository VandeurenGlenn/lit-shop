import { LiteElement, property, html, map, customElement, css } from '@vandeurenglenn/lite'
import '@vandeurenglenn/lite-elements/list.js'
import '@vandeurenglenn/flex-elements/container.js'
import './../../elements/items/stock-item.js'
import '@material/web/fab/fab.js'

@customElement('stock-section')
export class StockSection extends LiteElement {
  @property({ type: Array, consumes: 'products' })
  accessor products

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

  render() {
    return html`
      <flex-container>
        <custom-list class="container">
          ${this.products
            ? this.products.map(
                (product) => html`
                  ${product.sizes.map(
                    (size) => html`
                      <stock-item
                        .name=${`${product.name}-${size.size}${size.unit}`}
                        .key=${product.key}
                        .stock=${size.stock}
                        data-route=${product.key}></stock-item>
                    `
                  )}
                `
              )
            : ''}
        </custom-list>
        <md-fab
          ><custom-icon
            icon="edit"
            slot="icon"></custom-icon
        ></md-fab>
      </flex-container>
    `
  }
}
