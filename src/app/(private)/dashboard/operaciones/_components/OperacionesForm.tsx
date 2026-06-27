import React from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { Vehiculo, TipoVehiculo, TipoCombustible, TipoTransmision } from '@/core/types/vehiculo';

interface Empleado {
  id: string;
  nombre: string;
  roles?: {
    nombre: string;
  };
}

interface OperacionesFormProps {
  activeTab: 'venta' | 'compra';
  setActiveTab: (tab: 'venta' | 'compra') => void;
  selectedEmpleadoId: string;
  setSelectedEmpleadoId: (id: string) => void;
  empleados: Empleado[];
  txLoading: boolean;

  // Venta Form
  selectedVehiculoId: string;
  setSelectedVehiculoId: (id: string) => void;
  vehiculosDisponibles: Vehiculo[];
  montoVenta: number | '';
  setMontoVenta: (val: number | '') => void;
  handleVentaSubmit: (e: React.FormEvent) => Promise<void>;

  // Compra Form
  marca: string;
  setMarca: (val: string) => void;
  modelo: string;
  setModelo: (val: string) => void;
  anio: number | '';
  setAnio: (val: number | '') => void;
  kilometros: number | '';
  setKilometros: (val: number | '') => void;
  precioCompra: number | '';
  setPrecioCompra: (val: number | '') => void;
  precioVenta: number | '';
  setPrecioVenta: (val: number | '') => void;
  tipo: TipoVehiculo | '';
  setTipo: (val: TipoVehiculo | '') => void;
  combustible: TipoCombustible | '';
  setCombustible: (val: TipoCombustible | '') => void;
  transmision: TipoTransmision | '';
  setTransmision: (val: TipoTransmision | '') => void;
  motorizacion: string;
  setMotorizacion: (val: string) => void;
  existingImages: string[];
  setExistingImages: (images: string[]) => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  uploadProgress: string | null;
  isSubmitting: boolean;
  handleCompraSubmit: (e: React.FormEvent) => Promise<void>;
}

export function OperacionesForm({
  activeTab,
  setActiveTab,
  selectedEmpleadoId,
  setSelectedEmpleadoId,
  empleados,
  txLoading,

  // Venta
  selectedVehiculoId,
  setSelectedVehiculoId,
  vehiculosDisponibles,
  montoVenta,
  setMontoVenta,
  handleVentaSubmit,

  // Compra
  marca,
  setMarca,
  modelo,
  setModelo,
  anio,
  setAnio,
  kilometros,
  setKilometros,
  precioCompra,
  setPrecioCompra,
  precioVenta,
  setPrecioVenta,
  tipo,
  setTipo,
  combustible,
  setCombustible,
  transmision,
  setTransmision,
  motorizacion,
  setMotorizacion,
  existingImages,
  setExistingImages,
  selectedFiles,
  setSelectedFiles,
  uploadProgress,
  isSubmitting,
  handleCompraSubmit,
}: OperacionesFormProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-200">
      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50">
        <button
          onClick={() => setActiveTab('venta')}
          className={`flex-1 py-3.5 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === 'venta'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Registrar Venta
        </button>
        <button
          onClick={() => setActiveTab('compra')}
          className={`flex-1 py-3.5 text-xs font-bold text-center border-b-2 transition-all ${
            activeTab === 'compra'
              ? 'border-indigo-600 text-indigo-600 bg-white'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Registrar Compra
        </button>
      </div>

      <div className="p-6">
        {/* Formulario Venta */}
        {activeTab === 'venta' && (
          <form onSubmit={handleVentaSubmit} className="space-y-4">
            {/* Vehículo a vender */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Seleccionar Vehículo</label>
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
              <label className="text-xs font-semibold text-slate-500">Empleado Responsable</label>
              <select
                required
                value={selectedEmpleadoId}
                onChange={(e) => setSelectedEmpleadoId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
              >
                <option value="">-- Seleccionar Empleado --</option>
                {empleados.map((emp) => (
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
              className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all cursor-pointer"
            >
              Confirmar Venta
            </button>
          </form>
        )}

        {/* Formulario Compra */}
        {activeTab === 'compra' && (
          <form onSubmit={handleCompraSubmit} className="space-y-4">
            {/* Empleado receptor */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Empleado Responsable</label>
              <select
                required
                value={selectedEmpleadoId}
                onChange={(e) => setSelectedEmpleadoId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
              >
                <option value="">-- Seleccionar Empleado --</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre} ({emp.roles?.nombre || 'Sin Rol'})
                  </option>
                ))}
              </select>
            </div>

            {/* Specs del auto */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Marca</label>
                <input
                  type="text"
                  required
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Ford"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Modelo</label>
                <input
                  type="text"
                  required
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Focus"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Año</label>
                <input
                  type="number"
                  required
                  value={anio}
                  onChange={(e) => setAnio(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Kilómetros</label>
                <input
                  type="number"
                  required
                  value={kilometros}
                  onChange={(e) => setKilometros(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Tipo de Vehículo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoVehiculo | '')}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="SEDAN">Sedán</option>
                  <option value="SUV">SUV</option>
                  <option value="PICKUP">Pickup</option>
                  <option value="HATCHBACK">Hatchback</option>
                  <option value="COUPE">Coupé</option>
                  <option value="VAN">Van</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Combustible</label>
                <select
                  value={combustible}
                  onChange={(e) => setCombustible(e.target.value as TipoCombustible | '')}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="NAFTA">Nafta</option>
                  <option value="DIESEL">Diésel</option>
                  <option value="HIBRIDO">Híbrido</option>
                  <option value="ELECTRICO">Eléctrico</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Transmisión</label>
                <select
                  value={transmision}
                  onChange={(e) => setTransmision(e.target.value as TipoTransmision | '')}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="">-- Seleccionar --</option>
                  <option value="MANUAL">Manual</option>
                  <option value="AUTOMATICA">Automática</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Motorización</label>
                <input
                  type="text"
                  value={motorizacion}
                  onChange={(e) => setMotorizacion(e.target.value)}
                  placeholder="Ej: 1.4 TSI, 2.0 TDI"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Costo Compra ($)</label>
                <input
                  type="number"
                  required
                  value={precioCompra}
                  onChange={(e) => setPrecioCompra(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Precio Venta ($)</label>
                <input
                  type="number"
                  required
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <ImageUploader
                existingImages={existingImages}
                onExistingImagesChange={setExistingImages}
                selectedFiles={selectedFiles}
                onSelectedFilesChange={setSelectedFiles}
              />
            </div>

            <button
              type="submit"
              disabled={txLoading || isSubmitting}
              className="flex w-full justify-center items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              {(txLoading || isSubmitting) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {uploadProgress
                ? uploadProgress
                : isSubmitting
                ? 'Guardando...'
                : 'Registrar Ingreso y Pago'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
