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
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth'
import { OutlinedTextField } from '@material/web/textfield/internal/outlined-text-field.js'
import { controller as firebaseController } from '@lit-shop/firebase-controller'

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

  handleClick = (event) => {
    const target = event.target as HTMLElement
    let selected
    if (target.tagName === 'CUSTOM-BUTTON' || target.tagName === 'CUSTOM-ICON-BUTTON') {
      selected = target.getAttribute('route')
    }
    console.log(this.shadowRoot, this)

    if (selected === 'signinWithEmail') {
      const email = this.shadowRoot.querySelector('md-outlined-text-field[type="email"]').value
      const password = this.shadowRoot.querySelector('md-outlined-text-field[type="password"]').value

      signInWithEmailAndPassword(firebaseController.auth, email, password)
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
      const provider = new GoogleAuthProvider()
      // provider.addScope('addresses.read')
      // provider.addScope('phonenumbers.read')
      provider.addScope('email')
      provider.addScope('profile')

      signInWithPopup(firebaseController.auth, provider)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access the Google API.
          // const credential = GoogleAuthProvider.credentialFromResult(result);
          // const token = credential.accessToken;
          // The signed-in user info.
          const user = result.user
          this.#dialog.open = false
          this.selected = 'signin'
          // IdP data available using getAdditionalUserInfo(result)
          // ...
        })
        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code
          const errorMessage = error.message
          // The email of the user's account used.
          const email = error.customData.email
          // The AuthCredential type that was used.
          const credential = GoogleAuthProvider.credentialFromError(error)
          // ...
        })
    } else if (selected === 'mail') {
      this.selected = 'mail'
      this.#pages.selected = 'mail'
    }
  }

  get #passwordInput() {
    return this.shadowRoot.querySelector('md-outlined-textfield[type="password"]') as OutlinedTextField
  }

  get #pages() {
    return this.shadowRoot.querySelector('custom-pages')
  }

  get #dialog() {
    return this.shadowRoot.querySelector('md-dialog')
  }

  static styles = [
    css`
      :host {
        display: contents;
      }

      flex-column {
        align-items: center;
        min-height: 120px;
      }

      custom-pages {
        display: flex;
        min-height: 120px;
      }
    `
  ]

  render() {
    return html`
      <custom-dialog
        .open=${this.open}
        title="signin">
        <custom-typography slot="header">signin</custom-typography>

        <custom-pages attr-for-selected="route">
          <flex-column
            route="signin"
            center-center>
            <custom-button
              route="signinWithGoogle"
              label="sign in with google">
              <img
                slot="icon"
                src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" />
              <custom-typography>sign in with google</custom-typography>
            </custom-button>

            <custom-button
              route="mail"
              label="sign in with mail">
              <custom-icon
                slot="icon"
                icon="mail"></custom-icon>
              <custom-typography>sign in with mail</custom-typography>
            </custom-button>
          </flex-column>

          <flex-column route="mail">
            <md-outlined-text-field
              type="email"
              placeholder="email"></md-outlined-text-field>
            <md-outlined-text-field
              type="password"
              placeholder="password"></md-outlined-text-field>
          </flex-column>
        </custom-pages>

        ${this.selected === 'mail'
          ? html` <span slot="actions">
              <custom-icon-button
                icon="done"
                slot="actions"
                route="signinWithEmail"
                dialog-action="signin">
              </custom-icon-button>
            </span>`
          : ''}
      </custom-dialog>
    `
  }
}
