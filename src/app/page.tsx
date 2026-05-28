import { redirect } from 'next/navigation';

export default function RootPage() {
  // Triggers immediate App Router redirection to login
  redirect('/login');
}
