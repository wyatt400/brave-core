/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'

import {
  StyledBox,
  StyledHeader,
  StyledMessage,
  StyledWrapper,
  StyledText
} from './style'

import { getLocale } from 'brave-ui/helpers'

export interface Props {
  isMobile?: boolean
}

export default class Amount extends React.PureComponent<Props, {}> {
  render () {
    const {
      isMobile,
    } = this.props

    return (
      <>
        <StyledWrapper
          isMobile={isMobile}
        >
          <StyledHeader>{getLocale('walletSelectTitle')}</StyledHeader>
          <StyledMessage>{getLocale('walletSelectText')}</StyledMessage>
          <StyledBox>
            <StyledText>{getLocale('walletSelectGemini')}</StyledText>
          </StyledBox>
          <StyledBox>
            <StyledText>{getLocale('walletSelectUphold')}</StyledText>
          </StyledBox>
        </StyledWrapper>
      </>
    )
  }
}
