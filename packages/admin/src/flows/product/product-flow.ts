import { LiteElement, css, customElement, html, property } from '@vandeurenglenn/lite'
import '@material/web/fab/fab.js'
import '@vandeurenglenn/lite-elements/icon.js'
import { TemplateResult } from 'lit'
import style from './product-flow.css.js'

export type StepConfig = {
  step: string // step name
  fields: []
  stepRender: Function
  stepValidate: Function
}

export type StepsConfig = StepConfig[]
@customElement('product-flow')
export class ProductFlow extends LiteElement {
  static styles = [style]
  @property({ type: Array }) accessor fields

  @property({ type: Boolean, attribute: 'is-last-step', reflect: true }) accessor isLastStep

  @property({ type: Boolean, attribute: 'is-first-step', reflect: true }) accessor isFirstStep

  @property({ type: String }) accessor step: string

  @property({ type: Array }) accessor steps: StepsConfig

  @property({ attribute: false }) accessor stepRender

  lastRender: TemplateResult

  stepRenders = {}

  stepResults = {}

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

  reset() {
    this.step = undefined
    this.stepResults = {}
  }

  #previous() {
    const stepResult = this.steps[this.stepIndex].stepValidate()
    if (stepResult.error) return
    this.stepResults[this.step] = stepResult.values
    this.step = this.steps[this.stepIndex - 1].step
    const lastRender = this.stepRenders[this.step]
    const lastRenderValues = this.stepRenders[this.step].values[0] as [string, any][]

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
    const stepResult = this.steps[this.stepIndex].stepValidate()
    const currentStep = this.step
    if (stepResult.error) return

    this.stepRenders[currentStep] = this.stepRender
    this.stepResults[this.step] = stepResult.values

    let step = this.step
    const isLastStep = this.isLastStep

    this.dispatchEvent(
      new CustomEvent('step', {
        detail: { results: this.stepResults, isLastStep, step }
      })
    )

    if (this.stepIndex === this.steps.length - 1) {
      this.reset()
      return
    } else {
      this.step = this.steps[this.stepIndex + 1].step
      step = this.step
    }

    if (this.stepRenders[this.step]) {
      const lastRender = this.stepRenders[this.step]
      const lastRenderValues = lastRender.values[0] as [string, any][]

      if (lastRenderValues) {
        for (let i = 0; i < lastRenderValues.length; i++) {
          if (!Array.isArray(lastRenderValues[i])) {
            lastRenderValues[i] = this.stepResults[this.step][i]
          } else {
            const [label, value] = lastRenderValues[i]
            if (value?.type === 'select') {
              lastRenderValues[i][1].value = this.stepResults[this.step][label]
            } else {
              lastRenderValues[i][1] = this.stepResults[this.step][label]
            }
          }
        }
        this.stepRender = lastRender
        this.stepRenders[this.step] = this.stepRender
      }
    } else
      this.stepRender = this.steps[this.stepIndex].stepRender(this.steps[this.stepIndex].fields)
    this.stepRenders[this.step] = this.stepRender
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
    return html`
      ${this.stepRender}
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
      </flex-row>
    `
  }
}
