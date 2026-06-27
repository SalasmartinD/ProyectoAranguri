'use client';

import React from 'react';
import { 
  Database, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  FileText, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';
import Link from 'next/link';
import { useDashboardStats } from '@/core/hooks/useDashboardStats';
import { formatCurrency } from '@/core/utils/finance';

export default function DashboardPage() {
  const { stats, recentTransacciones, loading, error, fetchDashboardData } = useDashboardStats();

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (!active) return;
      fetchDashboardData();
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Error en Dashboard</span>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Panel de Control General</h1>
        <p className="text-slate-500 text-sm">Resumen mensual y estado del inventario de la concesionaria.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Stock Disponible</span>
            <span className="text-3xl font-extrabold text-slate-900">{stats.autosDisponibles}</span>
            <span className="text-[10px] text-slate-500 block">Total en catálogo activo</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Database className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ventas Concretadas (Mes)</span>
            <span className="text-3xl font-extrabold text-slate-900">{stats.ventasMes}</span>
            <span className="text-[10px] text-slate-500 block">Monto total: {formatCurrency(stats.montoVentasMes)}</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ganancia Neta (Mes)</span>
            <span className="text-3xl font-extrabold text-emerald-600">{formatCurrency(stats.gananciaMes)}</span>
            <span className="text-[10px] text-slate-500 block">Calculado sobre costo de compra</span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Operaciones Recientes</h3>
          </div>
          <Link
            href="/dashboard/operaciones"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
          >
            Ver todas las operaciones
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentTransacciones.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No se han registrado operaciones en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Vehículo</th>
                  <th className="px-6 py-4">Operador</th>
                  <th className="px-6 py-4">Monto</th>
                  <th className="px-6 py-4 text-right">Ganancia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransacciones.map((tx) => {
                  const veh = Array.isArray(tx.vehiculo) ? tx.vehiculo[0] : tx.vehiculo;
                  const emp = Array.isArray(tx.empleado) ? tx.empleado[0] : tx.empleado;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(tx.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-0.5 font-bold ${
                            tx.tipo === 'Compra'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}
                        >
                          {tx.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                        {veh ? `${veh.marca} ${veh.modelo}` : 'Vehículo Eliminado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {emp?.nombre || 'Desconocido'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900">
                        {formatCurrency(tx.monto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-emerald-600">
                        {tx.tipo === 'Venta' ? formatCurrency(tx.ganancia_neta) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
