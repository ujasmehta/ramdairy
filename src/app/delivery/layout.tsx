
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Home, UserCircle, Loader2, FerrisWheel } from 'lucide-react';
import Logo from '@/components/icons/logo';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut, isAuthEnabled } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to admin login if auth is enabled, not loading, and no user
  useEffect(() => {
    if (isAuthEnabled && !loading && !user && pathname !== '/admin/login') { 
      router.push('/admin/login?redirect=/delivery/dashboard'); // Redirect to admin login, then to delivery
    }
  }, [user, loading, router, pathname, isAuthEnabled]);

  // Show loading spinner while auth state is being determined
  if (isAuthEnabled && loading) {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-muted/40">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Initializing Delivery Portal...</p>
        </div>
    );
  }

  // If auth is enabled but no user, and not on login page (should be caught by useEffect)
  if (isAuthEnabled && !user && pathname !== '/admin/login') {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-muted/40">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
    );
  }
  
  // Access granted if:
  // 1. Auth is enabled AND user exists
  // 2. Auth is disabled (mock user is provided by AuthProvider)
  const canAccessDeliveryPortal = (isAuthEnabled && user) || !isAuthEnabled;

  if (!canAccessDeliveryPortal && pathname !== '/admin/login') {
     return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-muted/40">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Access Denied. Redirecting...</p>
        </div>
     );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/'); 
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <FerrisWheel className="h-7 w-7 text-primary" />
            <Link href="/delivery/dashboard" className="text-2xl font-bold font-headline text-primary hover:text-primary/90 transition-colors">
              Delivery Portal
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 text-sm">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground truncate max-w-[150px]" title={user.displayName || user.email || ''}>
                  {user.displayName || user.email}
                </span>
                 {!isAuthEnabled && <span className="text-xs text-amber-600">(Bypassed)</span>}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut} disabled={!isAuthEnabled && loading} >
              <LogOut size={16} className="mr-1.5" />
              {isAuthEnabled ? 'Sign Out' : 'Sign Out'}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <Home size={16} className="mr-1.5" /> Site
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-muted-foreground border-t">
        RamDairyFarm Delivery Portal &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
