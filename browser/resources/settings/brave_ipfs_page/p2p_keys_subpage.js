// Copyright (c) 2020 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

// Copyright (c) 2020 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.
/**
 * @fileoverview
 * 'brave-sync-setup' is the UI for starting or joining a sync chain
 * settings.
 */
import {Router} from '../router.m.js';
 
/**
* @fileoverview
* 'settings-sync-subpage' is the settings page content
*/
Polymer({
  is: 'settings-p2p-keys-subpage',

  behaviors: [
  ],

  properties: {
    readOnlyList: {
      type: Boolean,
      value: false,
    },

    /**
     * Array of sites to display in the widget.
     * @type {!Array<SiteException>}
     */
     keys: {
      type: Array,
      value() {
        return [];
      },
    },
    /** @private */
    lastFocused_: Object,

    /** @private */
    listBlurred_: Boolean,

    /** @private */
    tooltipText_: String,
  },
  
  activeDialogAnchor_: null,
  /** @private {?SyncBrowserProxy} */
  
  browserProxy_: null,

  /** @override */
  created: function() {
    console.log("created");
    keys = ["1", "2", "3", "4"]
    // this.browserProxy_ = SyncBrowserProxyImpl.getInstance();
  },

  /** @override */
  ready: function() {
    console.log("ready");
  },

  /** @override */
  attached: function() {
    console.log("attached");
  },

  onAddKeyTap_: function() {
    console.log("onAddKeyTap_");
  },
  /**
   * @return {!Array<!SiteException>}
   * @private
   */
   getKeysItems_() {
    return this.keys.slice();
   },

   onShowActionMenu_(e) {
    this.activeDialogAnchor_ = /** @type {!HTMLElement} */ (e.detail.anchor);
    this.actionMenuSite_ = e.detail.model;
    /** @type {!CrActionMenuElement} */ (this.$$('cr-action-menu'))
        .showAt(this.activeDialogAnchor_);
  },

});
