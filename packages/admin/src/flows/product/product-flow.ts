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
import { TemplateResult } from 'lit'

export type StepConfig = {
  step: string // step name
  fields: []
  stepRender: Function
  stepValidate: Function
}

export type StepsConfig = StepConfig[]
@customElement('product-flow')
export class ProductFlow extends LiteElement {
  @property({ type: Array }) accessor fields

  @property({ type: Boolean, attribute: 'is-last-step', reflect: true }) accessor isLastStep

  @property({ type: Boolean, attribute: 'is-first-step', reflect: true }) accessor isFirstStep

  @property({ type: String }) accessor step: string

  @property({ type: Array }) accessor steps: StepsConfig

  @property({ attribute: false }) accessor stepRender

  lastRender: TemplateResult

  get stepIndex() {
    return this.steps.findIndex((step) => step.step === this.step)
  }

  onChange(propertyKey: string, value: any): void {
    if ((propertyKey === 'step' && this.steps) || (propertyKey === 'steps' && this.step)) {
      const stepIndex = this.stepIndex
      this.isFirstStep = stepIndex === 0
      this.isLastStep = stepIndex === this.steps.length - 1
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
    this.step = undefined
    this.stepResults = {}
  }

  #previous() {
    this.step = this.steps[this.stepIndex - 1].step
    const lastRender = this.lastRender
    const lastRenderValues = this.lastRender.values[0] as [string, any][]

    if (lastRenderValues) {
      for (let i = 0; i < lastRenderValues.length; i++) {
        const [label, value] = lastRenderValues[i]
        if (value?.type === 'select') {
          lastRenderValues[i][1].value = this.stepResults[this.step][label]
        } else {
          lastRenderValues[i][1] = this.stepResults[this.step][label]
        }
      }
    }
    this.stepRender = lastRender

    this.dispatchEvent(
      new CustomEvent('step', {
        detail: { results: this.stepResults, isLastStep: this.isLastStep, step: this.step }
      })
    )
  }

  #next() {
    let errors = false
    const stepResult = this.steps[this.stepIndex].stepValidate()
    if (stepResult.error) return

    this.stepResults[this.step] = stepResult.values

    const stepResults = this.stepResults
    let step = this.step
    const isLastStep = this.isLastStep

    this.dispatchEvent(
      new CustomEvent('step', {
        detail: { results: stepResults, isLastStep, step }
      })
    )

    if (this.stepIndex === this.steps.length - 1) {
      this.reset()
      return
    } else {
      this.step = this.steps[this.stepIndex + 1].step
      step = this.step
    }

    this.lastRender = this.stepRender
    this.stepRender = this.steps[this.stepIndex].stepRender(this.steps[this.stepIndex].fields)
  }

  startFlow(steps: StepsConfig) {
    this.steps = steps
    this.isFirstStep = true
    this.isLastStep = false
    this.step = steps[0].step

    this.stepRender = this.steps[0].stepRender(steps[0].fields)
  }

  render() {
    if (!this.stepRender) return
    return html`${this.stepRender}
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
