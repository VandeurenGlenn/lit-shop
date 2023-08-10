import styles from './images.css.js'
import { LitElement, html } from 'lit';

export default class mediaVideos extends LitElement {
  constructor() {
    super()
  }

  get #tabs() {
    return this.renderRoot.querySelector('custom-tabs')
  }

  get #pages() {
    return this.renderRoot.querySelector('custom-pages')
  }

  static styles = [
    styles
  ]

  async select(route) {
    this.#pages.select(route)
    this.#tabs.select(route)
  }

  render() {
    return html`
    <header>
      <custom-tabs attr-for-selected="data-route">
        <a href="#!/media/images/albums">
          <custom-tab data-route="albums">
            <translated-string>albums</translated-string>
          </custom-tab>
        </a>
        
        <a href="#!/media/images/library">
          <custom-tab data-route="library">
            <translated-string>library</translated-string>
          </custom-tab>
        </a>
      </custom-tabs>
    </header>
    
    <custom-pages attr-for-selected="data-route">
      <images-albums data-route="albums"></images-albums>
      <images-library data-route="library"></images-library>
    </custom-pages>
    `
  }
}

customElements.define('media-videos', mediaVideos);
