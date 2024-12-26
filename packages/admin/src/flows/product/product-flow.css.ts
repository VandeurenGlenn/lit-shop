import { css } from '@vandeurenglenn/lite'
export default css`
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
