/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/components/brave_wallet/eth_call_data_builder.h"

#include "testing/gtest/include/gtest/gtest.h"

namespace brave_wallet {

namespace erc20 {

TEST(EthCallDataBuilderTest, BalanceOf) {
  std::string data;
  BalanceOf("0x4e02f254184E904300e0775E4b8eeCB1", &data);
  ASSERT_EQ(data,
            "0x70a08231000000000000000000000000000000004e02f254184E904300e0775E"
            "4b8eeCB1");
}

}  // namespace erc20

namespace unstoppable_domains {

TEST(EthCallDataBuilderTest, GetMany) {
  std::string data;
  std::vector<std::string> keys = {"crypto.ETH.address"};
  EXPECT_TRUE(GetMany(keys, "brave.crypto", &data));
  ASSERT_EQ(data,
            "0x1bd8cc1a"
            "0000000000000000000000000000000000000000000000000000000000000040"
            "77252571a99feee8f5e6b2f0c8b705407d395adc00b3c8ebcc7c19b2ea850013"
            "0000000000000000000000000000000000000000000000000000000000000001"
            "0000000000000000000000000000000000000000000000000000000000000020"
            "0000000000000000000000000000000000000000000000000000000000000012"
            "63727970746f2e4554482e616464726573730000000000000000000000000000");
}

}  // namespace unstoppable_domains

}  // namespace brave_wallet
