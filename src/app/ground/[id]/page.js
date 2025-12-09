import { redirect } from 'next/navigation';

export default function GroundDetailRoute({ params }) {
  const id = params?.id;
  const query = id ? `?tab=ground&groundView=detail&modelId=${encodeURIComponent(id)}` : '?tab=ground';
  redirect(`/workspace${query}`);
}
