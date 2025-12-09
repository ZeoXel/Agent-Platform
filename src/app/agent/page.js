import { redirect } from 'next/navigation';

export default function AgentRoute() {
  redirect('/workspace?tab=agent');
}
