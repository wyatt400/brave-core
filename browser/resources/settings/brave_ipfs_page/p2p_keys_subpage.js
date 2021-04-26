/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
 import {Router} from '../router.m.js';
 
 
(function() {
  'use strict';
  
/**
* @fileoverview
* 'settings-sync-subpage' is the settings page content
*/
Polymer({
  is: 'settings-p2p-keys-subpage',

  behaviors: [
  ],

  properties: {
    /**
     * Array of sites to display in the widget.
     * @type {!Array<SiteException>}
     */
    keys_: {
      type: Array,
      value() {
        return [];
      },
    },
    
    showAddp2pKeyDialog_: {
      type: Boolean,
      value: true,
    }
  },
  
  activeDialogAnchor_: null,
  /** @private {?SyncBrowserProxy} */
  
  browserProxy_: null,

  /** @override */
  created: function() {
    this.browserProxy_ = settings.BraveIPFSBrowserProxyImpl.getInstance();
  },

  /** @override */
  ready: function() {
    this.browserProxy_.getIPNSKeysList().then(list => {
      if (!list) {
        return;
      }
      this.keys_ = JSON.parse(list)
    });
  },
  
  onAddKeyTap_: function(item) {
    console.log("onAddKeyTap_", item);
    this.showAddp2pKeyDialog_ = true
  },
  
  onAddKeyDialogClosed_: function() {
    console.log("onAddKeyDialogClosed_");
    this.showAddp2pKeyDialog_ = false
  },
  
  onKeyDeleteTapped_: function(item) {
    console.log("onKeyDeleteTapped_", item);
  },
  
  getButtonAriaLabel_: function() {
    return "getButtonAriaLabel_";
  },

});
})();
