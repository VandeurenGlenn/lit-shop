import '@vandeurenglenn/shop-elements/grid.js'
import { ShopSalesView } from '@vandeurenglenn/shop-elements/view.js'

import { customElement, html, css, LiteElement } from '@vandeurenglenn/lite'

@customElement('sales-section')
export class SalesSection extends ShopSalesView {
  static styles = [
    css`
      :host {
        display: block;
        padding: 16px;
      }
    `
  ]
  constructor() {
    super()

    new CSSStyleSheet().replaceSync(`
      shop-sales-input {
      max-width: 318px;
      }
    `)
    this.shadowRoot.adoptedStyleSheets = [ShopSalesView.styles[0].styleSheet]
  }
}
