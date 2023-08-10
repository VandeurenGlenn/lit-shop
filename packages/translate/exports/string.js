import { translate } from './translate.js';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function customElement({ inject } = { inject: false }) {
    return function (ctor) {
        const ce = class extends ctor {
            constructor() {
                super(...arguments);
                if (inject)
                    document.body.prepend(this);
            }
        };
        globalThis.customElements.define(ctor.name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase(), ce);
        return ce;
    };
}

let TranslateString = class TranslateString extends HTMLElement {
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
};
TranslateString = __decorate([
    customElement()
], TranslateString);

export { TranslateString };
