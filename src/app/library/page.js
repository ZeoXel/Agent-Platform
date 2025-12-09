import { redirect } from 'next/navigation';

export default function LibraryRoute() {
  redirect('/workspace?tab=library');
}
