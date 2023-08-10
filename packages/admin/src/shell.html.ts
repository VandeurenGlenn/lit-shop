import { html } from 'lit';
import '@vandeurenglenn/lit-elements/theme.js'
import '@vandeurenglenn/lit-elements/selector.js';
import '@vandeurenglenn/lit-elements/drawer.js';
import '@vandeurenglenn/lit-elements/drawer-layout.js';
import '@vandeurenglenn/lit-elements/icon-button.js';
import '@vandeurenglenn/lit-elements/icon.js';
import '@vandeurenglenn/lit-elements/icon-set.js';
export default html`

<image-editor></image-editor>
<custom-icon-set>
  <template>
    <span name="add">@symbol-add</span>
    <span name="add_a_photo">@symbol-add_a_photo</span>
    <span name="expand_more">@symbol-expand_more</span>
    <span name="menu">@symbol-menu</span>
    <span name="delete">@symbol-delete</span>
    <span name="menu_open">@symbol-menu_open</span>
    <span name="chevron_right">@symbol-chevron_right</span>
    <span name="close">@symbol-close</span>
    <span name="edit">@symbol-edit</span>
    <span name="more_vert">@symbol-more_vert</span>
    <span name="public">@symbol-public</span>
    <span name="check_box">@symbol-check_box</span>
    <span name="check_box_outline_blank">@symbol-check_box_outline_blank</span>
    <span name="save">@symbol-save</span>
    <span name="done">@symbol-done</span>
    <span name="mail">@symbol-mail</span>
    <span name="arrow_back">@symbol-arrow_back</span>
  </template>
</custom-icon-set>
<custom-drawer-layout appBarType="small">

  
  <translate-string name="title" slot="top-app-bar-title"></translate-string>
  
  

  <top-menu slot="drawer-content" attr-for-selected="data-route" selected="">

    <menu-item headline="orders"></menu-item>

    <menu-item headline="collections"></menu-item>

    <sub-menu headline="catalog">
      <menu-item headline="categories" route="catalog/categories"></menu-item>

      <menu-item headline="offers" route="catalog/offers"></menu-item>

      <menu-item headline="products" route="catalog/products"></menu-item>
    </sub-menu>

    <sub-menu headline="media">

      <sub-menu headline="images">
        <menu-item headline="albums" route="media/images/albums"></menu-item>
        <menu-item headline="library" route="media/images/library"></menu-item>
      </sub-menu>
      

      <sub-menu headline="videos">
        <menu-item headline="albums" route="media/videos/albums"></menu-item>
        <menu-item headline="library" route="media/videos/library"></menu-item>
      </sub-menu>
    </sub-menu>

    <flex-it flex="1"></flex-it>

    <menu-item headline="settings" route="settings"></menu-item>
  </top-menu>
  <slot></slot>
</custom-drawer-layout>
<upload-dialog></upload-dialog>
<login-dialog></login-dialog>
`