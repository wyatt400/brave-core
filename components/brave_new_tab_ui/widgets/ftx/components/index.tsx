/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this file,
* You can obtain one at http://mozilla.org/MPL/2.0/. */
import * as React from 'react'
import { ThemeProvider, ThemeConsumer } from 'styled-components'

import createWidget from '../../../components/default/widget/index'
import { StyledTitleTab } from '../../../components/default/widgetTitleTab'

import { currencyNames } from '../../shared/data'

import {
  ActionAnchor,
  ActionButton,
  BackArrow,
  BasicBox,
  Box,
  WidgetIcon,
  FlexItem,
  Header,
  Filters,
  FilterOption,
  List,
  ListItem,
  PlainButton,
  StyledTitle,
  StyledTitleText,
  Text,
  WidgetWrapper,
  UpperCaseText,
  PlainAnchor,
  Balance,
  BlurIcon
} from '../../shared/styles'
import { Chart } from '../../shared'
import { CaratLeftIcon } from 'brave-ui/components/icons'
import {
  ShowIcon,
  HideIcon
} from '../../../components/default/exchangeWidget/shared-assets'
import icons from '../../shared/assets/icons'
import * as FTXActions from '../ftx_actions'
import { FTXState, ViewType } from '../ftx_state'
import ftxLogo from './ftx-logo.png'
import customizeTheme from './theme'
import Convert from './convert'

// Utils
interface State {
  hideBalance: boolean
}

interface Props {
  ftx: FTXState
  actions: typeof FTXActions
  widgetTitle: string
  showContent: boolean
  stackPosition: number
  onShowContent: () => void
  onInteraction: () => void
  onOptInMarkets: (show: boolean) => void
}

class FTX extends React.PureComponent<Props, State> {
  private refreshInterval: any

  constructor (props: Props) {
    super(props)
    this.state = {
      hideBalance: true
    }
  }

  componentDidMount () {
    if (!this.props.ftx.hasInitialized) {
      this.props.actions.initialize()
    }
  }

  componentWillUnmount () {
    this.clearIntervals()
  }

  checkSetRefreshInterval = () => {
    if (!this.refreshInterval) {
      // TODO: do refresh stuff
      // this.refreshInterval = setInterval(async () => {
      // }, 30000)
    }
  }

  clearIntervals = () => {
    clearInterval(this.refreshInterval)
    this.refreshInterval = null
  }

  handleViewMarketsClick = async () => {
    this.props.onInteraction()
    this.optInMarkets(true)
  }

  optInMarkets = (show: boolean) => {
    this.props.actions.openView(show ? ViewType.Markets : ViewType.OptIn)
  }

  handleAssetDetailClick = async (symbol: string) => {
    this.props.actions.showAssetDetail({ symbol })
  }

