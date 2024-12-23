import { LiteElement, customElement, property, query, html } from '@vandeurenglenn/lite'
import '@vandeurenglenn/lite-elements/toggle-button.js'
import '@material/web/field/outlined-field.js'

import '@vandeurenglenn/lite-elements/typography.js'
import '@lit-shop/translate/string.js'
import { StyleList, css } from '@vandeurenglenn/lite/element'

@customElement('image-field')
export class ImageField extends LiteElement {
  @property({ type: String })
  accessor name

  @property({ type: String })
  accessor value

  @property({ type: Array })
  accessor options

  @property({ type: Object })
  accessor image

  @property({ type: String })
  accessor _link
  @property({ type: Boolean }) accessor error

  checkValidity() {
    return true
  }

  showError() {}

  static styles?: StyleList = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-bottom: 16px;
      }
    `
  ]

  render() {
    return html`
      ${this.image
        ? html` <img
            src=${`api/image?image=${this.image.link}`}
            alt=${this.image.title} />`
        : ''}
    `
  }
}
