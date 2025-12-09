"use client";

import { useCallback, useMemo, useState } from 'react';
import { useWorkspace } from '@/workspace/contexts/WorkspaceContext';
import { featuredItem, popularModels, recommendedWorkflows } from '@/workspace/tabs/ground/models';
import ExploreView from '@/workspace/tabs/ground/views/ExploreView';
import DetailView from '@/workspace/tabs/ground/views/DetailView';

const GROUND_VIEW_DEFAULT = 'explore';

function buildModelIndex() {
  const catalog = [featuredItem, ...popularModels, ...recommendedWorkflows];
  const map = new Map();
  catalog.forEach((item) => {
    map.set(item.id, item);
  });
  return map;
}

const MODEL_INDEX = buildModelIndex();

export default function GroundTab() {
  const { location, setLocation } = useWorkspace();
  const [detailState, setDetailState] = useState({});

  const view = location.groundView || GROUND_VIEW_DEFAULT;
  const modelId = location.modelId;
  const selectedModel = useMemo(() => (modelId ? MODEL_INDEX.get(modelId) : null), [modelId]);

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

  if (view === 'detail' && selectedModel) {
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
      onSelectModel={handleSelectModel}
    />
  );
}
