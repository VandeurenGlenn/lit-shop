import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import '@material/web/dialog/dialog.js'
import '@material/web/button/text-button.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/icon/icon.js'
import '@material/web/textfield/outlined-text-field.js'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { OutlinedTextField } from '@material/web/textfield/internal/outlined-text-field.js';
import { controller as firebaseController } from '@lit-shop/firebase-controller';

@customElement('login-dialog')
export class LoginDialog extends LitElement {
  @property({ type: Boolean, reflect: true })
  open: boolean = false

  set selected(value) {
    this.#pages?.select(value)
    this.requestUpdate('selected')
  }

  get selected() {
    return this.#pages?.selected
  }

  get #emailInput() {
    return this.shadowRoot.querySelector('md-outlined-textfield[type="email"]') as OutlinedTextField
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

  signinWithGoogle() {
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
        const user = result.user;
        this.#dialog.close()
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  signinWithEmail() {
    const email = this.#emailInput.value
    const password = this.#passwordInput.value

    signInWithEmailAndPassword(firebaseController.auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        this.#dialog.close()
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

  static styles = [
    css`
      :host {
        display: contents
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
  ];

  render() {
    return html`
    <md-dialog fullscreen .open=${this.open} title="signin">
      <custom-typography slot="headline">signin</custom-typography>

      <custom-pages attr-for-selected="route">
        <flex-column route="signin" center-center>
          <md-text-button @click=${this.signinWithGoogle}>
            <custom-icon slot="icon">mail</custom-icon>
            <custom-typography>sign in with google</custom-typography>
          </md-text-button>

          <md-text-button @click=${() => this.selected = 'mail'}>
            <custom-icon slot="icon">mail</custom-icon>
            <custom-typography>sign in with mail</custom-typography>
          </md-text-button>
        </flex-column>

        <flex-column route="mail">
          <md-outlined-text-field type="email" placeholder="email"></md-outlined-text-field>
          <md-outlined-text-field type="password" placeholder="password"></md-outlined-text-field>
        </flex-column>
    </custom-pages>

    ${this.selected === 'mail' ? html`
    <md-icon-button slot="footer" @click=${this.signinWithEmail} dialog-action="signin">
      <custom-icon>done</custom-icon>
    </md-icon-button>` : nothing}
    
    </md-dialog>

    `;
  }
}
