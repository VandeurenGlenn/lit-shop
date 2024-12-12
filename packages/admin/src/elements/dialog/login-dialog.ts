import { LiteElement, html, css, customElement, property, query } from '@vandeurenglenn/lite'
import '@material/web/dialog/dialog.js'
import '@material/web/button/text-button.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/icon/icon.js'
import '@material/web/textfield/outlined-text-field.js'
import '@vandeurenglenn/lite-elements/dialog.js'
import '@vandeurenglenn/lite-elements/typography.js'
import '@vandeurenglenn/lite-elements/pages.js'
import '@vandeurenglenn/lite-elements/icon.js'
import '@vandeurenglenn/lite-elements/button.js'
import { signinWithGoogle, signInWithEmailAndPassword } from './../../firebase.js'
import { OutlinedTextField } from '@material/web/textfield/internal/outlined-text-field.js'
import { TemplateResult } from 'lit'

@customElement('login-dialog')
export class LoginDialog extends LiteElement {
  @property({ type: Boolean, reflect: true })
  accessor open: boolean = false

  @property({ type: String })
  accessor selected: string = 'signin'

  @query('md-outlined-textfield[type="email"]') accessor emailInput: OutlinedTextField

  connectedCallback() {
    this.shadowRoot.addEventListener('click', this.handleClick.bind(this))
  }

  handleClick = async (event) => {
    const target = event.target as HTMLElement
    let selected
    if (target.tagName === 'CUSTOM-BUTTON' || target.tagName === 'CUSTOM-ICON-BUTTON') {
      selected = target.getAttribute('route')
    }
    console.log(this.shadowRoot, this)

    if (selected === 'signinWithEmail') {
      const email = this.shadowRoot.querySelector('md-outlined-text-field[type="email"]').value
      const password = this.shadowRoot.querySelector('md-outlined-text-field[type="password"]').value

      signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user
          this.#dialog.open = false
          this.selected = 'signin'
          // ...
        })
        .catch((error) => {
          const errorCode = error.code
          const errorMessage = error.message
        })
    } else if (selected === 'signinWithGoogle') {
      try {
        const user = await signinWithGoogle()
        this.#dialog.open = false
        this.selected = 'signin'
      } catch (error) {
        alert(error.message)
      }
    } else if (selected === 'signinWithMailLink') {
      this.selected = 'signin'
    } else if (selected === 'mail') {
      this.selected = 'mail'
    } else if (selected === 'link') {
      this.selected = 'link'
    }
  }

  get #passwordInput() {
    return this.shadowRoot.querySelector('md-outlined-textfield[type="password"]') as OutlinedTextField
  }

  get #dialog() {
    return this.shadowRoot.querySelector('custom-dialog')
  }

  static styles = [
    css`
      :host {
        display: contents;
      }

      flex-column {
        align-items: center;
      }
      custom-button {
        min-width: 200px;
        width: calc(100% - 2px);
      }

      custom-pages {
        display: flex;
        min-height: 140px;
        margin-top: 24px;
        margin-bottom: 12px;
        overflow: auto;
      }
    `
  ]

  #renderSignin() {
    return html`
      <flex-column center-center>
        <custom-button
          route="signinWithGoogle"
          label="with google">
          <img
            slot="icon"
            src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" />
        </custom-button>

        <custom-button
          route="link"
          label="with link">
          <custom-icon
            slot="icon"
            icon="link"></custom-icon>
        </custom-button>

        <custom-button
          route="mail"
          label="with mail">
          <custom-icon
            slot="icon"
            icon="mail"></custom-icon>
        </custom-button>
      </flex-column>
    `
  }

  #renderMailSignin() {
    return html`
      <md-outlined-text-field
        type="email"
        placeholder="email"></md-outlined-text-field>
      <md-outlined-text-field
        type="password"
        placeholder="password"></md-outlined-text-field>
    `
  }

  #renderMailLinkSignin() {
    return html`
      <md-outlined-text-field
        type="email"
        placeholder="email"></md-outlined-text-field>
    `
  }

  render() {
    let content: TemplateResult<1>
    if (this.selected === 'signin') {
      content = this.#renderSignin()
    } else if (this.selected === 'mail') {
      content = this.#renderMailSignin()
    } else if (this.selected === 'link') {
      content = this.#renderMailLinkSignin()
    }
    return html`
      <custom-dialog
        .open=${this.open}
        title="signin">
        <flex-row slot="header">
          <custom-typography>Signin</custom-typography>
        </flex-row>

        ${content}
        ${this.selected === 'mail' || this.selected === 'link'
          ? html` <span slot="actions">
              <custom-icon-button
                icon="done"
                slot="actions"
                route=${this.selected === 'mail' ? 'signinWithEmail' : 'signinWithMailLink'}
                dialog-action="signin">
              </custom-icon-button>
            </span>`
          : ''}
      </custom-dialog>
    `
  }
}
