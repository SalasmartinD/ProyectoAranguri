import { useState, useCallback } from 'react';
import { supabase } from '@/core/services/supabase';
import { Empleado, EmpleadoInput } from '../types/empleado';

export interface EmpleadoKPI {
  empleadoId: string;
  nombre: string;
  ventasMes: number;
  montoTotalMes: number;
  gananciaNetaMes: number;
}

export function useEmpleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<EmpleadoKPI[]>([]);

  const fetchEmpleados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('empleados')
        .select('*, roles(nombre)')
        .order('nombre', { ascending: true });

      if (dbError) throw dbError;
      setEmpleados(data || []);
    } catch (err: any) {
      console.error('Error fetching empleados:', err);
      setError(err?.message || 'Error al obtener la lista de empleados.');
    } finally {
      setLoading(false);
    }
  }, []);

  const agregarEmpleado = useCallback(async (empleadoInput: EmpleadoInput): Promise<Empleado | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('empleados')
        .insert([empleadoInput])
        .select()
        .single();

      if (dbError) throw dbError;
      setEmpleados((prev) => [...prev, data]);
      return data;
    } catch (err: any) {
      console.error('Error adding empleado:', err);
      setError(err?.message || 'Error al agregar el empleado.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const editarEmpleado = useCallback(async (id: string, empleadoInput: Partial<EmpleadoInput>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('empleados')
        .update(empleadoInput)
        .eq('id', id);

      if (dbError) throw dbError;
      setEmpleados((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...empleadoInput } as Empleado : e))
      );
      return true;
    } catch (err: any) {
      console.error('Error editing empleado:', err);
      setError(err?.message || 'Error al editar el empleado.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const calcularKPIs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Obtener todos los empleados activos
      const { data: empData, error: empErr } = await supabase
        .from('empleados')
        .select('id, nombre');

      if (empErr) throw empErr;

      // 2. Obtener las transacciones del mes actual de tipo Venta
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const { data: txData, error: txErr } = await supabase
        .from('transacciones')
        .select('empleado_id, monto, ganancia_neta, fecha')
        .eq('tipo', 'Venta')
        .gte('fecha', inicioMes.toISOString());

      if (txErr) throw txErr;

      // 3. Procesar y agrupar KPIs en memoria
      const calculatedKpis = (empData || []).map((emp) => {
        const ventasEmp = (txData || []).filter((tx) => tx.empleado_id === emp.id);
        const ventasMes = ventasEmp.length;
        const montoTotalMes = ventasEmp.reduce((acc, tx) => acc + Number(tx.monto), 0);
        const gananciaNetaMes = ventasEmp.reduce((acc, tx) => acc + Number(tx.ganancia_neta), 0);

        return {
          empleadoId: emp.id,
          nombre: emp.nombre,
          ventasMes,
          montoTotalMes,
          gananciaNetaMes,
        };
      });

      setKpis(calculatedKpis);
    } catch (err: any) {
      console.error('Error calculating KPIs:', err);
      setError(err?.message || 'Error al calcular las métricas de empleados.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    empleados,
    loading,
    error,
    kpis,
    fetchEmpleados,
    agregarEmpleado,
    editarEmpleado,
    calcularKPIs,
  };
}
