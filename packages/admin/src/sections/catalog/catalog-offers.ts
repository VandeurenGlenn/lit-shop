import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import '@material/web/list/list.js'
import '../../elements/items/offer-item.js'
import { consume } from '@lit-labs/context';
import { Offers, OffersContext } from '../../context/offers.js';

@customElement('catalog-offers')
export class CatalogOffers extends LitElement {
  @property({type: Object})
  @consume({
    context: OffersContext,
    subscribe: true
  })
  offers: Offers

  constructor() {
    super();
    this._onClick = this._onClick.bind(this);
    this._onFabClick = this._onFabClick.bind(this);
  }
  
  async connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this._onClick);
    await this.updateComplete
    this.renderRoot.querySelector('.container').ondragover = event => {
      event.preventDefault()
    }
    this.renderRoot.querySelector('.container').ondrop = event => {
      event.preventDefault()
      const target = event.composedPath()[0]
      var data = event.dataTransfer.getData("text");
      console.log(data);
      const node = this.renderRoot.querySelector(`[data-route="${data}"]`)
      console.log(node);  
      const clone = document.createElement('offer-item')
      console.log(target);
      
      console.log(target.index === node.index);
      if (target.index === node.index) return
      else {
        this.renderRoot.removeChild(node)
        this.renderRoot.insertBefore(clone, event.target)
      }
      console.log(clone);
      clone.key = node.key
      clone.value = node.value
      clone.dataset.route = node.dataset.route
      
      console.log(event);
      const items = Array.from(this.querySelectorAll('offer-item'))
      
      items.forEach(async (item, i) => {
        item.index = i
        await firebase.database().ref(`offers/${item.key}/index`).set(i)
      })
      this.requestUpdate()
      
      console.log(items);
      // this.stamp()
      
      
    }
      this.requestUpdate()
    
    globalThis.pubsub.subscribe('event.offers', async change => {
      let item = this.querySelector(`[data-route="${change.key}"]`);
      if (!item) {
        item = document.createElement('offer-item');
        this.appendChild(item);
      } 
      if (change.type === 'add') {
        if (!offers[change.key]) offers[change.key] = await this.offers.get(change.key);
        item.key = change.key;
        item.value = change.value
        item.dataset.route = change.key;
        // return this.stamp()
      } else if (change.type === 'change') {
        item.key = change.key;
        item.name = change.value.name
        item.public = change.value.public
      } else if (change.type === 'public') {
        item.public = change.value
      } else if (change.type === 'delete') {
        delete offers[change.key]
        this.removeChild(item)
      }
    });
    
    
  }

  _onClick(e) {
    // this.selected =
    const target = e.composedPath()[0]
    console.log(e);
    
    if (target.localName === 'offer-item') {
      this.selected = target.dataset.route
      this.offer = this.offers[this.selected]
      globalThis.adminGo('offer', this.selected);
    }
  }

  _onFabClick(event) {
    event.preventDefault()
    event.stopImmediatePropagation()
    adminGo('add-offer');
    // window.adminGo('add-offer');
  }
  
  static styles= css`
  
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      user-select: none;
    }

    header {
      display: flex;
      flex-direction: row;
      padding: 12px 24px;
    }

    header, md-list {
      width: 100%;
      min-width: 320px;
      max-width: 640px;
      box-sizing: border-box;
    }

    md-list {
      padding: 12px;
    }

  
  .container {
    display: flex;
    flex-direction: column;
    overflow: auto;
    width: 100%;
  }
  .name {
    min-width: 240px;
  }

  .fab {
    display: flex;
    position: fixed;
    bottom: 24px;
    right: 24px;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 48px;
    min-width: 110px;
    border: 1px solid #888;
    border-radius: 28px;
    box-sizing: border-box;
    padding: 12px;
  }

  ::slotted(:nth-of-type(odd)) {
    background: #38464e;
  }
  `

  render() {
    return html`

<header>
  <custom-svg-icon icon="filter-list"></custom-svg-icon>
  <span class="flex"></span>
  <custom-svg-icon icon="mode-edit"></custom-svg-icon>
  <custom-svg-icon icon="search"></custom-svg-icon>
</header>
<!-- <header>
  <translate-string class="name">name</translate-string>
  <flex-it></flex-it>
  <translate-string style="padding-right: 24px">stock</translate-string>
  
  <translate-string>public</translate-string>
</header>
-->
<md-list class="container">
${this.offers ? map(Object.entries(this.offers).sort((a, b) => a[1].index - b[1].index), ([key, offer]) => html`
  <offer-item name="${offer.name}" key="${key}" index="${offer.index}" public="${offer.public}" data-route="${key}"></offer-item>
`): ''}
  
</md-list>


<span class="fab" @click=${this._onFabClick}>
  <custom-svg-icon icon="add"></custom-svg-icon>
  <span class="flex"></span>
  add
</span>
`;
  }
}
