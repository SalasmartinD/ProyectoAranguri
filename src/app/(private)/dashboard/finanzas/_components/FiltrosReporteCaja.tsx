import React, { useState } from 'react';
import { supabase } from '@/core/services/supabase';
import { exportarMovimientosAExcel } from '@/core/utils/excel';
import { Download, Calendar, Filter, Loader2, AlertCircle } from 'lucide-react';

export function FiltrosReporteCaja() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tipo, setTipo] = useState<'TODOS' | 'INGRESO' | 'EGRESO'>('TODOS');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExportar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      let query = supabase
        .from('movimientos_caja')
        .select('*, categorias_caja(nombre)');

      if (desde) {
        const startISO = new Date(`${desde}T00:00:00`).toISOString();
        query = query.gte('fecha', startISO);
      }

      if (hasta) {
        const endISO = new Date(`${hasta}T23:59:59.999`).toISOString();
        query = query.lte('fecha', endISO);
      }

      if (tipo !== 'TODOS') {
        query = query.eq('tipo_movimiento', tipo);
      }

      const { data, error } = await query.order('fecha', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setErrorMsg('No se encontraron movimientos que coincidan con los filtros seleccionados.');
        return;
      }

      exportarMovimientosAExcel(data);
    } catch (err: unknown) {
      console.error('Error al exportar reporte:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Error al obtener datos para el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4.5 w-4.5 text-indigo-600" />
        <h3 className="font-extrabold text-sm text-slate-900">Exportar Reporte de Caja</h3>
      </div>

      <form onSubmit={handleExportar} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-500 block">Fecha Mínima (Desde)</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-500 block">Fecha Máxima (Hasta)</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-500 block">Tipo de Movimiento</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as 'TODOS' | 'INGRESO' | 'EGRESO')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold focus:bg-white focus:border-indigo-500 outline-none"
          >
            <option value="TODOS">Todos</option>
            <option value="INGRESO">Ingresos</option>
            <option value="EGRESO">Egresos</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all shrink-0 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Generar Informe
            </>
          )}
        </button>
      </form>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800 flex items-center gap-2 text-xs">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
