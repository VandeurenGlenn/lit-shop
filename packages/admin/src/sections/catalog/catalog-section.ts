import { LiteElement, html, css, customElement } from '@vandeurenglenn/lite'

@customElement('catalog-section')
export class CatalogSection extends LiteElement {
  static styles = [
    css`
      :host {
        display: block;
      }
      custom-pages {
        display: flex;
      }
    `
  ]

  select(route) {
    this.shadowRoot.querySelector('custom-pages').select(route)
  }

  render() {
    return html`
      <custom-pages attr-for-selected="route">
        <catalog-products route="products"></catalog-products>
        <catalog-product route="product"></catalog-product>
        <catalog-add-product route="add-product"></catalog-add-product>
        <catalog-categories route="categories"></catalog-categories>
      </custom-pages>
    `
  }
}
