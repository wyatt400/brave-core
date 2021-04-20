/* This Source Code Form is subject to the terms of the Mozilla Public
 * License. v. 2.0. If a copy of the MPL was not distributed with this file.
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import styled from 'brave-ui/theme'

interface StyledProps {
  compact?: boolean,
  isMobile?: boolean,
}

export const StyledWrapper = styled('div')<StyledProps>`
  overflow: hidden;
  font-family: ${p => p.theme.fontFamily.body};
  width: ${p => p.isMobile ? '100%' : '373px'};
  border-radius:'6px';
  display: flex;
  flex-direction: column;
  max-width: 415px;
  margin: 0 auto;
  position: relative;
`

export const StyledHeader = styled('div')<{}>`
  font-family: Poppins;
  font-weight: 600;
  font-size: 22px;
  text-align: center;
  margin-top: 52px;
  color: ${p => p.theme.palette.black};
`

export const StyledMessage = styled('div')<{}>`
  font-family: Poppins;
  font-size: 14px;
  text-align: center;
  margin-top: 18px;
  margin-botton: 22px;
  color: ${p => p.theme.palette.black};
  max-width: 316px;
`

export const StyledBox = styled('div')<{}>`
  width: 326px;
  height: 79px;
  margin: auto;
  margin-top: 18px;
  border: 2px solid #DADCE8;
  border-radius: 8px;
`

export const StyledButton = styled('div')<{}>`
  margin: auto;
  display: block;
  text-align: center;
  width: 340px;
  height: 40px;
  margin-top: 18px;
  background: #4C54D2;
  border-radius: 48px;
  cursor: pointer;
`

export const StyledText = styled('span')<{}>`
  font-family: Poppins, sans-serif;
  font-weight: 600;
  font-size: 16px;
  text-align: center;
  margin-top: calc(50% - 28px/2 - 55.5px);
`

export const StyledFooter = styled('div')<{}>`
  background: rgba(218, 220, 232, 0.25);
  margin-top: 17px;
  padding-bottom: 24px;
  text-align: center;
`

export const StyledFooterText = styled('div')<{}>`
  font-family: Poppins;
  font-size: 14px;
  font-weight: 600;
  margin-top: 24px;
  color: ${p => p.theme.palette.black};
`

export const StyledFooterLink = styled('a')<{}>`
  font-family: Poppins;
  font-size: 14px;  
`