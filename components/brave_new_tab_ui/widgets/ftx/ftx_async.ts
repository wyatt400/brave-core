// Copyright (c) 2020 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

import { MiddlewareAPI, Dispatch, AnyAction } from 'redux'
import AsyncActionHandler from '../../../common/AsyncActionHandler'
import { ApplicationState } from '../../reducers'
import { ChartDataPoint } from '../shared/chart'
import * as Actions from './ftx_actions'
import { FTXState } from './ftx_state'

function getAccountBalancesAsync () : Promise<{ balances: chrome.ftx.Balances, authInvalid: boolean }> {
  return new Promise(resolve => chrome.ftx.getAccountBalances((balances, authInvalid) => {
    const results = { balances, authInvalid }
    resolve(results)
  }))
}

function get7DayHistoryForCurrency (currencyName: string) {
  const conversionSymbol = currencyName.toUpperCase() + '-PERP'
  const startTimeS = Math.floor((new Date().getTime() - (24 * 7 * 3600000)) / 1000)
  return new Promise<chrome.ftx.ChartData>(resolve => {
    chrome.ftx.getChartData(conversionSymbol, startTimeS.toString(), "", resolve)
  })
}

async function getMarketDataAsync () : Promise<chrome.ftx.TokenPriceData[]> {
  const futures: chrome.ftx.TokenPriceData[] = await new Promise(resolve => chrome.ftx.getFuturesData(data => resolve(data)))
  for (const future of futures) {
    // Clean up symbol
    future.symbol = future.symbol.replace('-PERP', '')
    // We only need percent as 2 decimal places
    future.percentChangeDay = Number(future.percentChangeDay.toFixed(2))
  }
  return futures
}

function getState (store: MiddlewareAPI<Dispatch<AnyAction>, any>): FTXState {
  // TODO(petemill): if we want this reducer to be portable to different UIs,
  // then we should have this `getState` provided as a function parameter.
  return (store.getState() as ApplicationState).ftx
}

const handler = new AsyncActionHandler()

handler.on(Actions.startConnectToFtx.getType(), async (store, payload) => {
  chrome.ftx.getClientUrl(url => {
    window.open(url, '_self', 'noopener')
  })
})

handler.on(Actions.initialize.getType(), async (store) => {
  const state = getState(store)
  // Don't initialize more than once.
  if (!state.hasInitialized) {
    const [{balances, authInvalid}, marketData] = await Promise.all([
      getAccountBalancesAsync(),
      getMarketDataAsync()
    ])
    console.log('marketData', marketData)
    console.log('balances', { balances: authInvalid })
    store.dispatch(Actions.initialized({
      isConnected: !authInvalid,
      marketData,
      balances
    }))
  }
})

handler.on<Actions.ShowAssetDetailPayload>(Actions.showAssetDetail.getType(), async (store, payload) => {
  const chartData = await get7DayHistoryForCurrency(payload.symbol)
  // Convert chart data
  const chartDataPoints: ChartDataPoint[] = chartData.map(p => ({
    c: p.close,
    h: p.high,
    l: p.low
  }))
  store.dispatch(Actions.assetChartDataUpdated({
    currencyName: payload.symbol,
    chartData: chartDataPoints
  }))
})

handler.on<Actions.PreviewConversionPayload>(Actions.previewConversion.getType(), async (store, payload) => {
  // Get quote
  const quoteId = await new Promise<string>(resolve => {
    chrome.ftx.getConvertQuote(payload.from, payload.to, payload.quantity.toString(), resolve)
  })
  // Validate
  if (!quoteId) {
    console.error('FTX: did not get quoteId from API, stopping conversion')
    // TODO(petemill): Probably better to show user the error, rathern than cancel
    store.dispatch(Actions.cancelConversion())
    return
  }
  // Get quote detail
  const quoteInfo = await new Promise<chrome.ftx.QuoteInfo>(resolve => {
    chrome.ftx.getConvertQuoteInfo(quoteId, resolve)
  })
  // Validate
  if (!quoteInfo || !quoteInfo.price || !quoteInfo.proceeds) {
    console.error('FTX: did not get valid quote info', { quoteId, quoteInfo })
    // TODO(petemill): Probably better to show user the error, rathern than cancel
    store.dispatch(Actions.cancelConversion())
    return
  }
  store.dispatch(Actions.conversionQuoteAvailable({ ...quoteInfo, quoteId }))
})

handler.on(Actions.submitConversion.getType(), async (store) => {
  // Collect data
  const state = getState(store)
  const quoteId = state.conversionInProgress?.quote?.quoteId
  // Validate
  if (!quoteId) {
    console.error('FTX: no valid quote Id to submit', state)
    store.dispatch(Actions.cancelConversion())
    return
  }
  // Send API
  const success = await new Promise<boolean>(resolve => {
    chrome.ftx.executeConvertQuote(quoteId, resolve)
  })
  // Inform
  if (!success) {
    // TODO(petemill): Probably better to show user the error, rathern than cancel
    store.dispatch(Actions.cancelConversion())
  } else {
    store.dispatch(Actions.conversionWasSuccessful())
  }
})

export default handler.middleware
