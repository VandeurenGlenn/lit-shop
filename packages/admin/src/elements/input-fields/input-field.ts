import {
  LiteElement,
  customElement,
  property,
  query,
  html,
} from '@vandeurenglenn/lite';
import '@material/web/field/outlined-field.js';

import '@vandeurenglenn/lite-elements/typography.js';
import '@lit-shop/translate/string.js';
import { StyleList, css } from '@vandeurenglenn/lite/element';

@customElement('input-field')
export class InputField extends LiteElement {
  @query('input')
  accessor input;

  @property({ type: String })
  accessor name;

  @property({ type: String })
  accessor value;

  @property({ type: Boolean, attribute: 'is-check-box', reflect: true })
  accessor isCheckbox: boolean;

  onChange(propertyKey: string, value: any) {
    if (propertyKey === 'value') {
      this.isCheckbox = this.value === 'false' || this.value === 'true';
    }
  }

  private _oninput = () => {
    this.value = this.input.value;
  };

  get event() {
    return this.getAttribute('event') || 'event.offers';
  }

  static styles?: StyleList = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-bottom: 16px;
      }

      :host([is-check-box]) {
        flex-direction: row;
        align-items: center;
      }

      input {
        box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
          0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
        border: 1px solid #38464e;

        padding: 12px 24px;
        box-sizing: border-box;
        border-radius: 12px;
        color: var(--md-sys-color-on-surface);
        background: transparent;
      }

      input {
        margin-top: 12px;
      }
    `,
  ];

  render() {
    return this.name
      ? html`
          <custom-typography type="label" size="large">
            <translated-string>${this.name}</translated-string>
          </custom-typography>

          ${this.isCheckbox
            ? html` <flex-it></flex-it>
                <custom-toggle-button
                  togglers='["check_box", "check_box_outline_blank"]'
                >
                </custom-toggle-button>`
            : html`<input
                type="text"
                value=${this.value}
                name=${this.name}
                @input=${this._oninput}
              />`}
        `
      : html``;
  }
}
