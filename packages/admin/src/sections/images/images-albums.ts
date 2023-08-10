
import { LitElement, css, html, render } from 'lit';
import '@material/web/fab/fab.js'
import '@material/web/icon/icon.js'
import '@material/web/iconbutton/standard-icon-button.js'
import '@material/web/dialog/dialog.js'
import '@material/web/button/text-button.js'
import '@material/web/textfield/filled-text-field.js'
import { property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import '../../elements/items/album-list-item.js'
import '@material/web/list/list.js'
import '@material/web/list/list-item.js'
import { firebaseImgurAlbum, imgurBaseAlbum } from '@lit-shop/apis/imgur-base.js';
import './images-dialog.js'
import { customElement } from 'define-custom-element-decorator';
import '@material/web/select/filled-select.js'
import '@material/web/select/select-option.js'
import { consume } from '@lit-labs/context';
import { AlbumsContext } from '../../context/media/albums.js';

declare global {
  interface HTMLElementTagNameMap {
    'images-albums': ImagesAlbums
  }
}

@customElement()
export default class ImagesAlbums extends LitElement {

  @consume({ context: AlbumsContext, subscribe: true })
  @property({type: Array})
  albums

  get #dialog() {
    return this.renderRoot.querySelector('images-dialog')
  }

  #onclick = (event, firebaseKey) => {
    event.cancelBubble = true
    location.hash = `/#!/media/images/album?selected=${firebaseKey}`
  }

  async createAlbum()  {
    const {action, fields} = await this.#dialog.createAlbum()
    if (action === 'submit') {
      const result = await api.createAlbum(fields)
      const album = await api.getAlbum(result.firebaseKey)
      this.albums.push({...result, ...album})
      this.requestUpdate('albums')
    }
  }

  async removeAlbum(deletehash, firebaseKey) {
    const {action} = await this.#dialog.removeAlbum(deletehash)
    if (action === 'submit') {
      await api.removeAlbum({deletehash, firebaseKey})
      const index = this.albums.indexOf(this.albums.filter(item => item.deletehash === deletehash)[0])
      this.albums.splice(index)
      this.requestUpdate('albums')
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

    md-list {
      width: 100%;
    }
    `
  ]

  render() {
    return html`
    <images-dialog></images-dialog>

    <flex-container>
      <md-list>
        ${
          map(this.albums, (album: imgurBaseAlbum) => html`
            <md-list-item headline="${album.title?.length > 31 ? `${album.title.slice(0, 31)}...` : album.title}" @click=${(event) => this.#onclick(event, album.firebaseKey)}>
              <flex-one></flex-one>
              <md-standard-icon-button data-variant="icon" slot="end" @click=${(event) => event.cancelBubble = true && this.removeAlbum(album.deletehash, album.firebaseKey)}>
                <custom-icon>delete</custom-icon>
              </md-standard-icon-button>
            </md-list-item> 
          `)
        }
      </md-list>
    </flex-container>
    <md-fab variant="primary" label="create album" @click=${this.createAlbum}>
      <custom-icon slot="icon">add</custom-icon>
    </md-fab>
    `
  }
}
