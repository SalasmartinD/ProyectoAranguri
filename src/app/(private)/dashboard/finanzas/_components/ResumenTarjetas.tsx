import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { formatCurrency } from '@/core/utils/finance';

interface MetricasCaja {
  totalIngresos: number;
  ingresosVentas: number;
  ingresosOtros: number;
  totalEgresos: number;
  egresosCompras: number;
  egresosOtros: number;
  balance: number;
}

interface ResumenTarjetasProps {
  metricasCaja: MetricasCaja;
}

export function ResumenTarjetas({ metricasCaja }: ResumenTarjetasProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {/* Tarjeta de Ingresos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ingresos del Mes</span>
          <span className="text-2xl font-black text-slate-900">
            {formatCurrency(metricasCaja.totalIngresos)}
          </span>
          <div className="text-[10px] text-slate-400">
            Ventas: {formatCurrency(metricasCaja.ingresosVentas)} | Otros: {formatCurrency(metricasCaja.ingresosOtros)}
          </div>
        </div>
        <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>

      {/* Tarjeta de Egresos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Egresos del Mes</span>
          <span className="text-2xl font-black text-slate-900">
            {formatCurrency(metricasCaja.totalEgresos)}
          </span>
          <div className="text-[10px] text-slate-400 font-sans">
            Compras: {formatCurrency(metricasCaja.egresosCompras)} | Gastos: {formatCurrency(metricasCaja.egresosOtros)}
          </div>
        </div>
        <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
          <TrendingDown className="h-5 w-5" />
        </div>
      </div>

      {/* Tarjeta de Balance Neto */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Balance Neto</span>
          <span className={`text-2xl font-black ${metricasCaja.balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            {formatCurrency(metricasCaja.balance)}
          </span>
          <div className="text-[10px] text-slate-400">Ingresos vs Egresos del período</div>
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${metricasCaja.balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
          <Activity className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
