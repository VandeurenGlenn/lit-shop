import {
  LiteElement,
  html,
  css,
  customElement,
  property,
} from '@vandeurenglenn/lite';
import '@vandeurenglenn/flex-elements/row.js';
import './input-field.js';

@customElement('input-fields')
export class InputFields extends LiteElement {
  @property({ type: Array })
  accessor fields;

  addField = async () => {
    const name = await prompt('please enter field name');
    if (name) {
      this.fields.push([name, '']);
      this.requestRender();
    }
  };

  static styles = [
    css`
      :host {
        width: 100%;
      }
    `,
  ];

  render() {
    return html`
      ${this.fields
        ? this.fields.map(
            (field) => html`
              <input-field .name=${field[0]} .value=${field[1]}></input-field>
            `
          )
        : ''}

      <flex-row class="wrapper" center-center>
        <custom-icon-button
          icon="add"
          title="add info field"
          @click=${this.addField}
        ></custom-icon-button>
      </flex-row>
      <flex-it></flex-it>
    `;
  }
}
