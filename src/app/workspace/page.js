import { Suspense } from 'react';
import WorkspaceApp from '@/workspace/components/WorkspaceApp';

function WorkspaceLoading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: '#6b7280'
    }}>
      Loading workspace...
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <WorkspaceApp />
    </Suspense>
  );
}