  formattedNum = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol'
    }).format(price)
  }

  renderIconAsset = (key: string, size:number = 25) => {
    if (!(key in icons)) {
      return null
    }

    return (
      <>
        <img width={size} src={icons[key]} />
      </>
    )
  }

  renderPreOptIn () {
    return (
      <>
        <BasicBox isFlex={true} justify='flex-end'>
          <PlainButton weight={600}>.com</PlainButton>
          <PlainButton weight={600} textColor='xlight'>.us</PlainButton>
        </BasicBox>
        <Text $fontSize={13} weight={600} $pb={6}>
          FTX.com
        </Text>
        <Text $fontSize={13} textColor='light' lineHeight={1.5} $pb={21}>
          Connect FTX account to view account balance, explore futures markets, & convert crypto.
        </Text>
        <ActionAnchor onClick={this.handleViewMarketsClick}>
          View Future Markets
        </ActionAnchor>
        <PlainButton textColor='light' $m='0 auto'>
          Connect Account
        </PlainButton>
      </>
    )
  }

  renderAssetDetailView () {
    const assetDetail = this.props.ftx.assetDetail
    // Sanity check
    if (!assetDetail) {
      return null
    }
    const currency = assetDetail.currencyName
    const price = assetDetail.marketData?.price
    const volume = assetDetail.marketData?.volumeDay
    const percentChange = assetDetail.marketData?.percentChangeDay
    const chartData = assetDetail.chartData
    const chartDataError = chartData && typeof chartData === 'string'
    const waitingForChartData = !chartData
    const chartHeight = 100
    const chartWidth = 309
    return (
      <Box hasPadding={false}>
        <FlexItem
          hasPadding={true}
          isFlex={true}
          isFullWidth={true}
          hasBorder={true}
        >
          <FlexItem>
            <BackArrow>
              <CaratLeftIcon onClick={this.props.actions.hideAssetDetail} />
            </BackArrow>
          </FlexItem>
          <FlexItem $pr={5}>
            {this.renderIconAsset(currency.toLowerCase())}
          </FlexItem>
          <FlexItem flex={1}>
            <Text>{currency}</Text>
            <Text small={true} textColor='light'>
              {currencyNames[currency]}
            </Text>
          </FlexItem>
          <FlexItem $pl={5}>
            <ActionButton small={true} light={true}>
              <UpperCaseText>
                {'ftxWidgetBuy'}
              </UpperCaseText>
            </ActionButton>
          </FlexItem>
        </FlexItem>
        <FlexItem
          hasPadding={true}
          isFullWidth={true}
          hasBorder={true}
        >
          {(price) && <Text
            inline={true}
            large={true}
            weight={500}
            $mr='0.5rem'
          >
            {this.formattedNum(price)} USDT
          </Text>}
          {(percentChange) && <Text inline={true} textColor={percentChange > 0 ? 'green' : 'red'}>{percentChange}%</Text>}
          {chartData && typeof chartData !== 'string' &&
          <Chart width={chartWidth} height={chartHeight} data={chartData} />
          }
          {waitingForChartData &&
          <Text>Loading...</Text>
          }
          {chartDataError &&
          <Text>Error fetching data.</Text>}
        <Text small={true} textColor='xlight'>
          {'ftxWidgetGraph'}
        </Text>
        </FlexItem>
        <FlexItem
          hasPadding={true}
          isFullWidth={true}
        >
          <BasicBox $mt='0.2em'>
            <Text small={true} textColor='light' $pb='0.2rem'>
              <UpperCaseText>
                {'ftxWidgetVolume'}
              </UpperCaseText>
            </Text>
            {volume && <Text weight={500}>{this.formattedNum(volume)} USDT</Text>}
          </BasicBox>
          <BasicBox $mt='1em'>
            <Text small={true} textColor='light' $pb='0.2rem'>
              <UpperCaseText>
                {'ftxWidgetPairs'}
              </UpperCaseText>
            </Text>
          </BasicBox>
        </FlexItem>
      </Box>
    )
  }

  renderMarkets () {
    return <>
      <Filters>
        <FilterOption isActive={true}>Futures</FilterOption>
        <FilterOption>Special</FilterOption>
      </Filters>
      <List>
        {this.props.ftx.marketData.map(market => {
          const { symbol, price, percentChangeDay } = market
          const currencyName = currencyNames[symbol]
          // const { price = null } = null || { price: 1000 }
          // const losersGainers = {}
          // const { percentChange = null } = losersGainers[currency] || {}
          return (
            <ListItem key={symbol} isFlex={true} onClick={this.handleAssetDetailClick.bind(this, symbol)} $height={48}>
              <FlexItem $pl={5} $pr={5}>
                {this.renderIconAsset(symbol.toLowerCase())}
              </FlexItem>
              <FlexItem>
                <Text>{symbol}</Text>
                {currencyName &&
                <Text small={true} textColor='light'>{currencyNames[symbol]}</Text>
                }
              </FlexItem>
              <FlexItem textAlign='right' flex={1}>
                {(price !== null) && <Text>{this.formattedNum(price)}</Text>}
                {(percentChangeDay !== null) && <Text textColor={percentChangeDay > 0 ? 'green' : 'red'}>{percentChangeDay}%</Text>}
              </FlexItem>
            </ListItem>
          )
        })}
      </List>
      <Text $mt={13} center={true}>More markets on <PlainAnchor href="#">ftx.com</PlainAnchor></Text>
    </>
  }

  // TODO: remove
  toggleBalanceVisibility = () => {
    this.setState({
      hideBalance: !this.state.hideBalance
    })
  }

  renderSummary () {
    const { hideBalance } = this.state

    const total = this.props.ftx.balanceTotal

    return (
      <Box $mt={10}>

        <FlexItem isFlex={true} $p={15} hasPadding={true} >
          {total !== null &&
          <FlexItem>
            <Balance hideBalance={hideBalance}>
              <Text lineHeight={1.15} $fontSize={21}>{this.formattedNum(total)}</Text>
            </Balance>
          </FlexItem>
          }
          <FlexItem>
            <BlurIcon onClick={this.toggleBalanceVisibility}>
              {
                hideBalance
                ? <ShowIcon />
                : <HideIcon />
              }
            </BlurIcon>
          </FlexItem>
        </FlexItem>
        <List hasBorder={false}>
          {Object.keys(this.props.ftx.balances).map(currencyKey => {
            const balance = this.props.ftx.balances[currencyKey]
            return (
              <ListItem key={currencyKey} isFlex={true} $height={40}>
                <FlexItem $pl={5} $pr={5}>
                  {this.renderIconAsset(currencyKey.toLowerCase(), 18)}
                </FlexItem>
                <FlexItem>
                  <Text>{currencyKey}</Text>
                </FlexItem>
                <FlexItem textAlign='right' flex={1}>
                  <Balance hideBalance={hideBalance}>
                    {(balance !== null) && <Text lineHeight={1.15}>{balance}</Text>}
                    {/* {(estimate !== null) && <Text textColor='light' small={true} lineHeight={1.15}>≈ {this.formattedNum(estimate)}</Text>} */}
                  </Balance>
                </FlexItem>
              </ListItem>
            )
          })}
        </List>
      </Box>
    )
  }

  renderView () {
    const selectedAsset = this.props.ftx.assetDetail?.currencyName
    const { currentView } = this.props.ftx
    if (selectedAsset) {
      return this.renderAssetDetailView()
    } else if (currentView === ViewType.Convert) {
      return <Convert ftx={this.props.ftx} actions={this.props.actions} />
    } else if (currentView === ViewType.Summary) {
      return this.renderSummary()
    } else {
      return this.renderMarkets()
    }
  }

  setView = (view: ViewType) => {
    this.props.actions.openView(view)
  }

  renderIndex () {
    const { currentView } = this.props.ftx
    return <>
      <BasicBox isFlex={true} justify="start">
        <PlainButton $pl="0" weight={600} textColor={currentView === ViewType.Markets ? 'white' : 'light'} onClick={this.setView.bind(null, ViewType.Markets)}>Markets</PlainButton>
        <PlainButton weight={600} textColor={currentView === ViewType.Convert ? 'white' : 'light'} onClick={this.setView.bind(null, ViewType.Convert)}>Convert</PlainButton>
        <PlainButton weight={600} textColor={currentView === ViewType.Summary ? 'white' : 'light'} onClick={this.setView.bind(null, ViewType.Summary)}>Summary</PlainButton>
      </BasicBox>
      {this.renderView()}
    </>
  }

  renderTitle () {
    const selectedAsset = this.props.ftx.assetDetail?.currencyName
    const { showContent, widgetTitle } = this.props
    // Only show back arrow to go back to opt-in view
    const shouldShowBackArrow = !selectedAsset &&
      this.props.ftx.currentView !== ViewType.OptIn &&
      !this.props.ftx.isConnected

    return (
      <Header showContent={showContent}>
        <StyledTitle>
          <WidgetIcon>
            <img src={ftxLogo} alt="FTX logo"/>
          </WidgetIcon>
          <StyledTitleText>
            {widgetTitle}
          </StyledTitleText>
          {shouldShowBackArrow &&
            <BackArrow marketView={true}>
              <CaratLeftIcon
                onClick={this.optInMarkets.bind(this, false)}
              />
            </BackArrow>
          }
        </StyledTitle>
      </Header>
    )
  }

  renderTitleTab () {
    const { onShowContent, stackPosition } = this.props

    return (
      <StyledTitleTab onClick={onShowContent} stackPosition={stackPosition}>
        {this.renderTitle()}
      </StyledTitleTab>
    )
  }

  renderContent() {
    return <>
      {this.props.ftx.currentView === ViewType.OptIn
        ? this.renderPreOptIn()
        : this.renderIndex()
      }
    </>
  }

  render () {
    const { showContent } = this.props

    if (!showContent) {
      return this.renderTitleTab()
    }

    return (
      <ThemeConsumer>
      {theme =>
        <ThemeProvider theme={customizeTheme(theme)}>
          <WidgetWrapper tabIndex={0}>
            {this.renderTitle()}
            {this.renderContent()}
          </WidgetWrapper>
        </ThemeProvider>
      }
      </ThemeConsumer>
    )
  }
}

export const FTXWidget = createWidget(FTX)
