import {
  customElement,
  property,
  query,
  html,
  css,
} from '@vandeurenglenn/lite';

import { CustomDrawerItem } from '@vandeurenglenn/lite-elements/drawer-item.js';
import { CustomSelector } from '@vandeurenglenn/lite-elements/selector';
import '@lit-shop/translate/string.js';

@customElement('menu-item')
export class MenuItem extends CustomDrawerItem {
  @property({ type: String })
  accessor headline: string;

  @property({ type: String, reflect: true })
  accessor route: string;

  @property({ type: Boolean })
  accessor noninteractive: boolean = false;

  @query('a')
  accessor _anchor: HTMLAnchorElement;

  async connectedCallback(): Promise<void> {
    if (this.noninteractive) return;

    if (!this.route) this.route = this.headline;

    this._anchor.href = `#!/${this.route}`;
  }

  static styles = [
    css`
      a {
        text-transform: capitalize;
        cursor: pointer;
        color: inherit;
        height: 54px;
        display: flex;
        flex-direction: row;
        align-items: center;
        box-sizing: border-box;
        width: 100%;
        text-decoration: none;
      }
    `,
    ...CustomSelector.styles,
    ...super.styles,
  ];

  render() {
    return html`
      ${this.headline
        ? html`<a>
            <slot name="start" slot="icon"></slot>
            <translated-string>${this.headline}</translated-string>
            <slot name="end" slot="end"></slot>
          </a>`
        : ''}
    `;
  }
}
