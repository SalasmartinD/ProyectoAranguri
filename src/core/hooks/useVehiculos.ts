import { useState, useCallback } from 'react';
import { supabase } from '@/core/services/supabase';
import { Vehiculo, VehiculoInput } from '../types/vehiculo';

export function useVehiculos() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehiculos = useCallback(async (onlyDisponible: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('vehiculos').select('*');
      
      if (onlyDisponible) {
        query = query.eq('estado', 'Disponible');
      }
      
      // Ordenar por más nuevos creados primero
      query = query.order('creado_en', { ascending: false });

      const { data, error: dbError } = await query;

      if (dbError) throw dbError;
      setVehiculos(data || []);
    } catch (err: any) {
      console.error('Error fetching vehiculos:', err);
      setError(err?.message || 'Error al obtener los vehículos.');
    } finally {
      setLoading(false);
    }
  }, []);

  const agregarVehiculo = useCallback(async (vehiculoInput: VehiculoInput): Promise<Vehiculo | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('vehiculos')
        .insert([vehiculoInput])
        .select()
        .single();

      if (dbError) throw dbError;
      
      setVehiculos((prev) => [data, ...prev]);
      return data;
    } catch (err: any) {
      console.error('Error inserting vehiculo:', err);
      setError(err?.message || 'Error al agregar el vehículo.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const editarVehiculo = useCallback(async (id: string, vehiculoInput: Partial<VehiculoInput>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('vehiculos')
        .update(vehiculoInput)
        .eq('id', id);

      if (dbError) throw dbError;

      setVehiculos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...vehiculoInput } as Vehiculo : v))
      );
      return true;
    } catch (err: any) {
      console.error('Error updating vehiculo:', err);
      setError(err?.message || 'Error al actualizar el vehículo.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarVehiculo = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('vehiculos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      setVehiculos((prev) => prev.filter((v) => v.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting vehiculo:', err);
      setError(err?.message || 'Error al eliminar el vehículo.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    vehiculos,
    loading,
    error,
    fetchVehiculos,
    agregarVehiculo,
    editarVehiculo,
    eliminarVehiculo,
  };
}
