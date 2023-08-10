
import { LitElement, css, html, render } from 'lit';
import '@material/web/fab/fab.js'
import '@material/web/icon/icon.js'
import '@material/web/iconbutton/standard-icon-button.js'
import '@material/web/fab/fab.js'
import '@material/web/button/text-button.js'
import '@material/web/textfield/filled-text-field.js'
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import '@material/web/list/list.js'
import '@material/web/list/list-item.js'
import '@vandeurenglenn/lit-elements/icon.js'
import { imgurBaseImage } from '@lit-shop/apis/imgur-base.js';
import './images-dialog.js'
import { customElement } from 'define-custom-element-decorator';
import '@vandeurenglenn/lit-elements/card.js'
import '@vandeurenglenn/lit-elements/typography.js'
import '@vandeurenglenn/lit-elements/icon.js'
import '@vandeurenglenn/lit-elements/icon-button.js'

import {CustomTypography} from '@vandeurenglenn/lit-elements/elements.js'
import { consume } from '@lit-labs/context';
import { ImagesContext } from '../../context/media/images.js';

declare global {
  interface HTMLElementTagNameMap {
    'images-library': ImagesLibrary
  }
}

@customElement()
export default class ImagesLibrary extends LitElement {

  @consume({ context: ImagesContext, subscribe: true })
  @property({type: Array})
  images

  get #dialog() {
    return this.renderRoot.querySelector('images-dialog')
  }

  #onclick = (event, firebaseKey) => {
    event.cancelBubble = true
    location.hash = `#!/media/images/image?selected=${firebaseKey}`
  }

  async removeImage(deletehash, firebaseKey) {
    const {action} = await this.#dialog.removeImage(deletehash)
    if (action === 'submit') {
      this.#dialog.busy('removing image')
      await api.removeImage({deletehash, firebaseKey})
      const index = this.images.indexOf(this.images.filter(item => item.deletehash === deletehash)[0])
      this.images.splice(index, 1)
      this.requestUpdate('images')
      this.#dialog.close()
    }
  }

  async addImage( ) {
    const {action, fields, image} = await this.#dialog.addImage()
    if (action === 'submit') {
      this.#dialog.busy('uploading image')
      let result
      if (image.type === 'base64[]') {
        result = await Promise.all(image.data.map(async image => 
          (await api.addImage({
            type: 'base64',
            title: image.name,
            description: fields.description,
            image: image.data.replace('data:image/png;base64,', '')
          }))
        ))
      } else if (image.type === 'url') {
        result = await Promise.all([await api.addImage({
          type: image.type,
          title: fields.title || image.data as string,
          description: fields.description,
          image: image.data as string
        })])
      } else {
       result = await Promise.all([await api.addImage({
          type: image.type,
          title: fields.title,
          description: fields.description,
          image: image.data as string
        })])
      }

      for (const item of result) {
        this.images.push(item)
      }
      
      this.requestUpdate('images')
      this.#dialog.close()
    }
  }

  static styles = [
    css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    md-fab {
      position: absolute;
      bottom: 24px;
      right: 24px;
    }

    h5 {
      margin: 0;
    }

    md-filled-text-field:not(first-child) {
      padding-top: 12px;
    }

    md-dialog {
      --_container-color: #2d2f31;
    }

    md-filled-text-field {
      --_container-color: #2d2f31;
    }

    flex-container {
      overflow-y: auto;
    }

    img {
      width: 150px;
      cursor: pointer;
    }
    `
  ]

  render() {
    return html`
    <images-dialog></images-dialog>

    <flex-container>
      <flex-wrap-center>
        ${
          map(this.images, (image: imgurBaseImage) => html`
          <img
            @click=${(event) => this.#onclick(event, image.firebaseKey)}
            src=${`${location.origin}/api/image?image=${image.link.replace('.png', 'b.png')}`}>
          `)
        }
      </flex-wrap-center>
    </flex-container>
    <md-fab variant="primary" label="add image" @click=${this.addImage}>
      <custom-icon slot="icon">add_a_photo</custom-icon>
    </md-fab>
    `
  }
}
