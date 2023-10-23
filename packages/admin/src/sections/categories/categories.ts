import { consume } from '@lit-labs/context';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import { map } from 'lit/directives/map.js';

@customElement('categories-section')
export class CategoriesSection extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      md-list-item {
        width: 100%;
      }
    `
  ];

  @consume({context: CategoriesContext, subscribe: true})
  categories

  render() {
    return html`
    <flex-container>
      ${map(this.categories, category => html`
        <md-list-item headline=${category.name}></md-list-item>
      `)}
    </flex-container>
    `;
  }
}
