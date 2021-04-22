/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
/* global window */

import { Reducer } from 'redux'

// Constants
import { types } from '../constants/wallet_panel_types'

// Utils
import * as storage from '../storage'

const walletPanelReducer: Reducer<WalletPanel.State | undefined> = (state: WalletPanel.State | undefined, action: any) => {
  if (state === undefined) {
    state = storage.load()
  }

  const payload = action.payload
  const startingState = state
  switch (action.type) {
    case types.CONNECT_TO_SITE:
      console.log('connect to site!')
      break
  }

  if (state !== startingState) {
    storage.debouncedSave(state)
  }

  return state
}

export default walletPanelReducer
