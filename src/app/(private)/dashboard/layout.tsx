'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/core/services/supabase';
import { 
  Car, 
  LayoutDashboard, 
  Database, 
  DollarSign, 
  Users, 
  LogOut, 
  Home, 
  Menu, 
  X,
  User,
  CreditCard,
  Settings
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
        setUserEmail(data.session.user.email || 'Staff');
      }
      setCheckingAuth(false);
    }
    
    checkAuth();

    // Suscribirse a cambios en el estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || 'Staff');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
    { href: '/dashboard/inventario', label: 'Inventario (Stock)', icon: Database },
    { href: '/dashboard/operaciones', label: 'Operaciones', icon: DollarSign },
    { href: '/dashboard/empleados', label: 'Equipo / KPIs', icon: Users },
    { href: '/dashboard/finanzas', label: 'Finanzas y Caja', icon: CreditCard },
    { href: '/dashboard/configuracion', label: 'Ajustes', icon: Settings },
  ];

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar de Escritorio */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900 text-white border-r border-slate-800">
        <div className="flex h-16 items-center px-6 border-b border-slate-800 gap-2">
          <Car className="h-6 w-6 text-indigo-400" />
          <span className="font-bold text-base tracking-tight">Panel Administrativo</span>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive(item.href)
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive(item.href) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sección de Usuario en el Sidebar */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400">
            <User className="h-4 w-4 shrink-0 text-indigo-400" />
            <span className="truncate">{userEmail}</span>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              Volver a la Web Pública
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Header móvil */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden shadow-sm">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-sm text-slate-800">Salas Admin</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Backdrop del Drawer móvil */}
        <div 
          className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer móvil (Deslizamiento) */}
        <nav
          className={`fixed bottom-0 top-0 left-0 z-40 w-64 bg-slate-900 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:hidden ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ backgroundColor: '#0f172a', opacity: 1 }}
        >
          <div>
            {/* Header Drawer */}
            <div className="flex h-16 items-center justify-between border-b border-slate-800 mb-6 -mt-2">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-indigo-400" />
                <span className="font-bold text-sm text-white">Salas Admin</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items del Drawer */}
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive(item.href)
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 px-3">
              <User className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
              <span className="truncate">{userEmail}</span>
            </div>
            <div className="space-y-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Home className="h-4 w-4" />
                Volver a la Web
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </nav>

        {/* Área del Dashboard */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
