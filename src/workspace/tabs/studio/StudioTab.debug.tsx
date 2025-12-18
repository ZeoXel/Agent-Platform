"use client";

import React, { useState } from 'react';
// 测试：逐步添加导入来找出问题

// Step 1: 测试基础导入
import { Node } from './components/Node';
import { SidebarDock } from './components/SidebarDock';

export default function StudioTab() {
  const [nodes, setNodes] = useState([]);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0a0c', color: 'white', padding: '20px' }}>
      <h1>Studio - 调试版本</h1>
      <p>组件导入测试</p>
      <ul>
        <li>✅ Node 组件: {typeof Node}</li>
        <li>✅ SidebarDock 组件: {typeof SidebarDock}</li>
      </ul>
      <div style={{ marginTop: '20px', padding: '10px', background: '#1a1a1c', borderRadius: '8px' }}>
        <p>节点数量: {nodes.length}</p>
      </div>
    </div>
  );
}
