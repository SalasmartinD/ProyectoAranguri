import { useState, useCallback } from 'react';
import { supabase } from '@/core/services/supabase';

export interface DashboardStats {
  autosDisponibles: number;
  autosVendidos: number;
  ventasMes: number;
  montoVentasMes: number;
  gananciaMes: number;
}

export interface RecentTransaccion {
  id: string;
  tipo: 'Compra' | 'Venta';
  monto: number;
  ganancia_neta?: number | null;
  fecha: string;
  vehiculo: { marca: string; modelo: string }[] | { marca: string; modelo: string } | null;
  empleado: { nombre: string }[] | { nombre: string } | null;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    autosDisponibles: 0,
    autosVendidos: 0,
    ventasMes: 0,
    montoVentasMes: 0,
    gananciaMes: 0,
  });
  const [recentTransacciones, setRecentTransacciones] = useState<RecentTransaccion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      // 1. Obtener conteo de vehículos por estado
      const { data: vehiculosData, error: vehiculosErr } = await supabase
        .from('vehiculos')
        .select('estado');

      if (vehiculosErr) throw vehiculosErr;

      const disponibles = (vehiculosData || []).filter((v) => v.estado === 'Disponible').length;
      const vendidos = (vehiculosData || []).filter((v) => v.estado === 'Vendido').length;

      // 2. Obtener transacciones del mes
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const { data: txMes, error: txErr } = await supabase
        .from('transacciones')
        .select('monto, ganancia_neta, tipo, fecha')
        .gte('fecha', inicioMes.toISOString());

      if (txErr) throw txErr;

      const ventasMes = (txMes || []).filter((tx) => tx.tipo === 'Venta');
      const cantidadVentas = ventasMes.length;
      const montoVentas = ventasMes.reduce((acc, tx) => acc + Number(tx.monto), 0);
      const gananciaMes = ventasMes.reduce((acc, tx) => acc + Number(tx.ganancia_neta), 0);

      setStats({
        autosDisponibles: disponibles,
        autosVendidos: vendidos,
        ventasMes: cantidadVentas,
        montoVentasMes: montoVentas,
        gananciaMes,
      });

      // 3. Obtener últimas 5 transacciones con relaciones
      const { data: ultimasTx, error: ultimasTxErr } = await supabase
        .from('transacciones')
        .select(`
          id,
          tipo,
          monto,
          ganancia_neta,
          fecha,
          vehiculo:vehiculos(marca, modelo),
          empleado:empleados(nombre)
        `)
        .order('fecha', { ascending: false })
        .limit(5);

      if (ultimasTxErr) throw ultimasTxErr;
      setRecentTransacciones(ultimasTx || []);
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const message = typeof errorObj?.message === 'string' ? errorObj.message : '';
      const details = typeof errorObj?.details === 'string' ? errorObj.details : 'N/A';
      const hint = typeof errorObj?.hint === 'string' ? errorObj.hint : 'N/A';
      const code = typeof errorObj?.code === 'string' ? errorObj.code : 'N/A';

      console.error('--- DETALLE DEL ERROR EN DASHBOARD ---');
      console.error('Mensaje:', message || String(err));
      console.error('Detalle:', details);
      console.error('Hint:', hint);
      console.error('Código:', code);
      console.error('--------------------------------------');
      
      const msg = message || (typeof err === 'string' ? err : 'Error al obtener las métricas del panel.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    recentTransacciones,
    loading,
    error,
    fetchDashboardData,
  };
}
