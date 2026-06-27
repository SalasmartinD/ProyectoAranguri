import React from 'react';
import { DollarSign } from 'lucide-react';
import { Vehiculo } from '@/core/types/vehiculo';

interface Empleado {
  id: string;
  nombre: string;
  roles?: {
    nombre: string;
  };
}

interface OperacionesFormProps {
  selectedEmpleadoId: string;
  setSelectedEmpleadoId: (id: string) => void;
  empleadosActivos: Empleado[];
  txLoading: boolean;

  // Venta Form
  selectedVehiculoId: string;
  setSelectedVehiculoId: (id: string) => void;
  vehiculosDisponibles: Vehiculo[];
  montoVenta: number | '';
  setMontoVenta: (val: number | '') => void;
  handleVentaSubmit: (e: React.FormEvent) => Promise<void>;
}

export function OperacionesForm({
  selectedEmpleadoId,
  setSelectedEmpleadoId,
  empleadosActivos,
  txLoading,

  // Venta
  selectedVehiculoId,
  setSelectedVehiculoId,
  vehiculosDisponibles,
  montoVenta,
  setMontoVenta,
  handleVentaSubmit,
}: OperacionesFormProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-200">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xs font-bold text-slate-700">Registrar Venta de Vehículo</h3>
      </div>

      <div className="p-6">
        <form onSubmit={handleVentaSubmit} className="space-y-4">
          {/* Vehículo a vender */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Seleccionar Vehículo (Solo Disponible)</label>
            <select
              required
              value={selectedVehiculoId}
              onChange={(e) => {
                setSelectedVehiculoId(e.target.value);
                const veh = vehiculosDisponibles.find((v) => v.id === e.target.value);
                if (veh) setMontoVenta(veh.precio_venta);
              }}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
            >
              <option value="">-- Seleccionar de Stock --</option>
              {vehiculosDisponibles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.marca} {v.modelo} ({v.anio}) - Sugerido: ${v.precio_venta.toLocaleString('es-AR')}
                </option>
              ))}
            </select>
          </div>

          {/* Vendedor */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Vendedor Responsable</label>
            <select
              required
              value={selectedEmpleadoId}
              onChange={(e) => setSelectedEmpleadoId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
            >
              <option value="">-- Seleccionar Vendedor --</option>
              {empleadosActivos.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} ({emp.roles?.nombre || 'Sin Rol'})
                </option>
              ))}
            </select>
          </div>

          {/* Monto Venta */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Monto Final Venta ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="number"
                required
                min="1"
                value={montoVenta}
                onChange={(e) => setMontoVenta(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={txLoading}
            className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {txLoading ? 'Procesando...' : 'Confirmar Venta'}
          </button>
        </form>
      </div>
    </div>
  );
}

