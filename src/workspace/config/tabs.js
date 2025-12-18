export const WORKSPACE_TABS = [
  { id: 'agent', label: 'Agent' },
  { id: 'ground', label: 'Ground' },
  { id: 'library', label: 'Library' },
  { id: 'studio', label: 'Studio' },
];

export const DEFAULT_WORKSPACE_TAB = WORKSPACE_TABS[0].id;

export const TAB_LOOKUP = WORKSPACE_TABS.reduce((acc, tab) => {
  acc[tab.id] = tab;
  return acc;
}, {});

export function isValidTabId(tabId) {
  return Boolean(tabId && TAB_LOOKUP[tabId]);
}
