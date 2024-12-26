import { LiteElement, html, css, customElement, property } from '@vandeurenglenn/lite'

@customElement('catalog-section')
export class CatalogSection extends LiteElement {
  @property({ type: String }) accessor selected = 'products'

  static styles = [
    css`
      :host {
        display: block;
        width: 100%;
      }
    `
  ]

  select(route) {
    this.selected = route
    // this.shadowRoot.querySelector('custom-pages').select(route)
  }

  render() {
    switch (this.selected) {
      case 'product':
        return html`<catalog-product route="product"></catalog-product>`
      case 'add-product':
        return html`<catalog-add-product route="add-product"></catalog-add-product>`
      case 'categories':
        return html`<catalog-categories route="categories"></catalog-categories>`

      default:
        return html`<catalog-products route="products"></catalog-products>`
    }
  }
}
