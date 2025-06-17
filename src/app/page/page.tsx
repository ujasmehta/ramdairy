// src/app/page/page.tsx
import { redirect } from 'next/navigation';

export default function MisdirectedPage() {
  redirect('/');
  // This component will not render anything as redirect() will throw an error
  // that Next.js intercepts to perform the redirection.
  // No explicit return null is needed for Server Components after redirect.
}
