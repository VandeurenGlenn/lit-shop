
import { LitElement, css, html, render } from 'lit';
import '@material/web/fab/fab.js'
import '@material/web/icon/icon.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/button/text-button.js'
import '@material/web/textfield/filled-text-field.js'
import { property } from 'lit/decorators.js';
import '@material/web/list/list.js'
import '@material/web/list/list-item.js'
import './images-dialog.js'
import { firebaseImgurAlbum, firebaseImgurImage, imgurBaseImage } from '@lit-shop/apis/imgur-base.js';
import { customElement } from 'define-custom-element-decorator';
import '@vandeurenglenn/lit-elements/dropdown-menu.js'
import '@vandeurenglenn/lit-elements/list-item.js'
import '@vandeurenglenn/flex-elements/row.js'
import '@vandeurenglenn/flex-elements/it.js'
import { ImageEditor } from '../../elements/image-editor/image-editor.js';
import { Image, ImageContext } from '../../context/media/image.js';
import { consume } from '@lit-labs/context';
import './../../elements/image-editor/image-editor.js'

declare global {
  interface HTMLElementTagNameMap {
    'images-image': ImagesImage
  }
}

@customElement()
export default class ImagesImage extends LitElement {

  @property({type: String})
  selection: string

  @consume({ context: ImageContext, subscribe: true })
  @property({type: Object})
  image: Image

  get #imageEditor(): ImageEditor {
    return document.querySelector('admin-shell').shadowRoot.querySelector('image-editor')
  }
   

  constructor() {
    super()
    
    // this.onAction = this.onAction.bind(this)
  }

  get #dialog() {
    return this.renderRoot.querySelector('images-dialog')
  }

  async removeImage() {
    const result = await this.#dialog.removeImage(this.image.deletehash)
    if (result.action === 'submit') {
      this.#dialog.busy(`removing image`)
      await api.removeImage(this.image)
      this.#dialog.close()
      location.hash = `/#!/media/images/library`
    }
    const provider = litShop.contextProviders?.images
    if (provider) {
      const index = provider.images.indexOf(this.image)
      console.log('provider');
      
      provider.images.splice(index, 1)
    }
  }

  async removeOriginal() {
    const result = await this.#dialog.removeOriginal(this.image.deletehash)
    if (result.action === 'remove') {
      this.#dialog.busy(`removing image`)
      await api.removeImage(this.image)
      this.#dialog.close()
    }

    return result.action
  }

  async editImage() {
    const {action, image} = await this.#imageEditor.show(this.image.link, this.image.deletehash)
    if (action === 'done') {
      this.#dialog.busy('uploading image')
      const upload = await api.addImage({
        type: 'base64',
        title: this.image.title,
        description: this.image.description,
        image: image.replace('data:image/png;base64,', '')
      })
      this.#dialog.close()

      await this.removeOriginal()
      // if (removeAction === 'remove') 
      location.hash = `/#!/media/images/image?selected=${upload.firebaseKey}`
    }
    
  }

  async willUpdate(changedProperties) {
    if (changedProperties.has('image')) {
      this.image.link = `${location.origin}/api/image?image=${this.image.link}`
      
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
    this.renderRoot.querySelector('custom-dropdown-menu').open = false
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
          <custom-list-item variant="primary" label="edit" @click=${this.editImage}>
            <custom-typography type="label" size="medium">
              edit
            </custom-typography>
            <custom-icon slot="end">edit</custom-icon>
          </custom-list-item>

          <custom-list-item variant="primary" label="remove" @click=${this.removeImage}>
            <custom-typography type="label" size="medium">
              remove
            </custom-typography>
            <custom-icon slot="end">delete</custom-icon>
          </custom-list-item>
        </custom-dropdown-menu>
      </flex-row>
      <img src=${this.image?.link}>
    </flex-container>

    <image-editor></image-editor>
    `
  }
}
