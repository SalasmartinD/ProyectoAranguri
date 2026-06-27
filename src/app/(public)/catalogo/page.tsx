'use client';

import React from 'react';
import { useCatalogo } from './_hooks/useCatalogo';
import { CatalogoFiltros } from './_components/CatalogoFiltros';
import { CatalogoGrid } from './_components/CatalogoGrid';

export default function CatalogoPage() {
  const {
    vehiculos,
    loading,
    error,
    marcasDisponibles,
    
    // Filtros
    searchTerm,
    setSearchTerm,
    selectedMarca,
    setSelectedMarca,
    minPrecio,
    setMinPrecio,
    maxPrecio,
    setMaxPrecio,
    minAnio,
    setMinAnio,
    maxAnio,
    setMaxAnio,
    selectedTipo,
    setSelectedTipo,
    selectedCombustible,
    setSelectedCombustible,
    
    handleClearFilters,
  } = useCatalogo();

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
      <CatalogoFiltros
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedMarca={selectedMarca}
        setSelectedMarca={setSelectedMarca}
        marcasDisponibles={marcasDisponibles}
        selectedTipo={selectedTipo}
        setSelectedTipo={setSelectedTipo}
        selectedCombustible={selectedCombustible}
        setSelectedCombustible={setSelectedCombustible}
        minPrecio={minPrecio}
        setMinPrecio={setMinPrecio}
        maxPrecio={maxPrecio}
        setMaxPrecio={setMaxPrecio}
        minAnio={minAnio}
        setMinAnio={setMinAnio}
        maxAnio={maxAnio}
        setMaxAnio={setMaxAnio}
      />

      {/* Grid de Vehículos */}
      <CatalogoGrid
        vehiculos={vehiculos}
        loading={loading}
        error={error}
        handleClearFilters={handleClearFilters}
      />
    </div>
  );
}
