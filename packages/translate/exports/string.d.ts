declare global {
    interface HTMLElementTagNameMap {
        'translate-string': TranslateString;
    }
}
export declare class TranslateString extends HTMLElement {
    static get attributeChangedCallback(): string[];
    set value(value: string);
    get value(): string;
    set translate(value: boolean);
    get translate(): boolean;
    constructor();
    _translate(string: string): Promise<void>;
    attributeChangedCallback(name: any, old: any, value: any): void;
    connectedCallback(): void;
}
