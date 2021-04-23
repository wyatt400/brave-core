/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/search_engines/private_window_search_engine_provider_service.h"

#include "brave/common/pref_names.h"
#include "chrome/browser/profiles/profile.h"
#include "components/prefs/pref_service.h"
#include "components/search_engines/default_search_manager.h"
#include "components/search_engines/template_url.h"
#include "components/search_engines/template_url_data_util.h"
#include "extensions/buildflags/buildflags.h"

#if BUILDFLAG(ENABLE_EXTENSIONS)
#include "extensions/browser/extension_prefs.h"
#endif

PrivateWindowSearchEngineProviderService::
PrivateWindowSearchEngineProviderService(Profile* otr_profile)
    : SearchEngineProviderService(otr_profile) {
  DCHECK(otr_profile->IsIncognitoProfile());

#if BUILDFLAG(ENABLE_EXTENSIONS)
  const bool use_extension_provider =
      original_template_url_service_->IsExtensionControlledDefaultSearch();

  otr_profile->GetPrefs()->SetBoolean(kDefaultSearchProviderByExtension, use_extension_provider);
  if (use_extension_provider) {
    auto* extension_provider_url = original_template_url_service_->GetDefaultSearchProvider();
    auto data = extension_provider_url->data();
    data.id = kInvalidTemplateURLID;
    auto type = extension_provider_url->type();
    auto extension_id = extension_provider_url->GetExtensionId();
    extensions::ExtensionPrefs* prefs = extensions::ExtensionPrefs::Get(otr_profile->GetOriginalProfile());
    auto time = prefs->GetInstallTime(extension_id);

    auto turl = std::make_unique<TemplateURL>(
        data, type, extension_id, time, true);

    otr_template_url_service_->Add(std::move(turl));
    otr_profile->GetPrefs()->Set(DefaultSearchManager::kDefaultSearchProviderDataPrefName,
                                 *TemplateURLDataToDictionary(data));
  } else {
    // Monitor normal profile's search engine changing because private window
    // should that search engine provider when alternative search engine isn't
    // used.
    ConfigureSearchEngineProvider();
    observation_.Observe(original_template_url_service_);
  }
#else
  ConfigureSearchEngineProvider();
  observation_.Observe(original_template_url_service_);
#endif
}

PrivateWindowSearchEngineProviderService::
~PrivateWindowSearchEngineProviderService() = default;

void PrivateWindowSearchEngineProviderService::
OnUseAlternativeSearchEngineProviderChanged() {
  if (original_template_url_service_->IsExtensionControlledDefaultSearch())
    return;

  ConfigureSearchEngineProvider();
}

void PrivateWindowSearchEngineProviderService::
ConfigureSearchEngineProvider() {
  DCHECK(!original_template_url_service_->IsExtensionControlledDefaultSearch());

  UseAlternativeSearchEngineProvider()
      ? ChangeToAlternativeSearchEngineProvider()
      : ChangeToNormalWindowSearchEngineProvider();
}

void
PrivateWindowSearchEngineProviderService::OnTemplateURLServiceChanged() {
  DCHECK(!original_template_url_service_->IsExtensionControlledDefaultSearch());

  // If private window uses alternative, search provider changing of normal
  // profile should not affect private window's provider.
  if (UseAlternativeSearchEngineProvider())
    return;

  // When normal profile's default search provider is changed, apply it to
  // private window's provider.
  ChangeToNormalWindowSearchEngineProvider();
}
