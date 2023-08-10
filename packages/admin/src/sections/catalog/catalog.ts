import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'

@customElement('catalog-section')
export class CatalogSection extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `
  ];

  select(route) {
    console.log({route});
    
    this.renderRoot.querySelector('custom-pages').select(route)
  }

  render() {
    return html`
    <custom-pages attr-for-selected="route">
      <catalog-offers route="offers"></catalog-offers>
      <catalog-offer route="offer"></catalog-offer>
    </custom-pages>
    `;
  }
}
