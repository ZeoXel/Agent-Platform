"use client";

import Navbar from '@/components/layout/Navbar';
import WorkspaceShell from '@/workspace/components/WorkspaceShell';
import { WorkspaceProvider } from '@/workspace/contexts/WorkspaceContext';
import styles from './WorkspaceApp.module.css';

export default function WorkspaceApp() {
  return (
    <WorkspaceProvider>
      <div className={styles.appLayout}>
        <Navbar />
        <main className={styles.main}>
          <WorkspaceShell />
        </main>
      </div>
    </WorkspaceProvider>
  );
}
