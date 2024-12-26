import {
  LiteElement,
  html,
  css,
  customElement,
  property,
  query,
  queryAll
} from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/row.js'
import './image-field.js'
import './../dialog/images-dialog.js'
import { Product } from '@lit-shop/types'
import { ImageField } from './image-field.js'

@customElement('image-fields')
export class ImageFields extends LiteElement {
  @property({ type: Array })
  accessor fields

  @query('images-dialog')
  accessor dialog

  @queryAll('image-field') accessor imageFields

  async addImage() {
    const result = await this.dialog.addImage()
    console.log(result)

    if (result.action !== 'submit') return

    if (result.image.type === 'library') {
      const image = await firebase.get(`images/${result.image.data}`)
      console.log(image)

      this.fields.push({ ...image, key: result.image.data })
    } else if (result.image.type === 'base64[]') {
      let image = await Promise.all(
        result.image.data.map(
          async (image) =>
            await api.addImage({
              type: 'base64',
              title: image.name,
              description: result.fields.description,
              image: image.data
                .replace('data:image/png;base64,', '')
                .replace('data:image/jpeg;base64,', '')
            })
        )
      )
      console.log(image)
      const fields = this.fields || []
      for (const result of image) {
        fields.push({ title: result.title, link: result.link, key: result.firebaseKey })
      }
      this.fields = fields
    } else if (result.image.type === 'url') {
      const image = await Promise.all([
        await api.addImage({
          type: result.image.type,
          title: result.fields.title || (result.image.data as string),
          description: result.fields.description,
          image: result.image.data as string
        })
      ])
    } else {
      const image = await Promise.all([
        await api.addImage({
          type: result.image.type,
          title: result.fields.title,
          description: result.fields.description,
          image: result.image.data as string
        })
      ])
    }

    this.requestRender()
  }

  getValues() {
    const values = []
    // const imageFields = Array.from(this.shadowRoot.querySelectorAll('image-field')) as ImageField[]
    for (const field of this.fields) {
      values.push(field.key)
    }
    return values
  }

  checkValidityAndGetValues() {
    return { error: false, values: this.getValues() }
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
