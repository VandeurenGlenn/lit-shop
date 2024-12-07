import { translate } from './translate.js';

class TranslateString extends HTMLElement {
    static get attributeChangedCallback() {
        return ['value'];
    }
    set value(value) {
        this.setAttribute('value', value);
        this._translate(value);
    }
    get value() {
        return this.getAttribute('value');
    }
    set translate(value) {
        this.setAttribute('translate', String(value));
    }
    get translate() {
        return this.getAttribute('translate') !== 'false';
    }
    constructor() {
        super();
    }
    async _translate(string) {
        if (this.translate)
            this.innerHTML = await translate(String(this.value));
    }
    attributeChangedCallback(name, old, value) {
        if (old !== value)
            this[name] = value;
    }
    connectedCallback() {
        if (!this.value && this.innerHTML)
            this.value = this.innerHTML;
    }
}
customElements.define('translate-string', TranslateString);

export { TranslateString };
