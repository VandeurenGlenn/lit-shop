import { LitElement, PropertyValueMap, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import '@material/web/field/outlined-field.js'

import '@vandeurenglenn/lit-elements/typography.js'

@customElement('input-field')
export class InputField extends LitElement {
  @query('input')
  input

  @property({type: String})
  name

  @property({ type: String })
  value

  @property({ type: Boolean, attribute: 'is-check-box', reflect: true })
  isCheckbox: boolean

  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has('value')) {
      this.isCheckbox = this.value === 'false' || this.value === 'true'
    }
  }

  #oninput = () => {
    this.value = this.input.value
  }

  get event() {
    return this.getAttribute('event') || 'event.offers'
  }

  render() {
    return html`<style>
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
                    0 1px 5px 0 rgba(0, 0, 0, 0.12),
                    0 3px 1px -2px rgba(0, 0, 0, 0.2);
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
    </style>
    <custom-typography type="label" size="large">
      <translated-string>${this.name}</translated-string>
    </custom-typography>
    
    ${this.isCheckbox ?
      html`
        <flex-it></flex-it>
        <custom-toggle-button>
          <custom-icon>check_box</custom-icon>
          <custom-icon>check_box_outline_blank</custom-icon>
        </custom-toggle-button>` :
      html`<input type="text" value=${this.value} name=${this.name} @input=${this.#oninput}>`}
    
    `
  }
}