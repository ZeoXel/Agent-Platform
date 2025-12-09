import { redirect } from 'next/navigation';

export default function GroundRoute() {
  redirect('/workspace?tab=ground');
}
