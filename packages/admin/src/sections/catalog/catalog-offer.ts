import { LitElement, PropertyValueMap, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { customElement } from 'define-custom-element-decorator'
import { Offer, OfferContext } from '../../context/offer.js';
import { consume } from '@lit-labs/context';

import '@vandeurenglenn/custom-date';
import '../../elements/input-fields/input-field.js'
import '../../elements/input-fields/input-fields.js'

import '@material/web/iconbutton/standard-icon-button.js'
import '@material/web/icon/icon.js'
import '@vandeurenglenn/lit-elements/dropdown-menu.js'
import '@vandeurenglenn/lit-elements/icon-font.js'
import '@vandeurenglenn/lit-elements/list-item.js'
import '@vandeurenglenn/lit-elements/toggle-button.js'
import '@vandeurenglenn/lit-elements/pages.js'
import './../../elements/time/time-ago.js'
import '@vandeurenglenn/flex-elements/container.js'
import '@material/web/fab/fab.js'
import './../images/images-dialog.js'
import './../../elements/image-editor/image-editor.js'

import { map } from 'lit/directives/map.js';
import { CustomPages } from './../../types.js'

@customElement()
export default class CatalogOffer extends LitElement {
  key: string

  @query('custom-pages')
  pages: CustomPages

  @property({ type: Array })
  fields: [string, string | number | boolean | string[]][]

  @property({type: Object})
  @consume({
    context: OfferContext,
    subscribe: true
  })
  offer: Offer

  get #dialog() {
    return this.shadowRoot.querySelector('images-dialog')
  }

  async addImage( ) {
    const {action, fields, image} = await this.#dialog.addImage()
    if (action === 'submit') {
      let result = []
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
        result = [await api.addImage({
          type: image.type,
          title: fields.title || image.data as string,
          description: fields.description,
          image: image.data as string
        })]
      } else if (image.type === 'library') {
console.log('from lib');

      } else {
       result = [await api.addImage({
          type: image.type,
          title: fields.title,
          description: fields.description,
          image: image.data as string
        })]
      }
      
      for (const item of result) {
        // this.album.images.push(item)
      }
      
      this.requestUpdate('offer') 
    }
  }

  protected async willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    
    if (_changedProperties.has('offer')) {
      this.fields = Object.entries(this.offer).filter(entry => 
        entry[0] !== 'key' &&
        entry[0] !== 'sku' &&
        entry[0] !== 'timestamp' &&
        entry[0] !== 'index' &&
        entry[0] !== 'public'
      )
      this.requestUpdate('fields')
      super.willUpdate(_changedProperties)
    }
  }
  
  render() {
    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  flex-container {
    overflow-y: auto;
  }
  ::slotted(.timestamp) {
    width: 100%;
    height: 54px;
  }
  .toolbar {
    height: 72px;
    box-sizing: border-box;
    padding: 24px;
    width: 100%;
    max-width: 640px;
  }
  [icon="add"] {
    margin-top: 24px;
  }
  .wrapper {
    display: flex;
    box-sizing: border-box;
    padding: 12px 24px;
    width: 100%;
  }
  custom-svg-icon {
    cursor: pointer;
  }
  custom-selector {
    flex-direction: row;
  }

  custom-selector .custom-selected {
    background: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container)
  }

  .action-bar {
    max-width: 640px;
    padding: 12px 24px;
    box-sizing: border-box;
  }

  custom-dropdown-menu::part(custom-dropdown), custom-dropdown-menu::part(custom-menu), .action-menu custom-list-item {
    min-width: 280px;
  }

  flex-row {
    width: 100%;
  }

  section {
    justify-content: center;
  }

  [non-interactive] {
    pointer-events: none;
  }

  .top-bar {
    /* padding: 24px 0 48px 0; */
  }

  md-fab {
    position: absolute;
    bottom: 24px;
    right: 24px;
  }
</style>
<images-dialog has-library></images-dialog>
<flex-row class="action-bar">
  <custom-selector attr-for-selected="label" @selected=${({detail}) => this.pages.select(detail)} default-selected="general">
    <custom-button label="general">general</custom-button>
    <custom-button label="images">images</custom-button>
  </custom-selector>

  <flex-it></flex-it>

  <custom-dropdown-menu right class="action-menu">
    <custom-list-item>
      <span slot="start"><custom-icon>save</custom-icon></span>
      <span slot="end">
        save
      </span>
      
    </custom-list-item>

    <custom-list-item non-interactive>
      <span slot="start">edited</span>
      <time-ago slot="end" value=${this.offer.timestamp}></time-ago>
    </custom-list-item>
    
  </custom-dropdown-menu>
</flex-row>

<custom-pages attr-for-selected="route" default-selected="general">
  <section route="general">
    <flex-container>
      <flex-row class="top-bar">
        <custom-typography>sku:</custom-typography>
        <flex-it></flex-it>
        ${this.offer?.sku ? this.offer.sku : this.offer.key}
        </flex-row>
      <input-field name="public" value=${this.offer.public}></input-field>
      <input-fields .fields=${this.fields}></input-fields>
    </flex-container>
  </section>

  <section route="images">
    <flex-container>
      <flex-wrap-center>
        ${map(this.images, image => html``)}
      </flex-wrap-center>
    </flex-container>
    <md-fab variant="primary" label="add image" @click=${this.addImage}>
      <md-icon slot="icon">add_a_photo</md-icon>
    </md-fab>
  </section>
</custom-pages>
`;

  }
}
