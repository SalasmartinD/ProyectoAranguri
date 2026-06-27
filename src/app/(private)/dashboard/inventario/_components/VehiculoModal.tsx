import React from 'react';
import { X, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { VehiculoEstado, TipoVehiculo, TipoCombustible, TipoTransmision } from '@/core/types/vehiculo';

interface VehiculoModalProps {
  setIsFormOpen: (open: boolean) => void;
  editingId: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  formError: string | null;
  marca: string;
  setMarca: (marca: string) => void;
  modelo: string;
  setModelo: (modelo: string) => void;
  anio: number | '';
  setAnio: (anio: number | '') => void;
  kilometros: number | '';
  setKilometros: (kilometros: number | '') => void;
  precioCompra: number | '';
  setPrecioCompra: (val: number | '') => void;
  precioVenta: number | '';
  setPrecioVenta: (val: number | '') => void;
  tipo: TipoVehiculo | '';
  setTipo: (tipo: TipoVehiculo | '') => void;
  combustible: TipoCombustible | '';
  setCombustible: (combustible: TipoCombustible | '') => void;
  transmision: TipoTransmision | '';
  setTransmision: (transmision: TipoTransmision | '') => void;
  motorizacion: string;
  setMotorizacion: (motor: string) => void;
  estado: VehiculoEstado;
  setEstado: (estado: VehiculoEstado) => void;
  descripcion: string;
  setDescripcion: (desc: string) => void;
  isOptimizing: boolean;
  handleOptimizeDescription: () => Promise<void>;
  existingImages: string[];
  setExistingImages: (images: string[]) => void;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  loading: boolean;
  isSubmitting: boolean;
  uploadProgress: string | null;
}

export function VehiculoModal({
  setIsFormOpen,
  editingId,
  handleSubmit,
  formError,
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
  estado,
  setEstado,
  descripcion,
  setDescripcion,
  isOptimizing,
  handleOptimizeDescription,
  existingImages,
  setExistingImages,
  selectedFiles,
  setSelectedFiles,
  loading,
  isSubmitting,
  uploadProgress,
}: VehiculoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Form */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <h3 className="font-bold text-slate-900 text-sm">
            {editingId ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}
          </h3>
          <button
            onClick={() => setIsFormOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-800 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
              <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Error al Guardar</span>
                {formError}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Marca</label>
              <input
                type="text"
                required
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej: Ford"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Modelo</label>
              <input
                type="text"
                required
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ej: Focus"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Año</label>
              <input
                type="number"
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                value={anio}
                onChange={(e) => setAnio(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Kilómetros</label>
              <input
                type="number"
                required
                min="0"
                value={kilometros}
                onChange={(e) => setKilometros(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Precio Compra ($)</label>
              <input
                type="number"
                required
                min="0"
                value={precioCompra}
                onChange={(e) => setPrecioCompra(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Precio Venta ($)</label>
              <input
                type="number"
                required
                min="0"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Tipo de Vehículo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoVehiculo | '')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 bg-white"
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
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 bg-white"
              >
                <option value="">-- Seleccionar --</option>
                <option value="NAFTA">Nafta</option>
                <option value="DIESEL">Diésel</option>
                <option value="HIBRIDO">Híbrido</option>
                <option value="ELECTRICO">Eléctrico</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Transmisión</label>
              <select
                value={transmision}
                onChange={(e) => setTransmision(e.target.value as TipoTransmision | '')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 bg-white"
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
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-semibold text-slate-500">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as VehiculoEstado)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 bg-white"
              >
                <option value="Disponible">Disponible</option>
                <option value="Pausado">Pausado</option>
                <option value="Vendido">Vendido</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-500 font-sans">
                Descripción del Vehículo (Opcional)
              </label>
              <button
                type="button"
                disabled={!marca.trim() || !modelo.trim() || !anio || isOptimizing}
                onClick={handleOptimizeDescription}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all select-none cursor-pointer ${
                  isOptimizing
                    ? 'bg-indigo-50 text-indigo-500 animate-pulse'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100/70 active:scale-97'
                } disabled:opacity-50`}
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Optimizando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3" />
                    Reformular con IA
                  </>
                )}
              </button>
            </div>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: tapizado de cuero impecable, services oficiales al día, algunos rayones leves en paragolpes trasero, único dueño..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 bg-white"
            />
          </div>

          <div className="space-y-1">
            <ImageUploader
              existingImages={existingImages}
              onExistingImagesChange={setExistingImages}
              selectedFiles={selectedFiles}
              onSelectedFilesChange={setSelectedFiles}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {(loading || isSubmitting) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {uploadProgress
                ? uploadProgress
                : isSubmitting
                ? 'Guardando...'
                : editingId
                ? 'Actualizar Cambios'
                : 'Registrar Vehículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
