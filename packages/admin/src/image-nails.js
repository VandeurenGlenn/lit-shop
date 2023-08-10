export default customElements.define('image-nails', class ImageNails extends HTMLElement {
  get input() {
    return this.shadowRoot.querySelector('input');
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = this.template;

    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this._ondragover = this._ondragover.bind(this);
    this._ondrop = this._ondrop.bind(this);
    this._addToPhotos = this._addToPhotos.bind(this);
    // this.reset = this.reset.bind(this);
    this.targetBCR = null;
    this.target = null;
    this.startY = 0;
    this.currentY = 0;
    this.screenY = 0;
    this.targetY = 0;
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    this.addEventListener('touchstart', this._onTouchStart, { passive: true });

    this.addEventListener('touchend', this._onTouchEnd, { passive: true });
    this.addEventListener('mousedown', this._onTouchStart, { passive: true });

    this.addEventListener('mouseup', this._onTouchEnd, { passive: true });

    this.addEventListener('drop', this._ondrop);
    this.addEventListener('dragover', this._ondragover);
    this.shadowRoot.querySelector('[icon="add-to-photos"]').addEventListener('click', this._addToPhotos);

    this.input.onchange = () => {
      for (let i = 0; i < this.input.files.length; ++i) {
        this._readFile(this.input.files[i]);
      }
    };
  }

  set currentY(value) {
    this._currentY = value;
    requestAnimationFrame(() => {
      if (this.dragging === false && this.lastDragging === false) return;
      if (this.boundingClientRect) {
        const height = this.boundingClientRect.height;
        let y = this.screenY || 0;
        if (this.dragging && this.currentY) {
          y = this.currentY - this.startY;
        } else {
          y += (this.y - y) / 2;
        }
        const normalizedDistance = (Math.abs(y) / height);
        const opacity = 1 - Math.pow(normalizedDistance, 1.8);
        this.selected.style.transform = `translateY(${y}px)`;
        this.selected.style.opacity = opacity;
        this.screenY = y;
        if (this.dragging) return this.selected.classList.add('dragging');
        const isNearlyInvisible = (opacity < 0.50);
        if (isNearlyInvisible) {
          this.selected.classList.add('swiped');
          const detail = this.selected;
          this.dispatchEvent(new CustomEvent('image-swiped', { detail }));
          this.removeChild(this.selected);
          this.reset();
        }	else {
          this.reset();
        }
      }
      this.lastDragging = this.dragging;
    });
  }

  get currentY() {
    return this._currentY;
  }

  /**
    * @param {boolean} value
    */
  set dragging(value) {
    this._dragging = value;
  }
  /**
    * @param {object} value
    */
  set boundingClientRect(value) {
    this._boundingClientRect = value;
  }
  /**
    * @return {boolean}
    * @default false
    */
  get dragging() {
    return this._dragging || false;
  }
  /**
    * @return {object}
    */
  get boundingClientRect() {
    return this._boundingClientRect;
  }
  /**
    * @return {number}
    */
  get threshold() {
    return this.boundingClientRect.height * 0.35;
  }
  /**
    * @param {object} event
    */
  _onTouchStart(event) {
    this.selected = event.path[0];
    if (this.selected.localName !== 'img') return;
    this.reset();

    this.addEventListener('touchmove', this._onTouchMove, { passive: true });
    this.addEventListener('mousemove', this._onTouchMove, { passive: true });
    this.boundingClientRect = this.getBoundingClientRect();
    this.startY = event.pageY || event.touches[0].pageY;
    this.currentY = this.startY;
    this.selected.style.willChange = 'transform';
    this.dragging = true;
  }
  /**
    * @param {object} event
    */
  _onTouchMove(event) {
    if (this.dragging) this.currentY = event.pageY || event.touches[0].pageY;
  }
  /**
    * @param {object} event
    */
  _onTouchEnd(event) {
    if (!this.selected) return;
    const y = this.currentY - this.startY;
    const height = this.boundingClientRect.height;
    this.y = 0;
    if (Math.abs(y) > this.threshold) {
      this.y = (y > 0) ? height : -height;
    }
    this.currentY = 0;
    this.lastDragging = this.dragging;
    this.dragging = false;
    this.removeEventListener('touchmove', this._onTouchMove, { passive: true });
    this.removeEventListener('mousemove', this._onTouchMove, { passive: true });
  }

  reset() {
    this.dragging = false;
    this.selected.style.willChange = 'initial';
    this.selected.style.transform = 'none';
    this.selected.style.opacity = 1;
    this.screenY = 0;
    this.currentY = 0;
    this.startY = 0;
    this.y = 0;
    this.selected.classList.remove('dragging');
  }

  add({ key, src }) {
    const img = document.createElement('img');
    img.src = src;
    img.setAttribute('key', key);
    this.appendChild(img);
  }

  _readFile(file) {
    const reader = new FileReader();
    reader.onload = () => this.upload(reader.result);
    reader.readAsDataURL(file);
  }

  _ondragover(event) {
    event.preventDefault();
  }

  _ondrop(event) {
    console.log('File(s) dropped');
    // Prevent default behavior (Prevent file from being opened)
    event.preventDefault();

    if (event.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < event.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (event.dataTransfer.items[i].kind === 'file') {
          this._readFile(event.dataTransfer.items[i].getAsFile());
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < event.dataTransfer.files.length; i++) {
        this._readFile(event.dataTransfer.files[i]);
      }
    }
  }

  _addToPhotos() {
    this.input.click();
  }

  upload(dataURL) {
    this.dispatchEvent(new CustomEvent('nail-upload', { detail: dataURL }));
  }

  remove() {

  }

  clear() {
    Array.from(this.children).forEach((child) => this.removeChild(child));
  }

  get template() {
    return `
<style>
  :host {
    display: flex;
    flex-direction: row;
    max-height: 176px;
    height: 100%;
    width: 100%;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                0 1px 5px 0 rgba(0, 0, 0, 0.12),
                0 3px 1px -2px rgba(0, 0, 0, 0.2);
                
    border: 1px solid #38464e;
    user-select: none;
    padding: 24px;
    box-sizing: border-box;
    min-height: 176px;
    }
  ::slotted(.swiped) {
    display: none;
  }
  ::slotted(.dragging) {
    user-select: none;
    pointer-events: none;
  }
  ::slotted(img) {
    height: 120px;
    width: 120px;
    pointer-events: auto;
    cursor: pointer;
    user-select: none;
    position: initial !important;
    image-rendering: -webkit-optimize-contrast;
  }
  input {
    opacity: 0;
    position: fixed;

  }
</style>
<slot></slot>
<custom-svg-icon icon="add-to-photos"></custom-svg-icon>
<input type="file" accept="image/*"></input>
    `;
  }
});
