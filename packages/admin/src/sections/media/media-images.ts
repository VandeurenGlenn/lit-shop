
import styles from './images.css.js'
import { LitElement, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';



export default class MediaImages extends LitElement {
  @property({ type: String })
  selected: string

  get #pages() {
    return this.renderRoot.querySelector('custom-pages')
  }

  static styles = [
    styles
  ]

  async select(route, selected) {
    this.selected = route
    this.#pages.select(route)
  }

  render() {
    return html`
    <custom-pages attr-for-selected="route">
      <images-albums route="albums"></images-albums>
      <images-library route="library"></images-library>
      <images-album route="album"></images-album>
      <images-image route="image"></images-image>
    </custom-pages>
    `
  }
}

customElements.define('media-images', MediaImages);
