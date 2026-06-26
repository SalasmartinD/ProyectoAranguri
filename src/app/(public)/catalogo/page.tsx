'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useVehiculos } from '@/core/hooks/useVehiculos';
import { Search, SlidersHorizontal, Calendar, Gauge, AlertCircle, Car, Fuel } from 'lucide-react';

const formatTipo = (t: string) => {
  const map: Record<string, string> = {
    SEDAN: 'Sedán',
    SUV: 'SUV',
    PICKUP: 'Pickup',
    HATCHBACK: 'Hatchback',
    COUPE: 'Coupé',
    VAN: 'Van'
  };
  return map[t] || t;
};

const formatCombustible = (c: string) => {
  const map: Record<string, string> = {
    NAFTA: 'Nafta',
    DIESEL: 'Diésel',
    HIBRIDO: 'Híbrido',
    ELECTRICO: 'Eléctrico'
  };
  return map[c] || c;
};

export default function CatalogoPage() {
  const { vehiculos, loading, error, fetchVehiculos } = useVehiculos();
  
  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [minPrecio, setMinPrecio] = useState<number | ''>('');
  const [maxPrecio, setMaxPrecio] = useState<number | ''>('');
  const [minAnio, setMinAnio] = useState<number | ''>('');
  const [maxAnio, setMaxAnio] = useState<number | ''>('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedCombustible, setSelectedCombustible] = useState('');

  useEffect(() => {
    // Buscar solo los vehículos con estado 'Disponible'
    fetchVehiculos(true);
  }, [fetchVehiculos]);

  // Obtener lista única de marcas disponibles para el filtro select
  const marcasDisponibles = useMemo(() => {
    const marcas = vehiculos.map((v) => v.marca);
    return Array.from(new Set(marcas)).sort();
  }, [vehiculos]);

  // Filtrar vehículos en memoria
  const vehiculosFiltrados = useMemo(() => {
    return vehiculos.filter((v) => {
      const matchSearch =
        v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modelo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchMarca = selectedMarca ? v.marca === selectedMarca : true;
      const matchMinPrecio = minPrecio ? v.precio_venta >= minPrecio : true;
      const matchMaxPrecio = maxPrecio ? v.precio_venta <= maxPrecio : true;
      const matchMinAnio = minAnio ? v.anio >= minAnio : true;
      const matchMaxAnio = maxAnio ? v.anio <= maxAnio : true;
      const matchTipo = selectedTipo ? v.tipo === selectedTipo : true;
      const matchCombustible = selectedCombustible ? v.combustible === selectedCombustible : true;

      return matchSearch && matchMarca && matchMinPrecio && matchMaxPrecio && matchMinAnio && matchMaxAnio && matchTipo && matchCombustible;
    });
  }, [vehiculos, searchTerm, selectedMarca, minPrecio, maxPrecio, minAnio, maxAnio, selectedTipo, selectedCombustible]);

  return (
    <div className="space-y-8 py-4">
      {/* Encabezado */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Nuestro Catálogo de Vehículos
        </h1>
        <p className="text-slate-500 text-sm max-w-2xl">
          Explora nuestra selección exclusiva de vehículos listos para transferir. Todos los autos que se muestran aquí están disponibles y listos para entrega inmediata.
        </p>
      </div>

      {/* Panel de Filtros */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <SlidersHorizontal className="h-4.5 w-4.5 text-indigo-600" />
          <h2 className="font-bold text-slate-800 text-sm">Filtros Avanzados</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {/* Búsqueda de texto */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Marca o modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-700 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Filtro Marca */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">Marca</label>
            <select
              value={selectedMarca}
              onChange={(e) => setSelectedMarca(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
            >
              <option value="">Todas las marcas</option>
              {marcasDisponibles.map((marca) => (
                <option key={marca} value={marca}>
                  {marca}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Tipo (Chasis) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">Tipo (Chasis)</label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
            >
              <option value="">Todos los tipos</option>
              <option value="SEDAN">Sedán</option>
              <option value="SUV">SUV</option>
              <option value="PICKUP">Pickup</option>
              <option value="HATCHBACK">Hatchback</option>
              <option value="COUPE">Coupé</option>
              <option value="VAN">Van</option>
            </select>
          </div>

          {/* Filtro Combustible */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">Combustible</label>
            <select
              value={selectedCombustible}
              onChange={(e) => setSelectedCombustible(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white"
            >
              <option value="">Todos los combustibles</option>
              <option value="NAFTA">Nafta</option>
              <option value="DIESEL">Diésel</option>
              <option value="HIBRIDO">Híbrido</option>
              <option value="ELECTRICO">Eléctrico</option>
            </select>
          </div>

          {/* Rango Precio Desde */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">Precio Desde ($)</label>
            <input
              type="number"
              placeholder="Ej: 5000000"
              value={minPrecio}
              onChange={(e) => setMinPrecio(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Filtro Precio Máximo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">Precio Hasta ($)</label>
            <input
              type="number"
              placeholder="Ej: 15000000"
              value={maxPrecio}
              onChange={(e) => setMaxPrecio(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Filtro Año Mínimo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">Año Desde</label>
            <input
              type="number"
              placeholder="Ej: 2010"
              value={minAnio}
              onChange={(e) => setMinAnio(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Filtro Año Máximo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 block">Año Hasta</label>
            <input
              type="number"
              placeholder="Ej: 2015"
              value={maxAnio}
              onChange={(e) => setMaxAnio(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>

      {/* Manejo de estados (Carga, Error, Lista Vacía) */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 h-[380px] space-y-4">
              <div className="bg-slate-200 rounded-xl h-48 w-full" />
              <div className="h-5 bg-slate-200 rounded w-2/3" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-8 bg-slate-200 rounded w-full mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Error en catálogo</span>
            {error}
          </div>
        </div>
      ) : vehiculosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 px-4 text-center">
          <p className="text-slate-400 text-sm mb-2">No se encontraron vehículos disponibles con los filtros seleccionados.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedMarca('');
              setMinPrecio('');
              setMaxPrecio('');
              setMinAnio('');
              setMaxAnio('');
              setSelectedTipo('');
              setSelectedCombustible('');
            }}
            className="text-xs text-indigo-600 font-bold hover:underline"
          >
            Limpiar todos los filtros
          </button>
        </div>
      ) : (
        /* Grid de Vehículos */
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {vehiculosFiltrados.map((v) => (
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
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Precio</span>
                    <span className="text-lg font-black text-slate-900">${v.precio_venta.toLocaleString('es-AR')}</span>
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
      )}
    </div>
  );
}
