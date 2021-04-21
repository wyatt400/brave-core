/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include <map>
#include <memory>
#include <utility>

#include "base/test/task_environment.h"
#include "bat/ledger/global_constants.h"
#include "bat/ledger/internal/gemini/gemini_util.h"
#include "bat/ledger/internal/common/random_util.h"
#include "bat/ledger/internal/ledger_client_mock.h"
#include "bat/ledger/internal/ledger_impl_mock.h"
#include "bat/ledger/internal/state/state_keys.h"
#include "bat/ledger/ledger.h"
#include "testing/gmock/include/gmock/gmock.h"

// npm run test -- brave_unit_tests --filter=GeminiUtilTest.*

using ::testing::_;

namespace ledger {
namespace gemini {

class GeminiUtilTest : public testing::Test {
 private:
  base::test::TaskEnvironment scoped_task_environment_;

 protected:
  std::unique_ptr<ledger::MockLedgerClient> mock_ledger_client_;
  std::unique_ptr<ledger::MockLedgerImpl> mock_ledger_impl_;

  GeminiUtilTest() {
    mock_ledger_client_ = std::make_unique<ledger::MockLedgerClient>();
    mock_ledger_impl_ =
        std::make_unique<ledger::MockLedgerImpl>(mock_ledger_client_.get());
  }

  ~GeminiUtilTest() override {}
};

TEST_F(GeminiUtilTest, GetClientId) {
  // production
  ledger::_environment = type::Environment::PRODUCTION;
  std::string result = gemini::GetClientId();
  ASSERT_EQ(result, GEMINI_CLIENT_ID);

  // staging
  ledger::_environment = type::Environment::STAGING;
  result = gemini::GetClientId();
  ASSERT_EQ(result, GEMINI_STAGING_CLIENT_ID);
}

TEST_F(GeminiUtilTest, GetClientSecret) {
  // production
  ledger::_environment = type::Environment::PRODUCTION;
  std::string result = gemini::GetClientSecret();
  ASSERT_EQ(result, GEMINI_CLIENT_SECRET);

  // staging
  ledger::_environment = type::Environment::STAGING;
  result = gemini::GetClientSecret();
  ASSERT_EQ(result, GEMINI_STAGING_CLIENT_SECRET);
}

TEST_F(GeminiUtilTest, GetFeeAddress) {
  // production
  ledger::_environment = type::Environment::PRODUCTION;
  std::string result = gemini::GetFeeAddress();
  ASSERT_EQ(result, kFeeAddressProduction);

  // staging
  ledger::_environment = type::Environment::STAGING;
  result = gemini::GetFeeAddress();
  ASSERT_EQ(result, kFeeAddressStaging);
}

TEST_F(GeminiUtilTest, GetAuthorizeUrl) {
  // production
  ledger::_environment = type::Environment::PRODUCTION;
  std::string result =
      gemini::GetAuthorizeUrl("my-state", "my-code-verifier");
  ASSERT_EQ(result,
            "https://gemini.jp/ex/OAuth/authorize"
            "?client_id=" GEMINI_CLIENT_ID
            "&scope=assets create_deposit_id withdraw_to_deposit_id"
            "&redirect_uri=rewards://gemini/authorization"
            "&state=my-state"
            "&response_type=code"
            "&code_challenge_method=S256"
            "&code_challenge=5Cxs3JXozcwTeteCIu4BcTieAhEIqjn643F10PxPD_w");

  // staging
  ledger::_environment = type::Environment::STAGING;
  result = gemini::GetAuthorizeUrl("my-state", "my-code-verifier");
  ASSERT_EQ(result, GEMINI_STAGING_URL
            "/ex/OAuth/authorize"
            "?client_id=" GEMINI_STAGING_CLIENT_ID
            "&scope=assets create_deposit_id withdraw_to_deposit_id"
            "&redirect_uri=rewards://gemini/authorization"
            "&state=my-state"
            "&response_type=code"
            "&code_challenge_method=S256"
            "&code_challenge=5Cxs3JXozcwTeteCIu4BcTieAhEIqjn643F10PxPD_w");
}

TEST_F(GeminiUtilTest, GetAddUrl) {
  // production
  ledger::_environment = type::Environment::PRODUCTION;
  std::string result = gemini::GetAddUrl();
  ASSERT_EQ(result, "https://gemini.jp/ex/Home?login=1");

  // staging
  ledger::_environment = type::Environment::STAGING;
  result = gemini::GetAddUrl();
  ASSERT_EQ(result, GEMINI_STAGING_URL "/ex/Home?login=1");
}

TEST_F(GeminiUtilTest, GetWithdrawUrl) {
  // production
  ledger::_environment = type::Environment::PRODUCTION;
  std::string result = gemini::GetWithdrawUrl();
  ASSERT_EQ(result, "https://gemini.jp/ex/Home?login=1");

  // staging
  ledger::_environment = type::Environment::STAGING;
  result = gemini::GetWithdrawUrl();
  ASSERT_EQ(result, GEMINI_STAGING_URL "/ex/Home?login=1");
}

TEST_F(GeminiUtilTest, GetWallet) {
  // no wallet
  ON_CALL(*mock_ledger_client_, GetEncryptedStringState(state::kWalletGemini))
      .WillByDefault(testing::Return(""));
  auto result = gemini::GetWallet(mock_ledger_impl_.get());
  ASSERT_TRUE(!result);

  const std::string wallet = R"({
    "account_url": "https://gemini.jp/ex/Home?login=1",
    "add_url": "",
    "address": "2323dff2ba-d0d1-4dfw-8e56-a2605bcaf4af",
    "fees": {},
    "login_url": "https://sandbox.gemini.jp/authorize/4c2b665ca060d",
    "one_time_string": "1F747AE0A708E47ED7E650BF1856B5A4EF7E36833BDB1158A108F8",
    "code_verifier": "1234567890",
    "status": 2,
    "token": "4c80232r219c30cdf112208890a32c7e00",
    "user_name": "test",
    "verify_url": "https://sandbox.gemini.jp/authorize/4c2b665ca060d",
    "withdraw_url": ""
  })";

