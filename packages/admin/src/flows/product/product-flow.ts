import { LiteElement, css, customElement, html, property } from '@vandeurenglenn/lite'
import '@vandeurenglenn/flex-elements/container.js'
import '@material/web/fab/fab.js'
import '@vandeurenglenn/lite-elements/icon.js'
import { InputFields } from '../../elements/input-fields/input-fields.js'
import { InputField } from '../../elements/input-fields/input-field.js'
import { Product } from '@lit-shop/types'
import { sizeField } from '../../elements/input-fields/size-field.js'
import './../../elements/input-fields/size-fields.js'
import './../../elements/input-fields/image-fields.js'

const initialStep = (fields) => html` <input-fields .fields=${fields}></input-fields> `

const sizesStep = (fields) => html` <size-fields .fields=${fields}></size-fields> `

const imagesStep = (fields) => html` <image-fields .fields=${fields}></image-fields> `

@customElement('product-flow')
export class ProductFlow extends LiteElement {
  @property({ type: Array }) accessor fields

  @property({ type: Boolean, attribute: 'is-last-step', reflect: true }) accessor isLastStep

  @property({ type: Boolean, attribute: 'is-first-step', reflect: true }) accessor isFirstStep

  @property({ type: String }) accessor step: string = 'initial'

  @property({ type: Array }) accessor steps = ['initial', 'sizes', 'images']

  onChange(propertyKey: string, value: any): void {
    if ((propertyKey === 'step' && this.steps) || (propertyKey === 'steps' && this.step)) {
      this.isFirstStep = this.steps.indexOf(this.step) === 0
      this.isLastStep = this.steps.indexOf(this.step) === this.steps.length - 1
      this.requestRender()
    }
  }

  stepResults = {}

  static styles = [
    css`
      :host {
        display: block;
        flex-direction: column;
        width: 100%;
        position: relative;
        height: 100%;
      }
      .nav {
        position: absolute;
        bottom: 24px;
        left: 24px;
        right: 24px;
        display: flex;
        justify-content: space-between;
      }
      :host([is-first-step]) .nav {
        justify-content: flex-end;
      }
    `
  ]

  reset() {
    this.step = 'initial'
    this.stepResults = {}
  }

  #previous() {
    this.step = this.steps[this.steps.indexOf(this.step) - 1]
    this.dispatchEvent(
      new CustomEvent('step', {
        detail: { results: this.stepResults, isLastStep: this.isLastStep, step: this.step }
      })
    )
  }
  #next() {
    let errors = false
    if (this.step === 'initial') {
      const fields = Array.from(
        this.shadowRoot.querySelector('input-fields').shadowRoot.querySelectorAll('input-field')
      ) as InputField[]
      const result = {}

      for (const field of fields) {
        if (!field.checkValidity()) {
          errors = true
          field.error = true
        }

        result[field.name] = field.value
      }
      if (errors) return
      this.stepResults[this.step] = result as Omit<Product, 'sizes'>
    } else if (this.step === 'sizes') {
      const fields = Array.from(
        this.shadowRoot.querySelector('size-fields').shadowRoot.querySelectorAll('size-field')
      ) as sizeField[]
      const result = []

      for (const field of fields) {
        if (!field.checkValidity()) {
          errors = true
        }

        result.push({
          size: field.size,
          price: field.price,
          stock: field.stock,
          unit: field.unit
        })
      }

      if (errors) return
      this.stepResults[this.step] = result
    } else if (this.step === 'images') {
      const fields = this.shadowRoot.querySelector('image-fields').getValues()
      const result = []

      for (const field of fields) {
        result.push(field)
      }

      // if (errors) return
      this.stepResults[this.step] = result
    }

    const stepResults = this.stepResults
    let step = this.step
    const isLastStep = this.isLastStep

    if (this.steps.indexOf(this.step) === this.steps.length - 1) {
      this.reset()
    } else {
      this.step = this.steps[this.steps.indexOf(this.step) + 1]
      step = this.step
    }

    this.dispatchEvent(
      new CustomEvent('step', {
        detail: { results: stepResults, isLastStep, step }
      })
    )
  }

  render() {
    let stepRender
    if (this.step === 'initial') {
      stepRender = initialStep(this.fields)
    } else if (this.step === 'sizes') {
      stepRender = sizesStep(this.fields)
    } else if (this.step === 'images') {
      stepRender = imagesStep(this.fields)
    }
    return html`${stepRender}
      <flex-row class="nav">
        ${this.step !== 'initial'
          ? html`
              <md-fab @click=${() => this.#previous()}>
                <custom-icon
                  slot="icon"
                  icon="arrow_back"></custom-icon>
              </md-fab>
            `
          : ''}
        ${this.isLastStep
          ? html` <md-fab @click=${() => this.#next()}
              ><custom-icon
                slot="icon"
                icon="save"></custom-icon
            ></md-fab>`
          : html` <md-fab @click=${() => this.#next()}
              ><custom-icon
                slot="icon"
                icon="arrow_forward"></custom-icon
            ></md-fab>`}
      </flex-row> `
  }
}
