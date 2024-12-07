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
        <catalog-offers route="offers"></catalog-offers>
        <catalog-offer route="offer"></catalog-offer>
        <catalog-add-offer route="add-offer"></catalog-add-offer>
        <catalog-categories route="categories"></catalog-categories>
        <catalog-products route="products"></catalog-products>
      </custom-pages>
    `
  }
}
