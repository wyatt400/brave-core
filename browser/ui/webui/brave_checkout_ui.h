/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_UI_WEBUI_BRAVE_CHECKOUT_UI_H_
#define BRAVE_BROWSER_UI_WEBUI_BRAVE_CHECKOUT_UI_H_

#include <string>

#include "chrome/browser/ui/webui/constrained_web_dialog_ui.h"

class BraveCheckoutUI : public ConstrainedWebDialogUI {
 public:
  BraveCheckoutUI(content::WebUI* web_ui, const std::string& host);
  ~BraveCheckoutUI() override;

 private:
  BraveCheckoutUI(const BraveCheckoutUI&) = delete;
  BraveCheckoutUI& operator=(const BraveCheckoutUI&) = delete;
};

#endif  // BRAVE_BROWSER_UI_WEBUI_BRAVE_CHECKOUT_UI_H_
