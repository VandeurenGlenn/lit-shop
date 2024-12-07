import { LiteElement, css, html, customElement, property, map } from '@vandeurenglenn/lite'
import '@material/web/fab/fab.js'
import '@material/web/icon/icon.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/dialog/dialog.js'
import '@material/web/button/text-button.js'
import '@material/web/textfield/filled-text-field.js'
import '../../elements/items/album-list-item.js'
import '@material/web/list/list.js'
import '@material/web/list/list-item.js'
import '@vandeurenglenn/flex-elements/container.js'
import { firebaseImgurAlbum, imgurBaseAlbum } from '@lit-shop/apis/imgur-base.js'
import './images-dialog.js'
import '@material/web/select/filled-select.js'
import '@material/web/select/select-option.js'

declare global {
  interface HTMLElementTagNameMap {
    'images-albums': ImagesAlbums
  }
}

@customElement('images-albums')
export default class ImagesAlbums extends LiteElement {
  @property({ type: Array, consumes: true })
  accessor albums: imgurBaseAlbum[] = []

  get #dialog() {
    return this.shadowRoot.querySelector('images-dialog')
  }

  #onclick = (event, firebaseKey) => {
    event.cancelBubble = true
    location.hash = `/#!/media/images/album?selected=${firebaseKey}`
  }

  async createAlbum() {
    const { action, fields } = await this.#dialog.createAlbum()
    if (action === 'submit') {
      const result = await api.createAlbum(fields)
      const album = await api.getAlbum(result.firebaseKey)
      this.albums.push({ ...result, ...album })
      this.requestRender()
    }
  }

  async removeAlbum(deletehash, firebaseKey) {
    const { action } = await this.#dialog.removeAlbum(deletehash)
    if (action === 'submit') {
      await api.removeAlbum({ deletehash, firebaseKey })
      const index = this.albums.indexOf(this.albums.filter((item) => item.deletehash === deletehash)[0])
      this.albums.splice(index)
      this.requestRender()
    }
  }

  onChange(propertyKey: string, value: any): void {
    console.log(propertyKey, value)
    this.requestRender()
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
    console.log(this.albums, 'albums')
    return html`
      <images-dialog></images-dialog>

      <flex-container>
        <md-list>
          ${this.albums
            ? this.albums.map(
                (album: imgurBaseAlbum) => html`
                  <md-list-item @click=${(event) => this.#onclick(event, album.firebaseKey)}>
                    <span slot="headline"
                      >${album.title?.length > 31 ? `${album.title.slice(0, 31)}...` : album.title}</span
                    >
                    <flex-one></flex-one>
                    <md-icon-button
                      data-variant="icon"
                      slot="end"
                      @click=${(event) =>
                        (event.cancelBubble = true && this.removeAlbum(album.deletehash, album.firebaseKey))}>
                      <custom-icon icon="delete"></custom-icon>
                    </md-icon-button>
                  </md-list-item>
                `
              )
            : ''}
        </md-list>
      </flex-container>
      <md-fab
        variant="primary"
        label="create album"
        @click=${this.createAlbum}>
        <custom-icon slot="icon">add</custom-icon>
      </md-fab>
    `
  }
}
