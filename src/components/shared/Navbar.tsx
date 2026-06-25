'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/catalogo', label: 'Catálogo' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md transition-transform group-hover:scale-105">
            <Car className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">
            Automotores<span className="text-indigo-600">Salas</span>
          </span>
        </Link>

        {/* Navegación Principal */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
                isActive(link.href) ? 'text-indigo-600 font-semibold' : 'text-slate-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-98"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Panel Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
