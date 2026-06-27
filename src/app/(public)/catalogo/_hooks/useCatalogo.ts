import { useState, useEffect, useMemo, useCallback } from 'react';
import { useVehiculos } from '@/core/hooks/useVehiculos';

export function useCatalogo() {
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

  // Buscar solo los vehículos con estado 'Disponible' al montar o cuando cambie fetchVehiculos
  useEffect(() => {
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

      return (
        matchSearch &&
        matchMarca &&
        matchMinPrecio &&
        matchMaxPrecio &&
        matchMinAnio &&
        matchMaxAnio &&
        matchTipo &&
        matchCombustible
      );
    });
  }, [
    vehiculos,
    searchTerm,
    selectedMarca,
    minPrecio,
    maxPrecio,
    minAnio,
    maxAnio,
    selectedTipo,
    selectedCombustible,
  ]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedMarca('');
    setMinPrecio('');
    setMaxPrecio('');
    setMinAnio('');
    setMaxAnio('');
    setSelectedTipo('');
    setSelectedCombustible('');
  }, []);

  return {
    vehiculos: vehiculosFiltrados,
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
  };
}
