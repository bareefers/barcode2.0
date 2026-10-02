'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Menu,
  X,
  Box,
  Wrench,
  Droplets,
  ShoppingCart,
  Users,
  LogOut,
  User,
  Shield,
  Trophy,
  CalendarDays,
  ChevronDown,
  PlusCircle,
  Download,
  Network,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { legacyBarcodeUrl } from '@/lib/legacy-barcode';

type NavLeaf = { name: string; href: string; external?: boolean; icon?: React.ComponentType<{ className?: string }> };
type NavGroup = { name: string; icon: React.ComponentType<{ className?: string }>; children: NavLeaf[] };
type NavItem = NavLeaf | NavGroup;

function isGroup(item: NavItem): item is NavGroup {
  return 'children' in item;
}

/** Labels match classic BARcode drawer (site/layouts/default.vue). */
const navigation: NavItem[] = [
  { name: 'Add a new item', href: '/add', icon: PlusCircle },
  { name: 'Your collection', href: '/collection', icon: Box },
  { name: 'Your tanks', href: '/tanks', icon: Droplets },
  {
    name: 'DBTC',
    icon: Network,
    children: [
      { name: 'DBTC collection', href: '/collection/dbtc', icon: Network },
      { name: 'DBTC top 10', href: '/top10', icon: Trophy },
      { name: 'Import DBTC threads', href: legacyBarcodeUrl('/bc/import'), external: true, icon: Download },
    ],
  },
  { name: 'PIF collection', href: '/collection/pif', icon: Box },
  { name: 'Equipment', href: '/equipment', icon: Wrench },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Marketplace', href: '/market', icon: ShoppingCart },
  { name: 'Frag swaps', href: '/swaps', icon: CalendarDays },
];

function linkActive(pathname: string, href: string) {
  if (href.startsWith('http')) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: userData } = useUser();

  const userInitials = userData?.name
    ? userData.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex min-h-16 sm:min-h-24 items-center justify-between gap-2 px-3 sm:px-4 py-2">
        <div className="flex shrink-0 items-center gap-3 sm:gap-4 min-w-0">
          <Link
            href="/"
            className="flex items-center min-w-0 focus:outline-none focus:ring-2 focus:ring-primary rounded touch-manipulation"
            aria-label="BARcode 2.0 home"
          >
            <Image
              src="/barcode-logo.png"
              alt="BARcode - Bay Area Reefers"
              width={360}
              height={96}
              className="h-14 w-auto max-w-[50vw] sm:h-[calc(var(--spacing)*35)] sm:max-w-[320px] object-contain object-left"
              priority
              sizes="(max-width: 640px) 50vw, 320px"
            />
          </Link>

          <div className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-0.5">
            {navigation.map((item) => {
              if (isGroup(item)) {
                const groupActive = item.children.some((c) => !c.external && linkActive(pathname, c.href));
                return (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'gap-1 px-2.5 text-sm font-medium',
                          groupActive
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                            : 'text-muted-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>{item.name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {item.children.map((child) =>
                        child.external ? (
                          <DropdownMenuItem key={child.name} asChild>
                            <a href={child.href} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                              {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                              {child.name}
                            </a>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem key={child.name} asChild>
                            <Link href={child.href} className="cursor-pointer">
                              {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                              {child.name}
                            </Link>
                          </DropdownMenuItem>
                        )
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              const active = linkActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium rounded-md transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userData && (
            <>
              <Link href="/add">
                <Button variant="default" size="sm" className="hidden sm:flex bg-blue-600 text-white hover:bg-blue-700">
                  Add a new item
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <p className="text-sm font-medium leading-none">{userData.name}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/collection" className="cursor-pointer">
                      <Box className="mr-2 h-4 w-4" />
                      Your collection
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tanks" className="cursor-pointer">
                      <Droplets className="mr-2 h-4 w-4" />
                      Your tanks
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/member/${userData.id}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My profile
                    </Link>
                  </DropdownMenuItem>
                  {userData.canImpersonate && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a
                      href="https://bareefers.org/forum/login/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out (at forum)
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t max-h-[70vh] overflow-y-auto">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => {
              if (isGroup(item)) {
                return (
                  <div key={item.name} className="pt-2">
                    <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.name}
                    </p>
                    {item.children.map((child) =>
                      child.external ? (
                        <a
                          key={child.name}
                          href={child.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-muted"
                        >
                          {child.icon && <child.icon className="h-5 w-5" />}
                          {child.name}
                        </a>
                      ) : (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md',
                            linkActive(pathname, child.href)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted'
                          )}
                        >
                          {child.icon && <child.icon className="h-5 w-5" />}
                          {child.name}
                        </Link>
                      )
                    )}
                  </div>
                );
              }
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md',
                    linkActive(pathname, item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
