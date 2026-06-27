import React from 'react';
import Image from 'next/image';
import { Search, Loader2, Edit, Trash2 } from 'lucide-react';
import { Vehiculo } from '@/core/types/vehiculo';
import { formatCurrency } from '@/core/utils/finance';

interface InventarioTableProps {
  vehiculos: Vehiculo[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleOpenEdit: (v: Vehiculo) => void;
  handleDelete: (id: string) => void;
}

export function InventarioTable({
  vehiculos,
  loading,
  searchTerm,
  setSearchTerm,
  handleOpenEdit,
  handleDelete,
}: InventarioTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-w-0">
      <div className="p-5 border-b border-slate-100 flex items-center">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por marca o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {loading && vehiculos.length === 0 ? (
        <div className="py-20 flex items-center justify-center text-slate-400 text-xs gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span>Cargando inventario...</span>
        </div>
      ) : vehiculos.length === 0 ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          No se encontraron vehículos en el inventario.
        </div>
      ) : (
        <div className="overflow-x-auto font-sans">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Vehículo</th>
                <th className="px-6 py-4">Año / KM</th>
                <th className="px-6 py-4">Precio Compra</th>
                <th className="px-6 py-4">Precio Venta</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehiculos.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                        {v.imagenes && v.imagenes.length > 0 ? (
                          <Image src={v.imagenes[0]} alt={`${v.marca} ${v.modelo}`} fill className="object-cover" />
                        ) : (
                          <div className="h-full w-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-400 font-bold">
                            SIN FOTO
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 block leading-tight">{v.marca}</span>
                        <span className="text-slate-500 text-[10px]">{v.modelo}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="block text-slate-800 font-semibold">{v.anio}</span>
                    <span className="text-slate-400 text-[10px]">{v.kilometros.toLocaleString('es-AR')} km</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                    {formatCurrency(v.precio_compra)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-extrabold text-indigo-700">
                    {formatCurrency(v.precio_venta)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-0.5 font-bold ${
                        v.estado === 'Disponible'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : v.estado === 'Vendido'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {v.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2.5">
                    <button
                      onClick={() => handleOpenEdit(v)}
                      className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 font-semibold"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-slate-600 hover:text-red-600 transition-colors inline-flex items-center gap-1 font-semibold"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
