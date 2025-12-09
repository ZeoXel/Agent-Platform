"use client";

import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DEFAULT_WORKSPACE_TAB, WORKSPACE_TABS, isValidTabId } from '@/workspace/config/tabs';

const WorkspaceContext = createContext(null);

function searchParamsToObject(searchParams) {
  const entries = {};
  searchParams.forEach((value, key) => {
    entries[key] = value;
  });
  return entries;
}

export function WorkspaceProvider({ children }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawLocation = useMemo(() => searchParamsToObject(searchParams), [searchParams]);
  const requestedTab = rawLocation.tab;
  const activeTab = isValidTabId(requestedTab) ? requestedTab : DEFAULT_WORKSPACE_TAB;

  const navigateWithQuery = useCallback(
    (changes, { replace = false } = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(changes).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const tabValue = params.get('tab');
      if (tabValue && !isValidTabId(tabValue)) {
        params.set('tab', DEFAULT_WORKSPACE_TAB);
      }

      if (params.get('tab') === DEFAULT_WORKSPACE_TAB) {
        params.delete('tab');
      }

      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      const method = replace ? router.replace : router.push;
      method(url, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const switchTab = useCallback(
    (tabId, options) => {
      const nextTab = isValidTabId(tabId) ? tabId : DEFAULT_WORKSPACE_TAB;
      navigateWithQuery({ tab: nextTab === DEFAULT_WORKSPACE_TAB ? null : nextTab }, options);
    },
    [navigateWithQuery]
  );

  const setLocation = useCallback(
    (partial, options) => {
      navigateWithQuery(partial, options);
    },
    [navigateWithQuery]
  );

  const contextValue = useMemo(
    () => ({
      tabs: WORKSPACE_TABS,
      activeTab,
      location: { ...rawLocation, tab: activeTab },
      switchTab,
      setLocation,
    }),
    [activeTab, rawLocation, setLocation, switchTab]
  );

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return ctx;
}
