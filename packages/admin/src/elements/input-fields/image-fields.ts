import { LiteElement, html, css, customElement, property, query } from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/row.js'
import './image-field.js'
import './../dialog/images-dialog.js'
import { Product } from '@lit-shop/types'

@customElement('image-fields')
export class ImageFields extends LiteElement {
  @property({ type: Array })
  accessor fields

  @query('images-dialog')
  accessor dialog

  async addImage() {
    const result = await this.dialog.addImage()
    console.log(result)

    if (result.action !== 'submit') return

    if (result.image.type === 'library') {
      const image = await firebase.get(`images/${result.image.data}`)
      console.log(image)

      this.fields.push({ ...image, key: result.image.data })
    }

    this.requestRender()
  }

  getValues() {
    const values = []
    for (const field of this.fields) {
      values.push(field.key)
    }
    return values
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
      ${this.fields
        ? this.fields.map((field) => html` <image-field .image=${field}></image-field> `)
        : ''}

      <flex-row
        class="wrapper"
        center-center>
        <custom-icon-button
          icon="add"
          title="add info field"
          @click=${() => this.addImage()}></custom-icon-button>
      </flex-row>

      <images-dialog has-library></images-dialog>
    `
  }
}
