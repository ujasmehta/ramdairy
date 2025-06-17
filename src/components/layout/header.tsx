
'use client';

import Link from 'next/link';
import { Menu, Milk, Home, Users, ShoppingCart, Sparkles, Beef, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/icons/logo';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/cows', label: 'Our Cows', icon: Beef },
  { href: '/visit', label: 'Farm Visits', icon: Users },
  { href: '/products', label: 'Our Products', icon: Milk },
  { href: '/prayer', label: 'Prayer Guide', icon: Sparkles },
];

export default function Header() {
  const pathname = usePathname();
  // const { user, loading, isAuthEnabled } = useAuth(); // Auth context no longer needed here for admin link

  const NavLink = ({ href, label, icon: Icon, isExternal = false }: { href: string; label: string; icon: React.ElementType; isExternal?: boolean }) => (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
        pathname === href ? 'bg-accent text-accent-foreground' : 'text-foreground/80'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );

  // Admin link logic removed from here

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Logo />
        <nav className="hidden md:flex gap-1 items-center">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          {/* Admin link removed */}
          <Button asChild size="sm" className="ml-2">
            <Link href="/products#order">
              <ShoppingCart className="mr-2 h-4 w-4" /> Order Now
            </Link>
          </Button>
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-4 py-6">
                <div className="mb-4">
                  <Logo />
                </div>
                {navItems.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}
                {/* Admin link removed */}
                <Button asChild className="mt-4">
                  <Link href="/products#order">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Order Now
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
