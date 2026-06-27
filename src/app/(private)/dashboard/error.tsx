'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Imprime el detalle del error en consola únicamente en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('[Dashboard Error Boundary]:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 mb-6">
          <AlertOctagon className="h-7 w-7" />
        </div>
        
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
          Hubo un problema al cargar el módulo
        </h2>
        
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Ha ocurrido un error inesperado en este componente del Dashboard. Podés intentar recargar esta sección o volver al inicio.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 rounded-xl bg-slate-50 p-3.5 text-left border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Detalle Técnico (Desarrollo)
            </span>
            <code className="text-xs text-red-600 font-mono break-all line-clamp-3">
              {error.message || 'Error desconocido'}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all cursor-pointer"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Reintentar
          </button>
          
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all"
          >
            <Home className="h-3.5 w-3.5 text-slate-400" />
            Panel Principal
          </Link>
        </div>
      </div>
    </div>
  );
}
