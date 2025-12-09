"use client";

import { useWorkspace } from '@/workspace/contexts/WorkspaceContext';
import AgentTab from '@/workspace/tabs/agent/AgentTab';
import GroundTab from '@/workspace/tabs/ground/GroundTab';
import LibraryTab from '@/workspace/tabs/library/LibraryTab';
import styles from './WorkspaceShell.module.css';

const TAB_COMPONENTS = {
  agent: AgentTab,
  ground: GroundTab,
  library: LibraryTab,
};

export default function WorkspaceShell() {
  const { activeTab, tabs } = useWorkspace();
  return (
    <div className={styles.container}>
      {tabs.map(({ id }) => {
        const TabComponent = TAB_COMPONENTS[id];
        if (!TabComponent) return null;
        return (
          <div
            key={id}
            className={id === activeTab ? styles.panel : styles.panelHidden}
          >
            <TabComponent />
          </div>
        );
      })}
    </div>
  );
}
