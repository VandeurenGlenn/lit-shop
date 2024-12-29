import { property, html, LiteElement, css, customElement } from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/container.js'
import '@vandeurenglenn/lite-elements/icon-button.js'
import '@vandeurenglenn/lite-elements/icon.js'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/list/list.js'
import '@material/web/list/list-item.js'
import '@material/web/fab/fab.js'
import '@material/web/dialog/dialog.js'
import '@material/web/button/outlined-button.js'
import { scrollbar } from '../../mixins/styles.js'
export type Product = {
  name: string
  vat: number
  price: number
  category: string
}

export type Products = Product[]

@customElement('catalog-categories')
export class CatalogCategories extends LiteElement {
  @property({ type: Array, value: [] }) accessor targetEdit = []

  @property({ type: Array, consumes: true })
  accessor categories: string[]

  static styles = [
    css`
      :host {
        display: flex;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
      ${scrollbar}

      md-list-item {
        background: var(--md-sys-color-surface-container-high);
        border: 1px solid rgba(0, 0, 0, 0.34);
        border-radius: 48px;
        margin-top: 8px;
        width: 100%;
        --md-list-item-leading-space: 24px;
        cursor: pointer;
      }
      md-fab {
        position: absolute;
        right: 24px;
        bottom: 24px;
      }

      md-outlined-text-field {
        margin-top: 4px;
        --_container-shape-start-start: 24px;
        --_container-shape-end-end: 24px;
        --_container-shape-start-end: 24px;
        --_container-shape-end-start: 24px;
        --_top-space: 4px;
        --_bottom-space: 4px;
      }
      main,
      md-icon-button,
      md-fab,
      md-list-item,
      md-outlined-button {
        pointer-events: auto;
      }

      main {
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        width: 100%;
        align-items: center;
      }
    `
  ]
  _add = async () => {
    const category = await prompt('input category to add')
    if (!category) return
    if (!this.categories.includes(category)) {
      this.categories.push(category)
      await firebase.set('categories', this.categories)
      this.requestRender()
    }
  }

  _remove = (target) => {
    const dialog = document.createElement('md-dialog')
    document.body.appendChild(dialog)
    dialog.innerHTML = `
    <div slot="headline">
      Deleting category
    </div>
    <form slot="content" id="remove-form" method="dialog">
      Are you sure you want to remove ${target}?
    </form>
    <div slot="actions">
      <md-outlined-button form="remove-form" value="cancel">Cancel</md-outlined-button>
      <flex-it></flex-it>
      <md-outlined-button form="remove-form" value="remove">Remove</md-outlined-button>
    </div>
    `
    const handleClose = async () => {
      if (dialog.returnValue === 'remove') {
        if (this.categories.includes(target)) {
          const categories = [...this.categories]
          categories.splice(categories.indexOf(target), 1)
          await firebase.set('categories', categories)
        }
      }
      dialog.removeEventListener('close', handleClose)
      dialog.remove()
    }
    dialog.addEventListener('close', handleClose)
    dialog.open = true
  }

  renderHeadline(item) {
    if (this.targetEdit?.includes(item))
      return html`<span slot="headline">
        <md-outlined-text-field
          label="value"
          key=${item}
          value=${item}></md-outlined-text-field>
      </span>`

    return html`<span slot="headline">${item}</span>`
  }

  async _onclick(event) {
    const target = event.target as HTMLElement
    const action = target.getAttribute('action')
    if (action) {
      const key = target.getAttribute('key')

      if (action === 'editOrSave') {
        if (!this.targetEdit.includes(key)) {
          this.targetEdit.push(key)
        } else {
          const field = (
            this.shadowRoot.querySelector(
              `md-outlined-text-field[key="${key}"]`
            ) as HTMLInputElement
          )?.value
          if (!field) return
          const categories = [...this.categories]
          if (field !== key) {
            categories.splice(categories.indexOf(key), 1, field)
            await firebase.set('categories', categories)
          }
          this.targetEdit.splice(this.targetEdit.indexOf(key), 1)
        }
        this.targetEdit = [...this.targetEdit]
      } else this[`_${action}`](key)
    }
  }

  connectedCallback() {
    this.shadowRoot.addEventListener('click', this._onclick.bind(this))
  }
  render() {
    return html`
      <main>
        <flex-container>
          ${this.categories
            ? this.categories.map(
                (item) => html`
                  <md-list-item>
                    ${this.renderHeadline(item)}
                    <flex-row slot="end">
                      <custom-icon-button
                        icon="delete"
                        key=${item}
                        action="remove"></custom-icon-button>

                      <custom-icon-button
                        .icon=${this.targetEdit?.includes(item) ? 'save' : 'edit'}
                        key=${item}
                        action="editOrSave"></custom-icon-button>
                    </flex-row>
                  </md-list-item>
                `
              )
            : ''}
        </flex-container>
      </main>
      <md-fab action="add"
        ><custom-icon
          slot="icon"
          icon="add"></custom-icon
      ></md-fab>
    `
  }
}