  ON_CALL(*mock_ledger_client_, GetEncryptedStringState(state::kWalletGemini))
      .WillByDefault(testing::Return(wallet));

  // Gemini wallet
  result = gemini::GetWallet(mock_ledger_impl_.get());
  ASSERT_TRUE(result);
  ASSERT_EQ(result->address, "2323dff2ba-d0d1-4dfw-8e56-a2605bcaf4af");
  ASSERT_EQ(result->user_name, "test");
  ASSERT_EQ(result->token, "4c80232r219c30cdf112208890a32c7e00");
  ASSERT_EQ(result->status, type::WalletStatus::VERIFIED);
}

TEST_F(GeminiUtilTest, GenerateRandomHexString) {
  // string for testing
  ledger::is_testing = true;
  auto result = ledger::util::GenerateRandomHexString();
  ASSERT_EQ(result, "123456789");

  // random string
  ledger::is_testing = false;
  ledger::_environment = type::Environment::STAGING;
  result = ledger::util::GenerateRandomHexString();
  ASSERT_EQ(result.length(), 64u);
}

TEST_F(GeminiUtilTest, GenerateLinks) {
  ledger::_environment = type::Environment::STAGING;

  auto wallet = type::ExternalWallet::New();
  wallet->address = "123123123124234234234";

  // Not connected
  wallet->status = type::WalletStatus::NOT_CONNECTED;
  auto result = gemini::GenerateLinks(wallet->Clone());
  ASSERT_EQ(result->add_url, "");
  ASSERT_EQ(result->withdraw_url, "");
  ASSERT_EQ(result->verify_url, GEMINI_STAGING_URL
            "/ex/OAuth/authorize"
            "?client_id=" GEMINI_STAGING_CLIENT_ID
            "&scope=assets create_deposit_id withdraw_to_deposit_id"
            "&redirect_uri=rewards://gemini/authorization"
            "&state="
            "&response_type=code"
            "&code_challenge_method=S256"
            "&code_challenge=47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU");
  ASSERT_EQ(result->account_url, GEMINI_STAGING_URL "/ex/Home?login=1");

  // Connected
  wallet->status = type::WalletStatus::CONNECTED;
  result = gemini::GenerateLinks(wallet->Clone());
  ASSERT_EQ(result->add_url, "");
  ASSERT_EQ(result->withdraw_url, "");
  ASSERT_EQ(result->verify_url, GEMINI_STAGING_URL
            "/ex/OAuth/authorize"
            "?client_id=" GEMINI_STAGING_CLIENT_ID
            "&scope=assets create_deposit_id withdraw_to_deposit_id"
            "&redirect_uri=rewards://gemini/authorization"
            "&state="
            "&response_type=code"
            "&code_challenge_method=S256"
            "&code_challenge=47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU");
  ASSERT_EQ(result->account_url, GEMINI_STAGING_URL "/ex/Home?login=1");

  // Verified
  wallet->status = type::WalletStatus::VERIFIED;
  result = gemini::GenerateLinks(wallet->Clone());
  ASSERT_EQ(result->add_url, GEMINI_STAGING_URL "/ex/Home?login=1");
  ASSERT_EQ(result->withdraw_url, GEMINI_STAGING_URL "/ex/Home?login=1");
  ASSERT_EQ(result->verify_url, GEMINI_STAGING_URL
            "/ex/OAuth/authorize"
            "?client_id=" GEMINI_STAGING_CLIENT_ID
            "&scope=assets create_deposit_id withdraw_to_deposit_id"
            "&redirect_uri=rewards://gemini/authorization"
            "&state="
            "&response_type=code"
            "&code_challenge_method=S256"
            "&code_challenge=47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU");
  ASSERT_EQ(result->account_url, GEMINI_STAGING_URL "/ex/Home?login=1");

  // Disconnected Non-Verified
  wallet->status = type::WalletStatus::DISCONNECTED_NOT_VERIFIED;
  result = gemini::GenerateLinks(wallet->Clone());
  ASSERT_EQ(result->add_url, "");
  ASSERT_EQ(result->withdraw_url, "");
  ASSERT_EQ(result->verify_url, GEMINI_STAGING_URL
            "/ex/OAuth/authorize"
            "?client_id=" GEMINI_STAGING_CLIENT_ID
            "&scope=assets create_deposit_id withdraw_to_deposit_id"
            "&redirect_uri=rewards://gemini/authorization"
            "&state="
            "&response_type=code"
            "&code_challenge_method=S256"
            "&code_challenge=47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU");
  ASSERT_EQ(result->account_url, GEMINI_STAGING_URL "/ex/Home?login=1");

  // Disconnected Verified
  wallet->status = type::WalletStatus::DISCONNECTED_VERIFIED;
  result = gemini::GenerateLinks(wallet->Clone());
  ASSERT_EQ(result->add_url, "");
  ASSERT_EQ(result->withdraw_url, "");
  ASSERT_EQ(result->verify_url, GEMINI_STAGING_URL
            "/ex/OAuth/authorize"
            "?client_id=" GEMINI_STAGING_CLIENT_ID
            "&scope=assets create_deposit_id withdraw_to_deposit_id"
            "&redirect_uri=rewards://gemini/authorization"
            "&state="
            "&response_type=code"
            "&code_challenge_method=S256"
            "&code_challenge=47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU");
  ASSERT_EQ(result->account_url, GEMINI_STAGING_URL "/ex/Home?login=1");

  // Pending
  wallet->status = type::WalletStatus::PENDING;
  result = gemini::GenerateLinks(wallet->Clone());
  ASSERT_EQ(result->add_url, "");
  ASSERT_EQ(result->withdraw_url, "");
  ASSERT_EQ(result->verify_url, GEMINI_STAGING_URL
            "/ex/OAuth/authorize"
            "?client_id=" GEMINI_STAGING_CLIENT_ID
            "&scope=assets create_deposit_id withdraw_to_deposit_id"
            "&redirect_uri=rewards://gemini/authorization"
            "&state="
            "&response_type=code"
            "&code_challenge_method=S256"
            "&code_challenge=47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU");
  ASSERT_EQ(result->account_url, GEMINI_STAGING_URL "/ex/Home?login=1");
}

}  // namespace gemini
}  // namespace ledger
