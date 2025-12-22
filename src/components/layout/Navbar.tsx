'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWorkspace } from '@/workspace/contexts/WorkspaceContext';

export default function Navbar() {
  const { activeTab, switchTab, tabs } = useWorkspace();

  const handleNavClick = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    switchTab(tabId);
  };

  return (
    <nav className="h-16 backdrop-blur-2xl backdrop-saturate-150 bg-white/25 border-b border-white/40 sticky top-0 z-50 transition-all duration-300">
      <div className="w-full px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <Image
            src="/logo.svg"
            alt="Agent Platform Logo"
            width={32}
            height={32}
            className="transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3"
            priority
          />
          <span className="text-lg font-semibold text-gray-800 transition-colors duration-200 group-hover:text-blue-600">
            Agent Platform
          </span>
        </div>

        {/* Nav Links */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href="/workspace"
              onClick={(e) => handleNavClick(e, tab.id)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ease-out
                hover:bg-white/40 hover:scale-[1.02]
                active:scale-[0.96] active:bg-white/55
                ${activeTab === tab.id
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* User */}
        <div className="flex items-center">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
            backdrop-blur-xl backdrop-saturate-150 bg-blue-500/15
            border border-blue-400/30 text-blue-600
            transition-all duration-200 ease-out
            hover:bg-blue-500/25 hover:scale-105 hover:border-blue-400/50
            active:scale-95">
            U
          </button>
        </div>
      </div>
    </nav>
  );
}
