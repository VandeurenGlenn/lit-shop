import './menu-item.js';
import { CustomSelector } from '@vandeurenglenn/lite-elements/selector.js';
import '@vandeurenglenn/lite-elements/icon.js';
import {
  LiteElement,
  customElement,
  property,
  html,
  css,
} from '@vandeurenglenn/lite';

@customElement('sub-menu')
export class SubMenu extends LiteElement {
  @property({ type: String, attribute: true })
  accessor headline: string;

  @property({ type: Boolean, reflect: true })
  accessor open: boolean = false;

  static styles = [
    ...CustomSelector.styles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        height: auto;
        border-radius: var(--md-sys-shape-corner-extra-large);
        box-sizing: border-box;
      }

      :host([open]) {
        gap: 6px;
        pointer-events: none;
        padding: 0 12px 12px 0;
      }

      :host([open]) ::slotted(*) {
        transform: scale(1) translateX(0);
        height: auto;
        opacity: 1;
        box-sizing: border-box;
        transition: opacity ease-in 240ms;
        min-height: initial;
        pointer-events: auto;
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

      ::slotted(*:not(sub-menu)) {
        margin: 0 0 0 24px;
        width: calc(100% - 24px);
      }
      :host([open]) ::slotted(*:not(menu-item)[open]) {
        padding: 12px;
      }
    `,
  ];

  render() {
    return html`
      <menu-item
        .headline=${this.headline}
        @click=${() => (this.open = !this.open)}
        noninteractive
      >
        <custom-icon
          slot="start"
          .icon=${this.open ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
        ></custom-icon>
      </menu-item>
      <slot></slot>
    `;
  }
}
