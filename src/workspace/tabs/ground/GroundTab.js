"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@/workspace/contexts/WorkspaceContext';
import { featuredItem, popularModels, recommendedWorkflows, packToGroundItem, capeToGroundItem } from '@/workspace/tabs/ground/models';
import { capeService } from '@/services/capeService';
import ExploreView from '@/workspace/tabs/ground/views/ExploreView';
import DetailView from '@/workspace/tabs/ground/views/DetailView';
import PackDetailView from '@/workspace/tabs/ground/views/PackDetailView';
import CapeDetailView from '@/workspace/tabs/ground/views/CapeDetailView';

const GROUND_VIEW_DEFAULT = 'explore';

export default function GroundTab() {
  const { location, setLocation } = useWorkspace();
  const [detailState, setDetailState] = useState({});
  const [packs, setPacks] = useState([]);
  const [packsLoading, setPacksLoading] = useState(true);

  // 加载 Packs
  useEffect(() => {
    async function loadPacks() {
      setPacksLoading(true);
      try {
        const data = await capeService.getPacks();
        const packsData = data.packs || data || [];
        setPacks(packsData);
      } catch (err) {
        console.error('Failed to load packs:', err);
        setPacks([]);
      } finally {
        setPacksLoading(false);
      }
    }
    loadPacks();
  }, []);

  // 将 packs 转换为 Ground 格式
  const packItems = useMemo(() => {
    return packs.map(packToGroundItem);
  }, [packs]);

  // 从 packs 中提取所有 capes 并转换
  const allCapeItems = useMemo(() => {
    const capes = [];
    packs.forEach(pack => {
      if (pack.capes) {
        pack.capes.forEach(cape => {
          capes.push(capeToGroundItem(cape));
        });
      }
    });
    return capes;
  }, [packs]);

  // 构建完整的模型索引
  const modelIndex = useMemo(() => {
    const catalog = [featuredItem, ...popularModels, ...recommendedWorkflows, ...packItems, ...allCapeItems];
    const map = new Map();
    catalog.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [packItems, allCapeItems]);

  const view = location.groundView || GROUND_VIEW_DEFAULT;
  const modelId = location.modelId;
  const selectedModel = useMemo(() => (modelId ? modelIndex.get(modelId) : null), [modelId, modelIndex]);

  const persistDetailState = useCallback((id, partialState) => {
    if (!id) return;
    setDetailState((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        ...partialState,
      },
    }));
  }, []);

  const handleDetailStateChange = useCallback(
    (partialState) => {
      if (!selectedModel) return;
      persistDetailState(selectedModel.id, partialState);
    },
    [persistDetailState, selectedModel]
  );

  const handleSelectModel = useCallback(
    (id) => {
      if (!id) return;
      setLocation({ tab: 'ground', groundView: 'detail', modelId: id });
    },
    [setLocation]
  );

  const handleBackToExplore = useCallback(() => {
    setLocation({ tab: 'ground', groundView: 'explore', modelId: null });
  }, [setLocation]);

  // 详情视图
  if (view === 'detail' && selectedModel) {
    // Pack 使用 PackDetailView
    if (selectedModel.type === 'Pack') {
      return (
        <PackDetailView
          key={selectedModel.id}
          item={selectedModel}
          savedState={detailState[selectedModel.id]}
          onStateChange={handleDetailStateChange}
          onBack={handleBackToExplore}
          onSelectCape={(capeId) => {
            setLocation({ tab: 'ground', groundView: 'detail', modelId: `cape-${capeId}` });
          }}
        />
      );
    }

    // Cape 使用 CapeDetailView
    if (selectedModel.type === 'Cape') {
      return (
        <CapeDetailView
          key={selectedModel.id}
          item={selectedModel}
          savedState={detailState[selectedModel.id]}
          onStateChange={handleDetailStateChange}
          onBack={handleBackToExplore}
        />
      );
    }

    // 其他类型使用默认 DetailView
    return (
      <DetailView
        key={selectedModel.id}
        item={selectedModel}
        savedState={detailState[selectedModel.id]}
        onStateChange={handleDetailStateChange}
        onBack={handleBackToExplore}
      />
    );
  }

  return (
    <ExploreView
      featuredItem={featuredItem}
      popularModels={popularModels}
      recommendedWorkflows={recommendedWorkflows}
      packItems={packItems}
      packsLoading={packsLoading}
      onSelectModel={handleSelectModel}
    />
  );
}
