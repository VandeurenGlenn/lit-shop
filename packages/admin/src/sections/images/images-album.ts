
import { LitElement, css, html, nothing, render } from 'lit';
import '@material/web/fab/fab.js'
import '@material/web/icon/icon.js'
import '@material/web/iconbutton/standard-icon-button.js'
import '@material/web/button/text-button.js'
import '@material/web/textfield/filled-text-field.js'
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import '../../elements/items/album-list-item.js'
import '@vandeurenglenn/lit-elements/icon.js'
import '@material/web/list/list.js'
import '@material/web/list/list-item.js'
import { firebaseImgurAlbum, imgurBaseAlbum, imgurBaseImage } from '@lit-shop/apis/imgur-base.js';
import { customElement } from 'define-custom-element-decorator'
import './images-dialog.js'
import '@vandeurenglenn/flex-elements/row.js'
import '@vandeurenglenn/flex-elements/it.js'
import '@vandeurenglenn/lit-elements/dropdown-menu.js'
import '@vandeurenglenn/lit-elements/list-item.js'
import '@vandeurenglenn/lit-elements/icon.js'
import { consume } from '@lit-labs/context';
import { Album, AlbumContext } from '../../context/media/album.js';

declare global {
  interface HTMLElementTagNameMap {
    'images-album': ImagesAlbum
  }
}

@customElement()
export default class ImagesAlbum extends LitElement {

  @property({type: String})
  selection: string

  @consume({ context: AlbumContext, subscribe: true })
  @property({type: Object})
  album: Album

  async addImage( ) {
    const {action, fields, image} = await this.#dialog.addImage()
    if (action === 'submit') {
      let result = []
      if (image.type === 'base64[]') {
        result = await Promise.all(image.data.map(async image => 
          (await api.addImage({
            type: 'base64',
            album: this.album.deletehash,
            title: image.name,
            description: fields.description,
            image: image.data.replace('data:image/png;base64,', '')
          }))
        ))
      } else if (image.type === 'url') {
        result = [await api.addImage({
          type: image.type,
          album: this.album.deletehash,
          title: fields.title || image.data as string,
          description: fields.description,
          image: image.data as string
        })]
      } else {
       result = [await api.addImage({
          type: image.type,
          album: this.album.deletehash,
          title: fields.title,
          description: fields.description,
          image: image.data as string
        })]
      }
      
      for (const item of result) {
        this.album.images.push(item)
      }
      
      this.requestUpdate('album') 
    }
  }

  get #dialog() {
    return this.renderRoot.querySelector('images-dialog')
  }

  async removeAlbum({deletehash, firebaseKey}) {
    const {action} = await this.#dialog.removeAlbum(deletehash)
    if (action === 'submit') {
      await api.removeAlbum({deletehash, firebaseKey})
    }
  }

  async removeImage({deletehash, firebaseKey}) {
    const {action} = await this.#dialog.removeImage(deletehash)
    if (action === 'submit') {
      await api.removeImage({deletehash, firebaseKey})
    }
  }

  onselected = ({detail}) => {
    if (detail === 'remove') {
      this.removeAlbum(this.album)
    }

  } 

  static styles = [
    css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    header {
      display: flex;
      align-items: center; 
    }

    md-fab {
      position: absolute;
      bottom: 24px;
      right: 24px;
    }

    md-list, flex-row {
      width: 100%;
    }

    custom-list-item {
      min-width: 160px;
    }
    `
  ]
  render() {
    return this.album ? html`
    <images-dialog></images-dialog>

    <flex-container>
      <flex-row center>
        <md-standard-icon-button @click=${() => history.back()}>
          <custom-icon>arrow_back</custom-icon>
        </md-standard-icon-button>
        <h4>${this.album.title}</h4>
        <flex-it></flex-it>
        <custom-dropdown-menu right @selected=${this.onselected}>

          <custom-list-item variant="primary" name="remove">
            <custom-typography type="label" size="medium">
              remove
            </custom-typography>
            <custom-icon slot="end">delete</custom-icon>
          </custom-list-item>

          <custom-list-item non-interactive>
            <custom-typography type="label" size="medium">
              id:
            </custom-typography>
            <strong>${this.album.id}</strong>
          </custom-list-item>
        </custom-dropdown-menu>
      </flex-row>
      <md-list>
        ${this.album ?
          // @ts-ignore
          map(this.album.images, (image: imgurBaseImage) => html`
            <md-list-item headline="${image.title?.length > 31 ? `${image.title.slice(0, 31)}...` : image.title}" @click=${async () => location.hash = `/#!/media/images/image?selected=${await api.lookup(image.id)}`}>
              <flex-one></flex-one>
              <md-standard-icon-button data-variant="icon" slot="end" @click=${(event) => this.removeImage(image)}>
                <custom-icon>delete</custom-icon>
              </md-standard-icon-button>
            </md-list-item> 
          `)
        : nothing}
      </md-list>
    </flex-container>
    <md-fab variant="primary" label="add image" @click=${this.addImage}>
      <custom-icon slot="icon">add_a_photo</custom-icon>
    </md-fab>
    ` : nothing
  }
}
