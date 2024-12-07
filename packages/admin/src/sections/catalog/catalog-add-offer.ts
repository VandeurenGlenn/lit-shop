import './../../image-nails.js';
// import 'custom-input';
import '@vandeurenglenn/custom-date/custom-date.js';

import '../../elements/input-fields/input-fields.js';
import {
  LiteElement,
  html,
  customElement,
  property,
} from '@vandeurenglenn/lite';
import '@vandeurenglenn/flex-elements/container.js';
import { StyleList, css } from '@vandeurenglenn/lite/element';

@customElement('catalog-add-offer')
export default class CatalogAddOffer extends LiteElement {
  @property({ type: String }) accessor offer;

  @property({ type: Array }) accessor fields;

  connectedCallback() {
    this.fields = [
      ['name', ''],
      ['price', ''],
    ];
  }

  static styles?: StyleList = [
    css`
    
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    flex-container {
      overflow-y: auto;
    }
    ::slotted(.column) {
      mixin(--css-column)
      width: 100%;
      min-height: 110px;
    }
    ::slotted(.timestamp) {
      mixin(--css-row)
      mixin(--css-center)
      width: 100%;
      height: 54px;
    }
    ::slotted(*.flex) {
      mixin(--css-flex)
    }
    .toolbar {
      height: 72px;
      box-sizing: border-box;
      padding: 24px;
      width: 100%;
      max-width: 640px;
    }
    [icon="add"] {
      margin-top: 24px;
    }
    .wrapper {
      display: flex;
      box-sizing: border-box;
      padding: 12px 24px 24px;
      width: 100%;
    }
    custom-svg-icon {
      cursor: pointer;
    }
    ::slotted(.key) {
      width: 100%;
      mixin(--css-row)
      mixin(--css-center)
    }
    apply(--css-row)
    apply(--css-center)
    apply(--css-flex)
    `,
  ];
  render() {
    console.log(this.fields);

    return html`
      <flex-container>
        ${this.fields
          ? html`<input-fields .fields=${this.fields}></input-fields>`
          : ''}
      </flex-container>

      <shop-admin-action-bar></shop-admin-action-bar>
    `;
  }
}
