import { css } from '@vandeurenglenn/lite'

export const scrollbar = css`
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  ::-webkit-scrollbar-track {
    background: var(--md-sys-color-surface-container-high);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--md-sys-color-surface-container-medium);
    border-radius: 6px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--md-sys-color-surface-container-low);
  }
`
