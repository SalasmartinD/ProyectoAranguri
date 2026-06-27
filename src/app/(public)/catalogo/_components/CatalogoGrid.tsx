import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, Calendar, Gauge, Car, Fuel } from 'lucide-react';
import { Vehiculo } from '@/core/types/vehiculo';
import { formatCurrency } from '@/core/utils/finance';

interface CatalogoGridProps {
  vehiculos: Vehiculo[];
  loading: boolean;
  error: string | null;
  handleClearFilters: () => void;
}

const formatTipo = (t: string) => {
  const map: Record<string, string> = {
    SEDAN: 'Sedán',
    SUV: 'SUV',
    PICKUP: 'Pickup',
    HATCHBACK: 'Hatchback',
    COUPE: 'Coupé',
    VAN: 'Van',
  };
  return map[t] || t;
};

const formatCombustible = (c: string) => {
  const map: Record<string, string> = {
    NAFTA: 'Nafta',
    DIESEL: 'Diésel',
    HIBRIDO: 'Híbrido',
    ELECTRICO: 'Eléctrico',
  };
  return map[c] || c;
};

export function CatalogoGrid({ vehiculos, loading, error, handleClearFilters }: CatalogoGridProps) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 h-[380px] space-y-4"
          >
            <div className="bg-slate-200 rounded-xl h-48 w-full" />
            <div className="h-5 bg-slate-200 rounded w-2/3" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-8 bg-slate-200 rounded w-full mt-4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Error en catálogo</span>
          {error}
        </div>
      </div>
    );
  }

  if (vehiculos.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center">
        <p className="text-slate-400 text-sm mb-2">
          No se encontraron vehículos disponibles con los filtros seleccionados.
        </p>
        <button
          onClick={handleClearFilters}
          className="text-xs text-indigo-600 font-bold hover:underline"
        >
          Limpiar todos los filtros
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {vehiculos.map((v) => (
        <div
          key={v.id}
          className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          {/* Imagen del vehículo */}
          <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
            {v.imagenes && v.imagenes.length > 0 ? (
              <Image
                src={v.imagenes[0]}
                alt={`${v.marca} ${v.modelo}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs font-semibold bg-gradient-to-br from-slate-50 to-slate-100">
                Sin foto disponible
              </div>
            )}
          </div>

          {/* Información del vehículo */}
          <div className="flex flex-1 flex-col p-5">
            <div className="mb-2">
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                {v.estado}
              </span>
            </div>

            <h3 className="font-bold text-slate-800 text-base mb-1 leading-snug">
              {v.marca} {v.modelo}
            </h3>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-slate-500 text-xs mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{v.anio}</span>
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5 text-slate-400" />
                <span>{v.kilometros.toLocaleString('es-AR')} km</span>
              </div>
              {v.tipo && (
                <div className="flex items-center gap-1">
                  <Car className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatTipo(v.tipo)}</span>
                </div>
              )}
              {v.combustible && (
                <div className="flex items-center gap-1">
                  <Fuel className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatCombustible(v.combustible)}</span>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Precio
                </span>
                <span className="text-lg font-black text-slate-900">
                  {formatCurrency(v.precio_venta)}
                </span>
              </div>

              <Link
                href={`/catalogo/${v.id}`}
                className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                Detalles
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
