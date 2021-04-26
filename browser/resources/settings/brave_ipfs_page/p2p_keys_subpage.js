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
    /**
    * Current page status
    * 'configure' | 'setup' | 'spinner'
    * @private
    */
    pageStatus_: {
      type: String,
      value: 'configure',
    },
  },

  /** @private {?SyncBrowserProxy} */
  browserProxy_: null,

  /** @override */
  created: function() {
    console.log("created");
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
});
