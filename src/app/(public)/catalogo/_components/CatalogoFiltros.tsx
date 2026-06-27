import React, { useState } from 'react';
import { SlidersHorizontal, Search } from 'lucide-react';

interface CatalogoFiltrosProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedMarca: string;
  setSelectedMarca: (marca: string) => void;
  marcasDisponibles: string[];
  selectedTipo: string;
  setSelectedTipo: (tipo: string) => void;
  selectedCombustible: string;
  setSelectedCombustible: (combustible: string) => void;
  minPrecio: number | '';
  setMinPrecio: (val: number | '') => void;
  maxPrecio: number | '';
  setMaxPrecio: (val: number | '') => void;
  minAnio: number | '';
  setMinAnio: (val: number | '') => void;
  maxAnio: number | '';
  setMaxAnio: (val: number | '') => void;
}

export function CatalogoFiltros({
  searchTerm,
  setSearchTerm,
  selectedMarca,
  setSelectedMarca,
  marcasDisponibles,
  selectedTipo,
  setSelectedTipo,
  selectedCombustible,
  setSelectedCombustible,
  minPrecio,
  setMinPrecio,
  maxPrecio,
  setMaxPrecio,
  minAnio,
  setMinAnio,
  maxAnio,
  setMaxAnio,
}: CatalogoFiltrosProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between border-b border-slate-100 pb-3 cursor-pointer md:cursor-default select-none"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4.5 w-4.5 text-indigo-600" />
          <h2 className="font-bold text-slate-800 text-sm">Filtros de Búsqueda</h2>
        </div>
        <span className="text-xs text-indigo-600 font-bold md:hidden">
          {isOpen ? 'Ocultar filtros ↑' : 'Filtrar catálogo ↓'}
        </span>
      </div>

      <div className={`grid gap-4 sm:grid-cols-2 md:grid-cols-4 transition-all duration-300 ${
        isOpen ? 'block' : 'hidden md:grid'
      }`}>
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

        {/* Marca select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 block">Marca</label>
          <select
            value={selectedMarca}
            onChange={(e) => setSelectedMarca(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 bg-white font-medium"
          >
            <option value="">Todas las marcas</option>
            {marcasDisponibles.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de carrocería */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 block">Tipo</label>
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 bg-white font-medium"
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

        {/* Combustible */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 block">Combustible</label>
          <select
            value={selectedCombustible}
            onChange={(e) => setSelectedCombustible(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 bg-white font-medium"
          >
            <option value="">Todos los combustibles</option>
            <option value="NAFTA">Nafta</option>
            <option value="DIESEL">Diésel</option>
            <option value="HIBRIDO">Híbrido</option>
            <option value="ELECTRICO">Eléctrico</option>
          </select>
        </div>
      </div>

      {/* Rangos de Precio y Año */}
      <div className={`grid gap-4 sm:grid-cols-2 md:grid-cols-4 pt-2 border-t border-slate-100 transition-all duration-300 ${
        isOpen ? 'block' : 'hidden md:grid'
      }`}>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 block">Precio Mínimo ($)</label>
          <input
            type="number"
            placeholder="Ej: 5000000"
            value={minPrecio}
            onChange={(e) => setMinPrecio(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 block">Precio Máximo ($)</label>
          <input
            type="number"
            placeholder="Ej: 20000000"
            value={maxPrecio}
            onChange={(e) => setMaxPrecio(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 block">Año Mínimo</label>
          <input
            type="number"
            placeholder="Ej: 2010"
            value={minAnio}
            onChange={(e) => setMinAnio(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 block">Año Máximo</label>
          <input
            type="number"
            placeholder="Ej: 2024"
            value={maxAnio}
            onChange={(e) => setMaxAnio(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
}
