import './../../image-nails.js';
import 'custom-input/custom-input.js';
import '@vandeurenglenn/custom-date/custom-date.js';

import '../../elements/input-fields/input-field.js'
import { LitElement, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { customElement } from 'define-custom-element-decorator'

@customElement()
export default class CatalogAddOffer extends LitElement {
  #key: string
  @property({ type: String })
  set selection(value) {
    this.#key = value
    this.stamp(value)
  }

  get addFieldIcon() {
    return this.shadowRoot.querySelector('[icon="add"]');
  }

  constructor() {
    super();
    this.ref = 'offers';
    this.addField = this.addField.bind(this);
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    let timeout;
    pubsub.subscribe(`event.${this.ref}`, async ({value, name, key, type}) => {
      console.log({value, name, key, type});
      
      if (type === 'edit') {
        let ref = `offers/${key}/${name}`;  
        
        console.log(name, value);
        const offer = {...window.offers[this.#key]};
        offer[name] = value
        await firebase.database().ref(ref).set(value)
        const timestamp = new Date().getTime()
        await firebase.database().ref(`offers/${key}/timestamp`).set(timestamp)
        
      if (timeout) clearTimeout(timeout)
      
        timeout = setTimeout(() => {
          console.log('changeeeee');
          pubsub.publish(`event.${this.ref}`, {type: 'change', key, value: offer})
          timeout = false
        }, 2000);
        
      }
      
    })
  }

  async addField() {
    const name = await prompt('please enter field name');
    if (name) {
      const field = document.createElement('input-field');
      field.name = name
      field.value = ''
      field.ref = 'offers'
      field.key = this.#key
      this.appendChild(field)
    }
  }

  async stamp(key) {
    this.innerHTML = '';
    this.nails.clear()
    
    const offer = {...window.offers[this.#key] }
    
    let timeout;
    console.log(offer);
    for (const i of Object.keys(offer)) {
      if (i === 'key') {        
        const span = document.createElement('span');
        span.classList.add('key');
        span.setAttribute('slot', i)
        span.innerHTML = `
        <h4><translated-string>SKU</translated-string></h4>
        <span class="flex"></span>
        ${offer[i]}
        `;
        this.appendChild(span);
      } else if (i === 'image' && offer[i]) {
        let val = offer[i];
        if (val) for (const key of Object.keys(val)) {
          if (val[key] && key !== 'thumb' && key !== 'thumbm' && key !== 'placeholder') this.nails.add({ key, src: `https://guldentopveldwinkel.be/ipfs/${val[key]}` });
        }
      } else if (i === 'public') {
        if (offer[i]) this.publicIcon.setAttribute('public', '')
      } else if (i === 'timestamp') {
        const span = document.createElement('span');
        span.classList.add('timestamp');
        span.setAttribute('slot', i)
        span.innerHTML = `
        <h4><translated-string>last edit</translated-string></h4>
        <span class="flex"></span>
        <custom-date lang="nl" value="${offer[i]}">${new Date(offer[i])}</custom-date>
        `;
        this.appendChild(span);
      } else {
        const field = document.createElement('input-field');
        field.name = i
        field.value = offer[i]
        field.ref = 'offers'
        field.key = this.#key
        this.appendChild(field)
      }
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
  ::slotted(.column) {
    mixin(--css-column)
    width: 100%;
    min-height: 110px;
  }
  ::slotted(.timestamp) {
    mixin(--css-row)
    mixin(--css-center)
    width: 100%;
    height: 54px;
  }
  ::slotted(*.flex) {
    mixin(--css-flex)
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
    padding: 12px 24px 24px;
    width: 100%;
  }
  custom-svg-icon {
    cursor: pointer;
  }
  ::slotted(.key) {
    width: 100%;
    mixin(--css-row)
    mixin(--css-center)
  }
  apply(--css-row)
  apply(--css-center)
  apply(--css-flex)
</style>
<md-dialog show-opened>
<flex-container>  
  <slot name="timestamp"></slot>
  <slot name="key"></slot>
  <image-nails></image-nails>
  <slot></slot>
  <span class="wrapper">
    <span class="flex"></span>
    <md-icon icon="add" title="add info field" @click=${this.addField}></md-icon>
    <span class="flex"></span>
  </span>
</flex-container>

<shop-admin-action-bar></shop-admin-action-bar>
</md-dialog>
`;

  }
}
