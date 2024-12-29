import { customElement, LiteElement, property, html, css, query } from '@vandeurenglenn/lite'
import '@vandeurenglenn/lite-elements/icon.js'
import { debounce } from '../../debounce.js'

@customElement('command-element')
export class CommandElement extends LiteElement {
  @property({ type: String }) accessor name: string

  @property({ type: String }) accessor route: string

  @property({ type: Boolean, reflect: true }) accessor open: boolean

  @query('input') accessor input: HTMLInputElement

  value: string

  command: 'search' | 'go' = 'search'

  commandMap = {
    '<': 'go'
  }

  static styles = [
    css`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        cursor: pointer;
        user-select: none;
        transition: background-color 0.2s;
        position: relative;
        max-width: 240px;
        width: 100%;
        pointer-events: auto;
      }

      :host(:hover) {
        background-color: var(--md-sys-color-surface-variant);
      }

      custom-icon {
        margin-right: 8px;
      }

      .container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background-color: var(--md-sys-color-surface-variant);
      }

      input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      :host([open]) input {
        opacity: 1;
      }

      :host([open]) .container {
        opacity: 0;
        pointer-events: none;
      }
    `
  ]

  render() {
    return html`
      <span class="container">
        <custom-icon icon="search"></custom-icon>
        <span>${this.name}</span>
      </span>

      <input
        type="text"
        placeholder="search or command" />
    `
  }

  reset() {
    this.input.value = ''
    this.value = ''
    this.command = 'search'
    this.input.blur()
  }

  _onclick = (event) => {
    console.log('click')
    event.stopImmediatePropagation()
    event.stopPropagation()

    if (this.open) {
      this.reset()
    }
    this.open = !this.open
  }

  _onEnter = (event) => {
    console.log('enter')

    if (event.key === 'Enter' && this.open && this.value) {
      this.dispatchEvent(
        new CustomEvent('command', {
          detail: {
            command: this.command,
            route: location.hash,
            value: this.value
          }
        })
      )
      this.open = false
    }
  }

  _onInput = debounce(() => {
    this.command = this.commandMap[this.input.value.charAt(0)] || 'search'
    this.value = this.input.value.replace(/\</g, '')
  }, 300)

  onChange(propertyKey: string, value: any): void {
    if (propertyKey === 'open' && value) {
      this.input.focus()
    } else if (propertyKey === 'open' && !value) {
      this.reset()
    }
  }

  firstRender = () => {
    console.log('first render')
    console.log(this)
    // this.addEventListener('click', () => console.log('click'))

    this.addEventListener('click', this._onclick)
    this.input.addEventListener('keydown', this._onEnter)
    this.input.addEventListener('input', this._onInput)
  }

  disconnectedCallback() {
    console.log('disconnected')

    this.removeEventListener('click', this._onclick)
    this.input.removeEventListener('keydown', this._onEnter)
    this.input.removeEventListener('input', this._onInput)
  }
}
