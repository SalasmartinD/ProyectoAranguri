import { useState, useCallback } from 'react';
import { supabase } from '@/core/services/supabase';
import { Transaccion, TransaccionInput } from '../types/transaccion';

export function useOperaciones() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransacciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Hacer un JOIN para obtener detalles del vehículo y del empleado
      const { data, error: dbError } = await supabase
        .from('transacciones')
        .select(`
          *,
          vehiculo:vehiculos(*),
          empleado:empleados(*)
        `)
        .order('fecha', { ascending: false });

      if (dbError) throw dbError;
      setTransacciones(data || []);
    } catch (err: unknown) {
      console.error('Error fetching transacciones:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener el historial de operaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Registra la VENTA de un vehículo:
   * 1. Registra la transacción de venta.
   * (El trigger de base de datos calcula la ganancia_neta y cambia el auto a "Vendido")
   */
  const registrarVenta = useCallback(async (
    vehiculoId: string,
    empleadoId: string,
    montoVenta: number
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const transaccionVenta: TransaccionInput = {
        tipo: 'Venta',
        vehiculo_id: vehiculoId,
        empleado_id: empleadoId,
        monto: montoVenta,
      };

      // Insertar transacción de venta
      const { error: txErr } = await supabase
        .from('transacciones')
        .insert([transaccionVenta]);

      if (txErr) throw txErr;

      await fetchTransacciones();
      return true;
    } catch (err: unknown) {
      console.error('Error al registrar venta:', err);
      setError(err instanceof Error ? err.message : 'Error al registrar la transacción de venta.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTransacciones]);

  return {
    transacciones,
    loading,
    error,
    fetchTransacciones,
    registrarVenta,
  };
}
