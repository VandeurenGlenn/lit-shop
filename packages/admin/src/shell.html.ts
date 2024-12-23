import { html } from 'lit'
import '@vandeurenglenn/lite-elements/theme.js'
import '@vandeurenglenn/lite-elements/selector.js'
import '@vandeurenglenn/lite-elements/drawer.js'
import '@vandeurenglenn/lite-elements/drawer-layout.js'
import '@vandeurenglenn/lite-elements/icon-button.js'
import '@vandeurenglenn/lite-elements/icon.js'
import '@vandeurenglenn/lite-elements/icon-set.js'
import '@vandeurenglenn/lite-elements/typography.js'
import '@vandeurenglenn/lite-elements/divider.js'
import '@lit-shop/translate/string.js'
import './menu/menu-item.js'
export default html`
  <image-editor></image-editor>
  <custom-icon-set>
    <template>
      <span name="add">@symbol-add</span>
      <span name="add_a_photo">@symbol-add_a_photo</span>
      <span name="close">@symbol-close</span>
      <span name="unfold_more">@symbol-unfold_more</span>
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
      <span name="done">@symbol-check</span>
      <span name="mail">@symbol-mail</span>
      <span name="link">@symbol-link</span>
      <span name="settings">@symbol-settings</span>
      <span name="arrow_back">@symbol-arrow_back</span>
      <span name="arrow_forward">@symbol-arrow_forward</span>
      <span name="keyboard_arrow_right">@symbol-keyboard_arrow_right</span>
      <span name="keyboard_arrow_down">@symbol-keyboard_arrow_down</span>
      <span name="photo_library">@symbol-photo_library</span>
      <span name="photo_camera">@symbol-photo_camera</span>
      <span name="photo_camera_back">@symbol-photo_camera_back</span>
      <span name="photo_camera_front">@symbol-photo_camera_front</span>
      <span name="orders">@symbol-orders</span>
      <span name="category">@symbol-category</span>
      <span name="inventory">@symbol-inventory</span>
      <span name="inventory_2">@symbol-inventory_2</span>
    </template>
  </custom-icon-set>
  <custom-drawer-layout appBarType="small">
    <translate-string
      name="title"
      slot="top-app-bar-title"></translate-string>

    <custom-selector
      slot="drawer-content"
      attr-for-selected="route">
      <menu-item
        route="orders"
        headline="orders">
        <custom-icon
          icon="orders"
          slot="end"></custom-icon
      ></menu-item>

      <menu-item
        route="stock"
        headline="stock">
        <custom-icon
          icon="inventory"
          slot="end"></custom-icon>
      </menu-item>

      <menu-item
        route="catalog/products"
        headline="products"
        ><custom-icon
          icon="inventory_2"
          slot="end"></custom-icon
      ></menu-item>

      <menu-item
        route="catalog/categories"
        headline="categories">
        <custom-icon
          icon="category"
          slot="end"></custom-icon
      ></menu-item>

      <menu-item
        route="media/images/library"
        headline="images">
        <custom-icon
          icon="photo_library"
          slot="end"></custom-icon>
      </menu-item>

      <custom-divider></custom-divider>
      <menu-item
        route="settings"
        headline="settings">
        <custom-icon
          icon="settings"
          slot="end"></custom-icon
      ></menu-item>
    </custom-selector>

    <slot></slot>
  </custom-drawer-layout>
  <image-editor></image-editor>
  <upload-dialog></upload-dialog>
  <login-dialog></login-dialog>
`
