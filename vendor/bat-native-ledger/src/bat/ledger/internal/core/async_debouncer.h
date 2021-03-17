/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_VENDOR_BAT_NATIVE_LEDGER_SRC_BAT_LEDGER_INTERNAL_CORE_ASYNC_DEBOUNCER_H_
#define BRAVE_VENDOR_BAT_NATIVE_LEDGER_SRC_BAT_LEDGER_INTERNAL_CORE_ASYNC_DEBOUNCER_H_

#include <list>
#include <map>
#include <type_traits>
#include <utility>

#include "base/memory/weak_ptr.h"
#include "base/optional.h"
#include "base/time/time.h"
#include "bat/ledger/internal/core/async_result.h"

namespace ledger {

// Debounces operations that return async results. Operations can be keyed and
// results can be cached for a user-specified amount of time.
//
// Example:
//
//   AsyncDebouncer<int> debouncer(base::TimeDelta::FromSeconds(5));
//
//   debouncer.GetValue([]() {
//     AsyncResult<int>::Resolver resolver;
//     resolver.Complete(42);
//     return resolver.result();
//   }).Then([](int value) {
//     LOG(INFO) << "Value is: " << value;
//   });
template <typename T, typename Key = int>
class AsyncDebouncer {
 private:
  static_assert(std::is_copy_constructible<T>::value,
                "AsyncDebouncer<T> requires that T is copy constructible");

  using Resolver = typename AsyncResult<T>::Resolver;

  struct Entry {
    base::Optional<T> value;
    base::Time complete_time;
    std::list<Resolver> resolvers;
  };

 public:
  AsyncDebouncer() {}
  explicit AsyncDebouncer(base::TimeDelta max_age) : max_age_(max_age) {}

  template <typename F>
  AsyncResult<T> GetResult(F fn) {
    return GetResult(Key(), std::forward<F>(fn));
  }

  template <typename F>
  AsyncResult<T> GetResult(Key key, F fn) {
    Resolver resolver;

    auto iter = entries_.find(key);
    if (iter == entries_.end()) {
      auto pair = entries_.emplace(key, Entry());
      iter = pair.first;
    } else {
      Entry& entry = iter->second;
      if (entry.value && !EntryIsStale(entry)) {
        resolver.Complete(*entry.value);
        return resolver.result();
      }
    }

    Entry& entry = iter->second;
    entry.resolvers.push_back(resolver);
    if (entry.resolvers.size() == 1) {
      fn().Then(base::BindOnce(&AsyncDebouncer::OnResult,
                               weak_factory_.GetWeakPtr(), key));
    }

    return resolver.result();
  }

 private:
  void OnResult(Key key, T value) {
    auto iter = entries_.find(key);
    DCHECK(iter != entries_.end());

    Entry& entry = iter->second;
    entry.value = std::move(value);
    entry.complete_time = base::Time::Now();
    std::list<Resolver> resolvers = std::move(entry.resolvers);

    for (auto& resolver : resolvers)
      resolver.Complete(*entry.value);

    PurgeStaleEntries();
  }

  void PurgeStaleEntries() {
    for (auto iter = entries_.begin(); iter != entries_.end();) {
      if (EntryIsStale(iter->second))
        iter = entries_.erase(iter);
      else
        ++iter;
    }
  }

  bool EntryIsStale(const Entry& entry) {
    return entry.value && entry.complete_time + max_age_ <= base::Time::Now();
  }

  base::TimeDelta max_age_;
  std::map<Key, Entry> entries_;
  base::WeakPtrFactory<AsyncDebouncer> weak_factory_{this};
};

}  // namespace ledger

#endif  // BRAVE_VENDOR_BAT_NATIVE_LEDGER_SRC_BAT_LEDGER_INTERNAL_CORE_ASYNC_DEBOUNCER_H_
