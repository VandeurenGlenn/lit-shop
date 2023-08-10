import { css } from 'lit';

export default css`
:host {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  height: 100%;
  color: #eee;
  --svg-icon-color: #eee;
}

header {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
}

a {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: var(--md-color-on-surface);
  padding: 12px 24px;
  box-sizing: border-box;
  height: 48px;
}

.tab {

  align-items: center;
  display: flex;
  flex-direction: column;
}

.tab.custom-selected::after {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--md-color-tertiary);
  content: '';
}


`