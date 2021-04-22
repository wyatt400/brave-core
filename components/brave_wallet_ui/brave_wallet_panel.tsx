// Copyright (c) 2021 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

console.log('---hello from brave_wallet_panel.tsx')


import walletPanelDarkTheme from './theme/wallet-panel-dark'
import walletPanelLightTheme from './theme/wallet-panel-light'
import BraveCoreThemeProvider from '../common/BraveCoreThemeProvider'

import * as React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
//import { initLocale } from 'brave-ui'
import { bindActionCreators } from 'redux'

import { ConnectWithSite } from './components/extension'
import { WalletAccountType } from './constants/types'
import {
  StyledExtensionWrapper,
} from './stories/style'

// Utils
import store from './store'
import * as walletPanelActions from './actions/wallet_panel_actions'

const accounts: WalletAccountType[] = [
  {
    id: '1',
    name: 'Account 1',
    address: '0x7d66c9ddAED3115d93Bd1790332f3Cd06Cf52B14',
    balance: 0.31178,
    asset: 'eth'
  },
  {
    id: '2',
    name: 'Account 2',
    address: '0x73A29A1da97149722eB09c526E4eAd698895bDCf',
    balance: 0.31178,
    asset: 'eth'
  },
  {
    id: '3',
    name: 'Account 3',
    address: '0x3f29A1da97149722eB09c526E4eAd698895b426',
    balance: 0.31178,
    asset: 'eth'
  }
]

export interface _ConnectWithSiteProps {
  themeType: chrome.braveTheme.ThemeType
}

export const _ConnectWithSite = (props: _ConnectWithSiteProps) => {
  const actions = bindActionCreators(walletPanelActions, store.dispatch.bind(store))
  const [selectedAccounts, setSelectedAccounts] = React.useState<WalletAccountType[]>([
    accounts[0]
  ])
  const [readyToConnect, setReadyToConnect] = React.useState<boolean>(false)
  const url = 'https://app.uniswap.org'
  const selectAccount = (account: WalletAccountType) => {
    const newList = [...selectedAccounts, account]
    setSelectedAccounts(newList)
  }
  const removeAccount = (account: WalletAccountType) => {
    const newList = selectedAccounts.filter(
      (accounts) => accounts.id !== account.id
    )
    setSelectedAccounts(newList)
  }
  const onSubmit = () => {
    actions.connectToSite()
    alert(`Connecting to ${url} using: ${JSON.stringify(selectedAccounts)}`)
  }
  const primaryAction = () => {
    if (!readyToConnect) {
      setReadyToConnect(true)
    } else {
      onSubmit()
    }
  }
  const secondaryAction = () => {
    if (readyToConnect) {
      setReadyToConnect(false)
    } else {
      alert('You Clicked The Cancel Button!')
      actions.connectToSite()
    }
  }
  return (
    <Provider store={store}>
      <BraveCoreThemeProvider
          initialThemeType={props.themeType}
          dark={walletPanelDarkTheme}
          light={walletPanelLightTheme}
      >
        <StyledExtensionWrapper>
          <ConnectWithSite
            siteURL={url}
            isReady={readyToConnect}
            accounts={accounts}
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
            selectAccount={selectAccount}
            removeAccount={removeAccount}
            selectedAccounts={selectedAccounts}
          />
        </StyledExtensionWrapper>
      </BraveCoreThemeProvider>
    </Provider>
  )
}

function initialize() {
  new Promise(resolve => chrome.braveTheme.getBraveThemeType(resolve))
    .then((themeType: chrome.braveTheme.ThemeType) => {
      render(
          <_ConnectWithSite themeType={themeType}/>, document.getElementById('mountPoint'))
    })
}

document.addEventListener('DOMContentLoaded', initialize)
