import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useMovimientoManual } from '../_hooks/useMovimientoManual';

interface MovimientoManualModalProps {
  setIsModalOpen: (open: boolean) => void;
  onSuccess: () => Promise<void>;
}

export function MovimientoManualModal({
  setIsModalOpen,
  onSuccess,
}: MovimientoManualModalProps) {
  const {
    manualMonto,
    setManualMonto,
    manualTipo,
    setManualTipo,
    manualCategoriaId,
    setManualCategoriaId,
    manualDescripcion,
    setManualDescripcion,
    isSavingManual,
    categoriasFiltradas,
    fetchCategoriasMaster,
    handleSaveManual,
  } = useMovimientoManual(async () => {
    await onSuccess();
    setIsModalOpen(false);
  });

  // Cargar categorías maestras al montar el modal
  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (!active) return;
      fetchCategoriasMaster();
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchCategoriasMaster]);

  // Sincronizar categoría por defecto al cambiar el tipo o la lista filtrada
  useEffect(() => {
    let active = true;
    const updateDefault = async () => {
      await Promise.resolve();
      if (!active) return;
      if (categoriasFiltradas.length > 0) {
        const exists = categoriasFiltradas.some((c) => c.id === manualCategoriaId);
        if (!exists) {
          setManualCategoriaId(categoriasFiltradas[0].id);
        }
      } else {
        setManualCategoriaId('');
      }
    };
    updateDefault();
    return () => {
      active = false;
    };
  }, [categoriasFiltradas, manualCategoriaId, setManualCategoriaId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
          <h3 className="font-bold text-slate-900 text-sm">Registrar Movimiento de Caja</h3>
          <button
            onClick={() => setIsModalOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSaveManual} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tipo Movimiento
              </label>
              <select
                value={manualTipo}
                onChange={(e) => setManualTipo(e.target.value as 'INGRESO' | 'EGRESO')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white font-semibold"
              >
                <option value="EGRESO">Egreso</option>
                <option value="INGRESO">Ingreso</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Categoría
              </label>
              <select
                value={manualCategoriaId}
                onChange={(e) => setManualCategoriaId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white font-semibold"
              >
                {categoriasFiltradas.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Monto ($)
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={manualMonto}
              onChange={(e) => setManualMonto(e.target.value)}
              placeholder="Ej: 25000"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Descripción / Detalle
            </label>
            <textarea
              required
              value={manualDescripcion}
              onChange={(e) => setManualDescripcion(e.target.value)}
              placeholder="Ej: Pago de alquiler del local central, compra de insumos de oficina..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSavingManual}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSavingManual && <Loader2 className="h-3 w-3 animate-spin" />}
              Registrar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
