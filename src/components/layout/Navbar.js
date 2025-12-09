"use client";

import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';
import { useWorkspace } from '@/workspace/contexts/WorkspaceContext';

export default function Navbar() {
  const { activeTab, switchTab, tabs } = useWorkspace();

  const handleNavClick = (e, tabId) => {
    e.preventDefault();
    switchTab(tabId);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Image
            src="/logo.svg"
            alt="Agent Platform Logo"
            width={32}
            height={32}
            className={styles.logoIcon}
            priority
          />
          <span className={styles.logoText}>Agent Platform</span>
        </div>
        <div className={styles.links}>
          {tabs.map((tab) => {
            const linkClassName =
              activeTab === tab.id
                ? `${styles.link} ${styles.linkActive}`
                : styles.link;
            return (
              <Link
                key={tab.id}
                href="/workspace"
                className={linkClassName}
                onClick={(e) => handleNavClick(e, tab.id)}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <div className={styles.user}>
          <div className={styles.avatar}>U</div>
        </div>
      </div>
    </nav>
  );
}
