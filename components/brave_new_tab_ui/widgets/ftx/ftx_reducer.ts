// Copyright (c) 2021 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

import { createReducer } from 'redux-act'
import * as Actions from './ftx_actions'
import { FTXState, ViewType, AssetDetail } from './ftx_state'

const defaultState: FTXState = {
  hasInitialized: false,
  isConnected: false,
  balances: {},
  balanceTotal: null,
  assetDetail: null,
  marketData: [],
  currencyNames: [],
  currentView: ViewType.OptIn
}

const reducer = createReducer<FTXState>({}, defaultState)

reducer.on(Actions.initialized, (state, payload) => {
  console.log('ftx initialized', payload)

  // Sum balances
  const marketData = payload.marketData || state.marketData
  let balanceTotal = null
  if (marketData && payload.balances) {
    for (const currency of Object.keys(payload.balances)) {
      const currencyAmount = payload.balances[currency]
      if (!currencyAmount) {
        continue
      }
      // Convert to same currency
      if (currency.toLowerCase() === 'usd') {
        balanceTotal = (balanceTotal || 0) + currencyAmount
      } else {
        let marketCurrencyMatch = marketData.find(m => m.symbol === currency)
        if (marketCurrencyMatch && marketCurrencyMatch.price) {
          const balanceInCurrency: number = currencyAmount * marketCurrencyMatch.price
          balanceTotal = (balanceTotal || 0) + balanceInCurrency
        } else {
          // If there is a currency that we cannot find, don't display
          // any total, so that we aren't misleading.
          balanceTotal = null
          break
        }
      }
    }
  }

  // Extract currency name list
  if (payload.marketData) {
    state = {
      ...state,
      currencyNames: payload.marketData.map(i => i.symbol)
    }
  }

  return {
    ...state,
    hasInitialized: true,
    isConnected: payload.isConnected,
    balances: payload.balances,
    balanceTotal,
    marketData: payload.marketData,
    // Initial view decision
    currentView: payload.isConnected ? ViewType.Markets : ViewType.OptIn
  }
})

reducer.on(Actions.openView, (state, viewDestination) => {
  // Change view and clear out any view-temporary data
  return {
    ...state,
    currentView: viewDestination,
    assetDetail: null,
    conversionInProgress: undefined
  }
})

reducer.on(Actions.showAssetDetail, (state, payload) => {
  // Reset asset detail, normalize market data
  const marketData = state.marketData.find(d => d.symbol === payload.symbol)
  state = {
    ...state,
    assetDetail: {
      currencyName: payload.symbol,
      marketData
    }
  }
  return state
})

reducer.on(Actions.hideAssetDetail, (state) => {
  return {
    ...state,
    assetDetail: null
  }
})

reducer.on(Actions.assetChartDataUpdated, (state, payload) => {
  // Verify we haven't changed currency or closed detail screen
  // whilst waiting for http response.
  if (state.assetDetail?.currencyName !== payload.currencyName) {
    return state
  }
  const assetDetail: AssetDetail = {
    ...state.assetDetail
  }
  // Detect error
  if (!payload.chartData?.length) {
    assetDetail.chartData = 'Error'
  } else {
    assetDetail.chartData = payload.chartData
  }
  // Valid data
  return {
    ...state,
    assetDetail
  }
})

reducer.on(Actions.previewConversion, (state, payload) => {
  return {
    ...state,
    conversionInProgress: {
      ...payload,
      isSubmitting: false,
      complete: false
    }
  }
})

function closeOrCancelConversion (state: FTXState): FTXState {
  return {
    ...state,
    conversionInProgress: undefined
  }
}

reducer.on(Actions.cancelConversion, closeOrCancelConversion)

reducer.on(Actions.closeConversion, closeOrCancelConversion)

reducer.on(Actions.conversionQuoteAvailable, (state, payload) => {
  if (!state.conversionInProgress) {
    console.warn('FTX: conversion data came back when not in progress!')
    return state
  }
  return {
    ...state,
    conversionInProgress: {
      ...state.conversionInProgress,
      quote: payload
    }
  }
})

reducer.on(Actions.submitConversion, (state) => {
  // Validate
  if (!state.conversionInProgress) {
    console.warn('FTX: conversion cancelled when not in progress!')
    return state
  }
  return {
    ...state,
    conversionInProgress: {
      ...state.conversionInProgress,
      isSubmitting: true
    }
  }
})

reducer.on(Actions.conversionWasSuccessful, (state) => {
  // Validate
  if (!state.conversionInProgress) {
    console.warn('FTX: conversion successful when not in progress!')
    return state
  }
  return {
    ...state,
    conversionInProgress: {
      ...state.conversionInProgress,
      isSubmitting: false,
      complete: true
    }
  }
})

export default reducer
