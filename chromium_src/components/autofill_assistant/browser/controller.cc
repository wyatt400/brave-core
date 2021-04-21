/* Copyright 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "base/feature_list.h"

namespace base {
namespace FeatureList {

bool BraveIsEnabled(const Feature& feature) {
  if (feature == features::kAutofillAssistantFeedbackChip) {
    return false;
  }
  return base::FeatureList::IsEnabled(feature);
}

}  // namespace FeatureList
}  // namespace base

#define IsEnabled BraveIsEnabled
#include "../../../../../components/autofill_assistant/browser/controller.cc"
#undef IsEnabled
