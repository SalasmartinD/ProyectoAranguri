'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/core/services/supabase';
import { Lock, Mail, Car, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Redireccionar si ya tiene una sesión activa
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/dashboard');
      }
    }
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Reventar el Router Cache de Next.js para que el Middleware y los Server Components
      // detecten el nuevo estado de la sesión de inmediato en el próximo salto.
      router.refresh();

      // Esperar un delay de sincronización determinista de 150ms para asegurar
      // que el navegador termine de escribir la cookie en disco antes de navegar.
      await new Promise((resolve) => setTimeout(resolve, 150));

      router.replace('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas o error de conexión.');
      setLoading(false); // Solo desactivo el cargando si ocurre un error
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 font-sans sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
            <Car className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
            Acceso Personal Staff
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Ingresa tus credenciales para gestionar inventarios y operaciones
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-2.5 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Fallo de Autenticación</span>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-500">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@concesionaria.com"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-500">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 disabled:active:scale-100 focus:outline-none"
            >
              {loading ? 'Iniciando sesión...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
