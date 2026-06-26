'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, Upload, X, LayoutGrid, LogOut, ChevronDown, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/user';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  avatarUrl?: string;
}

const navLinks = [
  { href: '/', label: 'Browse', icon: LayoutGrid },
  { href: '/brand-guidelines', label: 'Brand Guidelines', icon: BookOpen },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function RoleBadge({ role }: { role: UserRole }) {
  if (role === 'Admin' || role === 'Marketing Team') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
        Admin
      </span>
    );
  }
  if (role === 'Design Team') {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
        Design
      </span>
    );
  }
  return null;
}

function UserAvatar({ user }: { user: AuthUser }) {
  if (user.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt={user.name}
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="h-8 w-8 rounded-full bg-[#4E86F7] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
      {getInitials(user.name)}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (pathname === '/brand-guidelines') return;
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
        else setCurrentUser(null);
      })
      .catch(() => {});
  }, [pathname]);

  if (pathname === '/brand-guidelines') return null;

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    router.push('/login');
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <Image
              src="/workiom-logo.png"
              alt="Workiom"
              width={120}
              height={32}
              className="h-8 w-auto object-contain"
              priority
            />
            <span className="hidden sm:block text-slate-300 select-none">|</span>
            <span className="hidden sm:block text-sm font-medium text-slate-600 whitespace-nowrap">
              Assets Library
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search assets..."
                  className="h-9 w-48 sm:w-64 text-sm"
                />
                <Button type="submit" size="sm" variant="default" className="h-9">
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchValue('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 text-slate-500 hover:text-slate-900"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}

            {/* Upload / Login CTA */}
            {currentUser ? (
              <Link href="/upload" className="hidden md:flex">
                <Button size="sm" className="h-9 bg-[#4E86F7] hover:bg-[#3a72e3] text-white gap-1.5">
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </Button>
              </Link>
            ) : (
              <Link href="/login" className="hidden md:flex">
                <Button size="sm" variant="outline" className="h-9">
                  Login
                </Button>
              </Link>
            )}

            {/* User menu */}
            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="hidden md:flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer border-0 bg-transparent"
                  aria-label="User menu"
                >
                  <UserAvatar user={currentUser} />
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-slate-800 max-w-[120px] truncate leading-tight">
                        {currentUser.name}
                      </span>
                      <RoleBadge role={currentUser.role} />
                    </div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled className="text-slate-500 cursor-default">
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="md:hidden inline-flex items-center justify-center rounded-md h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border-0 bg-transparent"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white">
                <SheetHeader className="mb-6">
                  <SheetTitle>
                    <div className="flex items-center gap-2">
                      <Image
                        src="/workiom-icon.png"
                        alt="Workiom"
                        width={28}
                        height={28}
                        className="rounded"
                      />
                      <span className="text-base font-semibold text-slate-900">Assets Library</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile user info */}
                {currentUser && (
                  <div className="flex items-center gap-3 px-1 mb-4 pb-4 border-b border-slate-100">
                    <UserAvatar user={currentUser} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    </div>
                    <RoleBadge role={currentUser.role} />
                  </div>
                )}

                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        pathname === link.href
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      )}
                    >
                      {link.icon && <link.icon className="h-4 w-4" />}
                      {link.label}
                    </Link>
                  ))}
                  {currentUser ? (
                    <>
                      <Link
                        href="/upload"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-blue-600 hover:bg-blue-50"
                      >
                        <Upload className="h-4 w-4" />
                        Upload
                      </Link>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          handleSignOut();
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-red-600 hover:bg-red-50 mt-1"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-slate-600 hover:text-slate-900 hover:bg-slate-100 mt-1"
                    >
                      Login
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
