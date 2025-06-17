
'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, LogOut, Package, ListChecks, Milk, Beef, Home, Settings, Loader2 } from 'lucide-react';
import Logo from '@/components/icons/logo';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/cows', label: 'Cows', icon: Beef },
  { href: '/admin/feed', label: 'Feed Logs', icon: ListChecks },
  { href: '/admin/milk', label: 'Milk Logs', icon: Milk },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/customers', label: 'Customers', icon: Users, disabled: false },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut, isAuthEnabled } = useAuth();
  const router = useRouter();
  const pathname = usePathname();


  if (pathname === '/admin/login') {
    // If auth is disabled, AdminLoginPage itself will handle redirection
    // If auth is enabled, show spinner while AuthProvider loads
    if (isAuthEnabled && loading) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-muted/40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" /> Initializing Auth...
        </div>
      );
    }
    // Let AdminLoginPage render if auth is disabled OR auth is enabled and no longer loading
    return <>{children}</>;
  }

  useEffect(() => {
    // Only enforce auth check if auth is enabled
    if (isAuthEnabled && !loading && !user && pathname !== '/admin/login') { 
      router.push('/admin/login');
    }
  }, [user, loading, router, pathname, isAuthEnabled]); 

  // Show loading spinner for non-login pages if auth is enabled and loading
  if (isAuthEnabled && loading && pathname !== '/admin/login') {
    return <div className="flex justify-center items-center min-h-screen bg-muted/40"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading Admin Area...</div>;
  }

  // If auth is enabled, no user, and not on login page, show preparing login (should be caught by useEffect redirect)
  if (isAuthEnabled && !user && pathname !== '/admin/login') {
    return (
        <div className="flex justify-center items-center min-h-screen bg-muted/40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" /> Preparing login...
        </div>
    );
  }
  
  // If auth is enabled, user exists OR auth is disabled (meaning access is granted)
  // And we are not on the login page (which is handled above)
  const canAccessAdmin = (isAuthEnabled && user) || !isAuthEnabled;

  if (!canAccessAdmin && pathname !== '/admin/login') {
     // This case should ideally not be hit frequently due to the useEffect redirect,
     // but serves as a fallback.
     return <div className="flex justify-center items-center min-h-screen bg-muted/40"><Loader2 className="h-8 w-8 animate-spin text-primary" /> Access Denied. Redirecting...</div>;
  }


  const handleSignOut = async () => {
    if (!isAuthEnabled) {
      // In a real scenario with a mock user, "signing out" might mean clearing the mock user
      // or simply doing nothing if access is always granted.
      // For this implementation, signOut in AuthProvider handles the toast.
      await signOut(); 
      // No router.push needed here if auth is disabled, as access remains.
      // If we wanted to "log out" the mock user, AuthProvider would set user to null,
      // and then this layout's logic would need to adjust.
      // However, current AuthProvider's signOut for disabled auth just toasts and keeps mockUser.
      return;
    }
    await signOut();
    router.push('/'); 
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="w-64 bg-background border-r p-4 flex flex-col shadow-md">
        <div className="mb-6">
         <Logo />
        </div>
        <nav className="flex flex-col space-y-1 flex-grow">
          {adminNavItems.map(item => (
            <Link 
              key={item.href}
              href={item.disabled ? '#' : item.href}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-md text-sm font-medium transition-colors",
                item.disabled ? "text-muted-foreground opacity-60 cursor-not-allowed" : "text-foreground hover:bg-primary/10 hover:text-primary",
                !item.disabled && pathname === item.href && "bg-primary/10 text-primary font-semibold"
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
              aria-disabled={item.disabled}
            >
              <item.icon size={20} className="shrink-0" /> 
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t">
           {user && ( // This will show mock user info if auth is disabled
            <>
                <p className="text-xs text-muted-foreground mb-1 px-2">Signed in as:</p>
                <p className="text-sm font-medium text-foreground truncate mb-3 px-2" title={user.email || ''}>{user.displayName || user.email}</p>
                {!isAuthEnabled && <p className="text-xs text-amber-600 px-2 mb-2">(Authentication Bypassed)</p>}
            </>
           )}
          <Button 
            variant="outline" 
            onClick={handleSignOut} 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:border-destructive/50"
            disabled={!isAuthEnabled && loading} // Disable if auth is off and still somehow "loading"
          >
            <LogOut size={18} className="mr-2" /> 
            {isAuthEnabled ? 'Sign Out' : 'Sign Out (Auth Bypassed)'}
          </Button>
           <Button variant="ghost" asChild className="w-full justify-start text-muted-foreground hover:text-primary mt-2">
            <Link href="/">
                <Home size={18} className="mr-2" /> Back to Site
            </Link>
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
