import React from 'react';
import { FileText } from 'lucide-react';
import { formatCurrency } from '@/core/utils/finance';
import { MovimientoCaja } from '../_hooks/useFinanzas';

interface LibroDiarioTableProps {
  movimientos: MovimientoCaja[];
  loadingFinanzas: boolean;
}

export function LibroDiarioTable({ movimientos, loadingFinanzas }: LibroDiarioTableProps) {
  return (
    <div className="lg:col-span-1 space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-900">Libro Diario (Caja)</h2>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loadingFinanzas ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            Cargando libro diario...
          </div>
        ) : movimientos.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            No se registran movimientos en el período.
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-150 scrollbar-thin">
            {movimientos.map((m) => (
              <div key={m.id} className="p-4 hover:bg-slate-50/50 flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400 text-[10px]">
                    {new Date(m.fecha).toLocaleDateString('es-AR')}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-extrabold border ${
                      m.tipo_movimiento === 'INGRESO'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}
                  >
                    {m.tipo_movimiento}
                  </span>
                </div>

                <div className="font-bold text-slate-800">
                  {(m.categorias_caja?.nombre || 'Otros').replace(/_/g, ' ')}
                </div>
                <div className="text-[10px] text-slate-500 leading-snug">{m.descripcion}</div>

                <div className="text-right font-black text-slate-900 mt-0.5">
                  {m.tipo_movimiento === 'INGRESO' ? '+' : '-'}
                  {formatCurrency(m.monto)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
