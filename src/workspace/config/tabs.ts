export interface Tab {
  id: string;
  label: string;
}

export const WORKSPACE_TABS: Tab[] = [
  { id: 'agent', label: 'Agent' },
  { id: 'ground', label: 'Ground' },
  { id: 'library', label: 'Library' },
  { id: 'studio', label: 'Studio' },
];

export const DEFAULT_WORKSPACE_TAB = WORKSPACE_TABS[0].id;

export const TAB_LOOKUP: Record<string, Tab> = WORKSPACE_TABS.reduce((acc, tab) => {
  acc[tab.id] = tab;
  return acc;
}, {} as Record<string, Tab>);

export function isValidTabId(tabId: string | null | undefined): tabId is string {
  return Boolean(tabId && TAB_LOOKUP[tabId]);
}
