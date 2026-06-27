import React from 'react';
import { FileText, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/core/utils/finance';

interface Transaccion {
  id: string;
  fecha: string;
  tipo: 'Compra' | 'Venta';
  monto: number;
  ganancia_neta?: number | null;
  vehiculo?: {
    marca: string;
    modelo: string;
    anio: number;
  } | null;
  empleado?: {
    nombre: string;
  } | null;
}

interface TransaccionesTableProps {
  transacciones: Transaccion[];
  txLoading: boolean;
}

export function TransaccionesTable({ transacciones, txLoading }: TransaccionesTableProps) {
  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-900">Historial Completo de Operaciones</h2>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {txLoading && transacciones.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            Cargando historial de transacciones...
          </div>
        ) : transacciones.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            No se han registrado operaciones en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto text-xs text-slate-700 font-sans">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Vehículo</th>
                  <th className="px-6 py-4">Responsable</th>
                  <th className="px-6 py-4">Monto</th>
                  <th className="px-6 py-4 text-right">Ganancia Neta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transacciones.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {new Date(tx.fecha).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 font-bold ${
                          tx.tipo === 'Compra'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}
                      >
                        {tx.tipo === 'Compra' ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-blue-500" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                        {tx.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-extrabold text-slate-900">
                        {tx.vehiculo ? `${tx.vehiculo.marca} ${tx.vehiculo.modelo}` : 'Vehículo Eliminado'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {tx.vehiculo ? `Año ${tx.vehiculo.anio}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.empleado?.nombre || 'Desconocido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900">
                      {formatCurrency(tx.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-extrabold text-emerald-600">
                      {tx.tipo === 'Venta' && tx.ganancia_neta !== null && tx.ganancia_neta !== undefined ? formatCurrency(tx.ganancia_neta) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
