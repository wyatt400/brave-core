/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "bat/ledger/internal/core/async_debouncer.h"

#include <vector>

#include "base/test/bind.h"
#include "base/test/task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace ledger {

class AsyncDebouncerTest : public testing::Test {
 protected:
  auto MakeValueGenerator(int* calls) {
    return [calls]() {
      ++(*calls);
      AsyncResult<int>::Resolver resolver;
      resolver.Complete(*calls);
      return resolver.result();
    };
  }

  base::test::TaskEnvironment task_environment_{
      base::test::TaskEnvironment::TimeSource::MOCK_TIME};
};

TEST_F(AsyncDebouncerTest, DebouncesPendingRequests) {
  AsyncDebouncer<int> debouncer;

  int generate_calls = 0;
  auto generate_value = MakeValueGenerator(&generate_calls);

  std::vector<int> values;
  auto gather_values = [&values](int value) { values.push_back(value); };

  debouncer.GetResult(generate_value)
      .Then(base::BindLambdaForTesting(gather_values));
  debouncer.GetResult(generate_value)
      .Then(base::BindLambdaForTesting(gather_values));
  debouncer.GetResult(generate_value)
      .Then(base::BindLambdaForTesting(gather_values));

  EXPECT_EQ(generate_calls, 1);

  task_environment_.RunUntilIdle();

  debouncer.GetResult(generate_value)
      .Then(base::BindLambdaForTesting(gather_values));

  task_environment_.RunUntilIdle();

  EXPECT_EQ(generate_calls, 2);

  ASSERT_EQ(values.size(), 4ul);
  EXPECT_EQ(values[0], 1);
  EXPECT_EQ(values[1], 1);
  EXPECT_EQ(values[2], 1);
  EXPECT_EQ(values[3], 2);
}

TEST_F(AsyncDebouncerTest, DebouncesFreshResults) {
  AsyncDebouncer<int> debouncer(base::TimeDelta::FromSeconds(10));

  int generate_calls = 0;
  auto generate_value = MakeValueGenerator(&generate_calls);

  debouncer.GetResult(generate_value);
  EXPECT_EQ(generate_calls, 1);

  task_environment_.FastForwardBy(base::TimeDelta::FromSeconds(2));

  debouncer.GetResult(generate_value);
  EXPECT_EQ(generate_calls, 1);

  task_environment_.FastForwardBy(base::TimeDelta::FromSeconds(8));

  debouncer.GetResult(generate_value);
  EXPECT_EQ(generate_calls, 2);
}

TEST_F(AsyncDebouncerTest, BouncesUniqueKeys) {
  AsyncDebouncer<int, int> debouncer;

  int generate_calls = 0;
  auto generate_value = MakeValueGenerator(&generate_calls);

  debouncer.GetResult(1, generate_value);
  debouncer.GetResult(2, generate_value);

  EXPECT_EQ(generate_calls, 2);
}

}  // namespace ledger
