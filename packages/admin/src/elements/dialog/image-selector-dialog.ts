import { LitElement, html, css, render, nothing, PropertyValueMap } from 'lit';
import { customElement } from 'define-custom-element-decorator';
import '@material/web/dialog/dialog.js'
import '@material/web/button/filled-tonal-button.js'
import '@material/web/textfield/outlined-text-field.js';
import {imgurAlbumParams} from '@lit-shop/apis/imgur/types';
import { DeviceApi } from '@lit-shop/apis/device';
import '@material/web/progress/circular-progress.js'
import { property, query, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import '@vandeurenglenn/lit-elements/tabs.js'
import { Image, ImagesContext } from '../../context/media/images.js';
import { consume } from '@lit-labs/context';
import { imgurBaseImage } from '@lit-shop/apis/imgur-base';

declare type actionResult = {action: string, fields: imgurAlbumParams, image?: { data: string | {name: string, data: string}[], type: string}}

declare global {
  interface HTMLElementTagNameMap {
    'image-selector-dialog': ImageSelectorDialog
  }
}

@customElement()
export class ImageSelectorDialog extends LitElement {

  deviceApi: DeviceApi = new DeviceApi()
  @query('custom-pages')
  pages

  @consume({ context: ImagesContext, subscribe: true })
  @property({type: Array})
  images: imgurBaseImage[]

  @query('custom-tabs')
  selector

  @property({ type: Boolean })
  open: boolean = false

  @property({ type: Boolean })
  frontCameraDisabled: boolean = false

  @property({ type: Boolean })
  rearCameraDisabled: boolean = false

  @property({ type: Boolean, attribute: 'has-library' })
  hasLibrary: boolean
  
  static styles = [
    css`
      :host {
        display: block;
      }

      h5 {
        margin: 0;
      }

      custom-tab.custom-selected {
        background: var(--md-sys-color-tertiary);
        border: none;
      }

      custom-tab.custom-selected span, custom-tab.custom-selected md-icon {
        color: var(--md-sys-color-on-tertiary);
      }

      custom-tab {
        gap: 8px;
        height: 40px;
        padding: 0 12px;
        box-sizing: border-box;
        width: auto;
        border-radius: 20px;
        font: var(--_supporting-text-type);
      }

      custom-tabs {
        height: 40px;
      }

      section {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        min-height: 168px;
        position: absolute;
        transform: scale(0);
        justify-content: center;
        align-items: center;
      }

      section[route="camera"] {
        overflow-y: hidden;
      }

      section.custom-selected {
        
        transform: scale(1);
        position: relative;
     
      }
      md-outlined-text-field {
        padding-top: 12px;
      }

      .camera-actions {
        width: 100%;
        position: absolute;
        bottom: 0;
      }

      section[route="camera"] flex-container {
        height: 320px;
      }

      flex-column {
        width: auto;
      }

      flex-container video, img:not([data-variant="icon"]) {
        height: -webkit-fill-available;
        width: -webkit-fill-available;
      }
      
      [route="library"] img {
        width: 150px;
        cursor: pointer;
      }

      [data-variant="icon"] {
        height: 48px;
        width: 48px;
      }

    md-dialog {
      --_container-color: #2d2f31;
    }
    `
  ];

  get #dialog() {
    return this.renderRoot.querySelector('md-dialog')
  }

  get #cameraPreview() {
    return this.renderRoot.querySelector('.camera-preview')
  }

  #cameraFacingMode = 'user'
  #image: {data: string | {name: string, data: string}[], type: string} = { data: null, type: null }

  #takePhoto = async () => {
    // this._previewEl.stop();
    // this._previewEl.srcObject = null;
    const blob = await this.deviceApi.camera.takePhoto(this.#cameraFacingMode);


    // const fd = new FormData();
    // fd.append('image', blob);

    this.#image.data = await globalThis.readAsDataURL(blob);
    this.#image.type = 'base64'

    const img = document.createElement('img')
    img.src = this.#image.data as string
    this.renderRoot.querySelector('flex-container').replaceChild(img.cloneNode(true), this.#cameraPreview)
  }

  readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    })
  }

  #selectFile = ({}) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true

    const onchange = async (event) => {
      
      const files = await Promise.all(Array.from(input.files).map(async (file) => {
        const data = await this.readAsDataURL(file)
        const item = document.createElement('md-list-item')
        item.headline = file.name
        item.setAttribute('noninteractive', '')
        item.innerHTML = `
          <img data-variant="icon" slot="start" src="${data}">
          <md-standard-icon-button slot="end"><custom-icon>delete</custom-icon></md-standard-icon-button>
        `
        item.onclick=() => {
          this.shadowRoot.querySelector('section[route="file"]').removeChild(item)
        }
        this.renderRoot.querySelector('section[route="file"]').appendChild(item) 
        return {name: file.name, data}
      }))
      
      this.#image.data = files as {name: string, data: string}[]
      this.#image.type = 'base64[]'
      input.removeEventListener('change', onchange)
    }

    input.addEventListener('change', onchange)

    input.click()
  }

  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    
    if (this.open) {
     this.hasLibrary ? this.select('library') : this.select('url')
    }
    super.updated(_changedProperties)
  }

  select(value) {
    this.selector.select(value)
  }

  #onSelected = async ({detail}) => {
    this.renderRoot.querySelector('custom-pages').select(detail)
    if (detail === 'camera') {
      this.frontCameraDisabled = !await this.deviceApi.hasFrontCam()
      this.rearCameraDisabled = !await this.deviceApi.hasBackCam()
      this.deviceApi.camera.preview(this.#cameraPreview, this.#cameraFacingMode);
    }
  }

  #onlibclick = (event, hash) => {
    this.#image.data = hash
    this.#image.type = 'library'
    
  }

  show() {
    this.#dialog.show()
  }

  #addImageTemplate() {
    return html`
    <form id="form-content" slot="content" method="dialog">
        <custom-tabs attr-for-selected="route" @selected=${this.#onSelected}>
        ${this.hasLibrary ? html`
        <custom-tab route="library">
          <md-icon>photo_library</md-icon>
          <span>library</span>
        </custom-tab>
      ` : nothing}
      <custom-tab route="url">
        <md-icon>link</md-icon>
        <span>url</span>
      </custom-tab>
      <flex-it flex="1"></flex-it>

      <custom-tab route="camera">
        <md-icon>camera</md-icon>
        <span>camera</span>
      </custom-tab>
      <flex-it flex="1"></flex-it>

      <custom-tab route="file">
        <md-icon>upload</md-icon>
        <span>file</span>
      </custom-tab>
      <flex-it flex="2"></flex-it>
    </custom-tabs>
      <custom-pages attr-for-selected="route">

        ${this.hasLibrary ? html`
          <section route="library">
            <flex-wrap-around>
            ${
              map(this.images, (image: imgurBaseImage) => html`
              <img
                @click=${(event) => this.#onlibclick(event, image.firebaseKey)}
                src=${`${location.origin}/api/image?image=${image.link.replace('.png', 'b.png')}`}>
              `)
            }
            
            </flex-wrap-around>
            
          </section>
        ` : nothing}
        <section route="url">
          <flex-column>
            add image using a link/url
            <md-outlined-text-field label="url" input-field="url"></md-outlined-text-field>
          </flex-column>
          
        </section>

        <section route="camera">
          <flex-container>
            <video autoplay mute="true" class="camera-preview"></video>
          </flex-container>

          <flex-row class="camera-actions"> 
            <flex-it flex="2"></flex-it>
            
            <md-standard-icon-button @click=${() => this.#cameraFacingMode = 'user'} ?disabled=${this.frontCameraDisabled}>
              <md-icon>photo_camera_front</md-icon>
            </md-standard-icon-button>
            
            <flex-it flex="1"></flex-it>
            
            <md-standard-icon-button style="transform: scale(1.66);" @click=${this.#takePhoto}>
              <md-icon>photo_camera</md-icon>
            </md-standard-icon-button>

            <flex-it flex="1"></flex-it>

            <md-standard-icon-button @click=${() => this.#cameraFacingMode = 'environment'} ?disabled=${this.rearCameraDisabled}>
              <md-icon>photo_camera_back</md-icon>
            </md-standard-icon-button>

            <flex-it flex="2"></flex-it>
          </flex-row>
        </section>

          <section route="file">
            <md-filled-tonal-button @click=${this.#selectFile}>
              <md-icon slot="icon">upload</md-icon>
              select
            </md-filled-tonal-button>
          </section>
        </custom-pages>
      </form>

      <flex-row slot="actions">
        <md-text-button form="form-content" value="cancel">cancel</md-text-button>
        <flex-one></flex-one>
        <md-text-button form="form-content" value="submit">submit</md-text-button>
      </flex-row>

    `
  }

  #onAction = (): Promise<actionResult> => new Promise((resolve, reject) => {
    const action = (event) => {
      
      const inputFields = Array.from(this.renderRoot.querySelectorAll('[input-field]')) as MdFilledTextField[]
      const fields = {}

      for (const field of inputFields) {
        fields[field.label] = field.value
      }
      
      if (!this.#image.type) {
        const inputField = this.renderRoot.querySelector('[input-field]') as HTMLInputElement
        this.#image.type = inputField ? 'url' : undefined
        this.#image.data = inputField?.value
      }

      const image = {
        type: this.#image.type,
        data: Array.isArray(this.#image.data) ? [...this.#image.data] : this.#image.data
      }

      resolve({ action: event.returnValue, fields, image })

    // @ts-ignore
      this.#dialog.removeEventListener('closed', action)
      
      this.#image.data = null
      this.#image.type = null

      this.deviceApi.camera.close()
      this.#dialog.close()
      render(html``, this.#dialog)
    }

    // @ts-ignore
    this.#dialog.addEventListener('closed', action)
  })

  #busytemplate(title, description) {
    return html`
      <flex-row slot="header">
        <h5>${title}</h5>
      </flex-row>

      <flex-column>
        ${description}
      </flex-column>

      <flex-row style="justify-content: center; width: 100%;">
        <md-circular-progress indeterminate></md-circular-progress>
      </flex-row>
    `  
  }
  async addImage() {
    render(this.#addImageTemplate(), this.#dialog)
    this.show()
    return this.#onAction() 
  }

  async busy(title, description?) {
    render(this.#busytemplate(title, description), this.#dialog)
    this.show()
  }

  close() {
    this.#dialog.close()
  }

  render() {
    return html`
    <md-dialog .open=${this.open}></md-dialog>
    `;
  }
}
