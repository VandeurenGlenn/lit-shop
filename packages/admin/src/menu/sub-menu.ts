import { LitElement, html, css, PropertyValueMap } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import './menu-item.js'
import { CustomSelector } from '@vandeurenglenn/lit-elements/selector.js';
import '@vandeurenglenn/lit-elements/icon.js'

@customElement('sub-menu')
export class SubMenu extends LitElement {
  
  @property({ type: String, attribute: true })
  headline: string;

  @property({ type: Boolean, reflect: true })
  open: boolean = false

  static styles = [
    CustomSelector.styles,
    css`
      :host {
        display: block;
        height: auto;
        border-radius: var(--md-sys-shape-corner-extra-large);
        box-sizing: border-box;
      }

      :host([open]) ::slotted(*) {
        padding: auto;
        transform: scale(1) translateX(0);
        height: auto;
        opacity: 1;
        box-sizing: border-box;
        transition: opacity ease-in 240ms;
        min-height: initial;
      }

      ::slotted(*) {
        transform: scale(0) translateX(-20%);
        transform-origin: top left;
        height: 0px;
        padding: 0;
        will-change: transform, height, padding;
        opacity: 0;
        transition: opacity ease-out 240ms;
        padding-left: 12px;
      }

      ::slotted(*) {
        min-height: 0;
      }

      ::slotted(*:not(sub-menu))  {
        padding: 0 24px;
      }
      :host([open]) ::slotted(*:not(menu-item)[open]) {
        padding: 12px;
      }
    `
  ];

  render() {
    return html`
    <menu-item headline="${this.headline}" @click=${() => (this.open = !this.open)} noninteractive>
      <custom-icon slot="start" icon=${this.open ? 'expand_more' : 'chevron_right'}></custom-icon>
    </menu-item>
    <slot></slot>
    `;
  }
}
