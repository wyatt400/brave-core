/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "bat/ledger/internal/endpoint/gemini/gemini_utils.h"
#include "bat/ledger/global_constants.h"
#include "bat/ledger/ledger.h"
#include "testing/gtest/include/gtest/gtest.h"

// npm run test -- brave_unit_tests --filter=GeminiUtilsTest.*

namespace ledger {
namespace endpoint {
namespace gemini {

class GeminiUtilsTest : public testing::Test {};

TEST(GeminiUtilsTest, GetServerUrlDevelopment) {
  ledger::_environment = type::Environment::DEVELOPMENT;
  const std::string url = GetServerUrl("/test");
  ASSERT_EQ(url, GEMINI_STAGING_URL "/test");
}

TEST(GeminiUtilsTest, GetServerUrlStaging) {
  ledger::_environment = type::Environment::STAGING;
  const std::string url = GetServerUrl("/test");
  ASSERT_EQ(url, GEMINI_STAGING_URL "/test");
}

TEST(GeminiUtilsTest, GetServerUrlProduction) {
  ledger::_environment = type::Environment::PRODUCTION;
  const std::string url = GetServerUrl("/test");
  ASSERT_EQ(url, "https://gemini.jp/test");
}

}  // namespace gemini
}  // namespace endpoint
}  // namespace ledger
