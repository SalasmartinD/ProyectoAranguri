'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Inicio' },
    { href: '/catalogo', label: 'Catálogo' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
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

          {/* Navegación Principal (Escritorio) */}
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
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-98"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Panel Admin</span>
            </Link>

            {/* Hamburguesa para móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none md:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop del Menú Móvil */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer del Menú Móvil */}
      <nav
        className={`fixed bottom-0 top-0 right-0 z-50 w-64 bg-white p-6 flex flex-col gap-4 transition-transform duration-300 ease-in-out shadow-xl border-l border-slate-100 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: '#ffffff', opacity: 1 }}
      >
        <div>
          {/* Header del menú */}
          <div className="flex h-12 items-center justify-between border-b border-slate-100 pb-3 mb-6">
            <span className="font-bold text-sm text-slate-800">Menú de Navegación</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Links de navegación */}
          <div className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.href)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Botón Panel Admin alineado en la lista */}
            <div className="border-t border-slate-100 pt-4 mt-4">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-600/10 hover:bg-indigo-700 transition-all"
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                Acceder al Panel Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
