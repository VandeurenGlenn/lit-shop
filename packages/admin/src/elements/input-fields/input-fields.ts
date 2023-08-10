import { LitElement, PropertyValueMap, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import './input-field.js'
import { InputField } from './input-field.js';

@customElement('input-fields')
export class InputFields extends LitElement {
  @property({ type: Array })
  fields;
  
  async addField() {
    const name = await prompt('please enter field name');
    if (name) {
      this.fields.push([name, ''])
      this.requestUpdate('fields')
    }
  }

  static styles = [
    css`
      :host {
        width: 100%;
      }
    `
  ]
  
  render() {
    return html`
    ${map(this.fields, field => html`
      <input-field name=${field[0]} value=${field[1]}></input-field>
    `)}

    <flex-row class="wrapper" center-center>
      <custom-icon-button icon="add" title="add info field" @click=${this.addField}>add</custom-icon-button>
    </flex-row>
    <flex-it></flex-it>
    `;
  }
}
