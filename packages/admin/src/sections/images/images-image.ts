import { LiteElement, css, html, property, customElement } from '@vandeurenglenn/lite'
import '@material/web/fab/fab.js'
import '@material/web/icon/icon.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/button/text-button.js'
import '@material/web/textfield/filled-text-field.js'
import '@material/web/list/list.js'
import '@material/web/list/list-item.js'
import './images-dialog.js'
import { firebaseImgurAlbum, firebaseImgurImage, imgurBaseImage } from '@lit-shop/apis/imgur-base.js'
import '@vandeurenglenn/lite-elements/dropdown-menu.js'
import '@vandeurenglenn/lite-elements/list-item.js'
import '@vandeurenglenn/flex-elements/row.js'
import '@vandeurenglenn/flex-elements/it.js'
import { ImageEditor } from '../../elements/image-editor/image-editor.js'
import { Image, ImageContext } from '../../context/media/image.js'
import './../../elements/image-editor/image-editor.js'

declare global {
  interface HTMLElementTagNameMap {
    'images-image': ImagesImage
  }
}

@customElement('images-image')
export default class ImagesImage extends LiteElement {
  @property({ type: String })
  accessor selection: string

  @property({ type: Object, consumes: true })
  accessor image: Image

  get _imageEditor(): ImageEditor {
    return document.querySelector('admin-shell').shadowRoot.querySelector('image-editor')
  }

  get _dialog() {
    return this.shadowRoot.querySelector('images-dialog')
  }

  async removeImage() {
    const result = await this._dialog.removeImage(this.image.deletehash)
    if (result.action === 'submit') {
      this._dialog.busy(`removing image`)
      await api.removeImage(this.image)
      this._dialog.close()
      location.hash = `/#!/media/images/library`
    }
    const provider = litShop.contextProviders?.images
    if (provider) {
      const index = provider.images.indexOf(this.image)
      console.log('provider')

      provider.images.splice(index, 1)
    }
  }

  async removeOriginal() {
    const result = await this._dialog.removeOriginal(this.image.deletehash)
    if (result.action === 'remove') {
      this._dialog.busy(`removing image`)
      await api.removeImage(this.image)
      this._dialog.close()
    }

    return result.action
  }

  async editImage() {
    const { action, image } = await this._imageEditor.show(this.image.link, this.image.deletehash)
    if (action === 'done') {
      this._dialog.busy('uploading image')
      const upload = await api.addImage({
        type: 'base64',
        title: this.image.title,
        description: this.image.description,
        image: image.replace('data:image/png;base64,', '')
      })
      this._dialog.close()

      await this.removeOriginal()
      // if (removeAction === 'remove')
      location.hash = `/#!/media/images/image?selected=${upload.firebaseKey}`
    }
  }

  async willChange(propertyKey: string, value: any) {
    console.log(propertyKey, value)

    if (propertyKey === 'image' && value) {
      value.link = `${location.origin}/api/image?image=${value.link}`
      return value
      // this.requestUpdate('image')
    }
  }
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      flex-row {
        box-sizing: border-box;
        padding: 12px 6px;
        --flex-display-width: 100%;
      }

      img {
        width: 100%;
        max-height: 640px;
      }
    `
  ]
  mouseup() {
    this.shadowRoot.querySelector('custom-dropdown-menu').open = false
  }

  render() {
    return html`
      <images-dialog></images-dialog>

      <flex-container center-center>
        <flex-row>
          <md-icon-button @click=${() => history.back()}>
            <custom-icon>arrow_back</custom-icon>
          </md-icon-button>
          <flex-it></flex-it>
          <custom-dropdown-menu right>
            <custom-list-item
              variant="primary"
              label="edit"
              @click=${() => this.editImage()}>
              <custom-typography
                type="label"
                size="medium">
                edit
              </custom-typography>
              <custom-icon slot="end">edit</custom-icon>
            </custom-list-item>

            <custom-list-item
              variant="primary"
              label="remove"
              @click=${() => this.removeImage()}>
              <custom-typography
                type="label"
                size="medium">
                remove
              </custom-typography>
              <custom-icon slot="end">delete</custom-icon>
            </custom-list-item>
          </custom-dropdown-menu>
        </flex-row>
        <img src=${this.image?.link} />
      </flex-container>

      <image-editor></image-editor>
    `
  }
}
