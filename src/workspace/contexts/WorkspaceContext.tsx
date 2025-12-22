"use client";

import { createContext, useCallback, useContext, useMemo, ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DEFAULT_WORKSPACE_TAB, WORKSPACE_TABS, isValidTabId, Tab } from '@/workspace/config/tabs';

interface Location {
  tab: string;
  [key: string]: string;
}

interface NavigateOptions {
  replace?: boolean;
}

interface WorkspaceContextValue {
  tabs: Tab[];
  activeTab: string;
  location: Location;
  switchTab: (tabId: string, options?: NavigateOptions) => void;
  setLocation: (partial: Record<string, string | null | undefined>, options?: NavigateOptions) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function searchParamsToObject(searchParams: URLSearchParams): Record<string, string> {
  const entries: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    entries[key] = value;
  });
  return entries;
}

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const rawLocation = useMemo(() => searchParamsToObject(searchParams), [searchParams]);
  const requestedTab = rawLocation.tab;
  const activeTab = isValidTabId(requestedTab) ? requestedTab : DEFAULT_WORKSPACE_TAB;

  const navigateWithQuery = useCallback(
    (changes: Record<string, string | null | undefined>, { replace = false }: NavigateOptions = {}) => {
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
    (tabId: string, options?: NavigateOptions) => {
      const nextTab = isValidTabId(tabId) ? tabId : DEFAULT_WORKSPACE_TAB;
      navigateWithQuery({ tab: nextTab === DEFAULT_WORKSPACE_TAB ? null : nextTab }, options);
    },
    [navigateWithQuery]
  );

  const setLocation = useCallback(
    (partial: Record<string, string | null | undefined>, options?: NavigateOptions) => {
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

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return ctx;
}
