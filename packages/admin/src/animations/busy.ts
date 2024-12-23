import { css, html, LitElement } from 'lit'
import { render } from 'lit-html'

export default customElements.define(
  'busy-animation',
  class BusyAnimation extends HTMLElement {
    message = 'Loading...'

    static get observedAttributes(): string[] {
      return ['message']
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
      if (name === 'message') {
        this.message = newValue
      }
    }

    connectedCallback() {
      this.attachShadow({ mode: 'open' })
      render(this.render(), this.shadowRoot)
      this.shadowRoot.adoptedStyleSheets.push(BusyAnimation.styles.styleSheet)
    }

    static styles = css`
      :host {
        display: block;
      }
      .animation {
        display: block;
        width: 40px;
        height: 40px;
        margin: 0 auto;
        background-color: #eee;
        border-radius: 100%;
        -webkit-animation: scale 1s infinite ease-in-out;
        animation: scale 1s infinite ease-in-out;
      }
      @-webkit-keyframes scale {
        0% {
          -webkit-transform: scale(0);
        }
        100% {
          -webkit-transform: scale(1);
          opacity: 0;
        }
      }
      @keyframes scale {
        0% {
          -webkit-transform: scale(0);
          transform: scale(0);
        }
        100% {
          -webkit-transform: scale(1);
          transform: scale(1);
          opacity: 0;
        }
      }
    `

    render() {
      return html`
        <h4>${this.message}</h4>
        <span class="animation"></span>
      `
    }
  }
)
