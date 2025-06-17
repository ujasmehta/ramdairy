
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function AdminLoginPage() {
  const { user, signInWithGoogle, loading, isAuthEnabled } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthEnabled) {
      // If auth is disabled, redirect to dashboard immediately.
      // The AuthProvider will provide a mock user.
      router.push('/admin/dashboard');
      return;
    }
    // Only redirect if auth state is resolved (not loading) and user exists
    if (!loading && user) {
      router.push('/admin/dashboard');
    }
  }, [user, loading, router, isAuthEnabled]); 

  if (!isAuthEnabled) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-muted/40 p-4 text-center">
        <Card className="w-full max-w-sm shadow-xl">
          <CardHeader>
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2 mx-auto" />
            <CardTitle className="font-headline text-2xl">Auth Bypassed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Admin authentication is currently disabled for development.</p>
            <p className="text-muted-foreground mt-1">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If AuthProvider is still loading its initial state (e.g. checking for persisted session)
  if (loading && !user) { 
     return (
        <div className="flex flex-col justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Initializing authentication...</p>
        </div>
     );
  }
  
  // If auth state is resolved, user exists, and we are about to redirect (handled by useEffect)
  if (!loading && user) {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
    );
  }

  // If auth state is resolved, no user exists, show the login page
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-xl p-2 sm:p-0">
        <CardHeader className="text-center">
          <Image src="/google-logo.svg" alt="Google Logo" width={48} height={48} className="mx-auto mb-4" data-ai-hint="google logo" />
          <CardTitle className="font-headline text-3xl">Admin Portal</CardTitle>
          <CardDescription>Sign in with your Google account to access the RamDairyFarm admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={signInWithGoogle}
            className="w-full text-lg py-6"
            size="lg"
            disabled={loading} 
          >
            {loading ? ( 
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <svg aria-hidden="true" className="mr-2 -ml-1 w-5 h-5" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
            )}
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
