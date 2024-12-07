import { css } from '@vandeurenglenn/lite';

export default css`
  :host {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    height: 100%;
    color: #eee;
    background: var(--md-sys-color-background);
    --svg-icon-color: #eee;
    --md-dialog-container-color: var(--md-sys-color-surface);
  }

  ::slotted(custom-pages) {
    display: flex;
    width: 100%;
    height: 100%;
  }

  translate-string[name='title'] {
    padding-left: 12px;
    text-transform: capitalize;
    padding-bottom: 0;
  }
  header {
    display: flex;
    align-items: center;
    height: 64px;
    min-height: 64px;
    background: var(--surface-color);
    box-sizing: border-box;
    right: 0;
    width: 100%;
    padding: 24px;
    color: #eee;
  }
  header h3 {
    margin: 0;
    font-size: 20px;
  }
  custom-drawer custom-svg-icon {
    pointer-events: none;
  }

  md-list {
    height: 100%;
  }
`;
