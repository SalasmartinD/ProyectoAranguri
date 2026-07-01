import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/core/services/supabase';
import { useEmpleados } from '@/core/hooks/useEmpleados';
import { getPeriodValue } from '@/core/utils/finance';

export interface MovimientoCaja {
  id: string;
  fecha: string;
  monto: number;
  tipo_movimiento: 'INGRESO' | 'EGRESO';
  categoria_id: string;
  categorias_caja?: {
    nombre: string;
  } | null;
  descripcion: string;
}

export interface CategoriaCaja {
  id: string;
  nombre: string;
  tipo_permitido: 'INGRESO' | 'EGRESO' | 'AMBOS';
  creado_en: string;
}

export interface TransaccionPeriodo {
  monto: number;
  empleado_id: string;
  fecha: string;
  tipo: 'Compra' | 'Venta';
}



export function useFinanzas() {
  const { empleados, loading: loadingEmpleados, error: errorEmpleados, fetchEmpleados } = useEmpleados();

  // Estados de fecha
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [anio, setAnio] = useState<number>(new Date().getFullYear());

  // Filtrar empleados contratados y activos en el período seleccionado
  const empleadosFiltrados = useMemo(() => {
    const selectedPeriod = anio * 12 + (mes - 1);
    return empleados.filter((emp) => {
      // Excluir si la fecha de baja es estrictamente anterior al período seleccionado
      if (emp.fecha_baja) {
        const bajaPeriod = getPeriodValue(emp.fecha_baja);
        if (selectedPeriod > bajaPeriod) return false;
      }

      const altaStr = emp.fecha_alta || emp.creado_en || emp.fecha_ingreso;
      if (!altaStr) return true;
      const altaPeriod = getPeriodValue(altaStr);
      
      return selectedPeriod >= altaPeriod;
    });
  }, [empleados, mes, anio]);

  // Estados de datos financieros
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [liquidacionesPeriodo, setLiquidacionesPeriodo] = useState<MovimientoCaja[]>([]);
  const [ventas, setVentas] = useState<TransaccionPeriodo[]>([]);
  const [compras, setCompras] = useState<TransaccionPeriodo[]>([]);
  const [loadingFinanzas, setLoadingFinanzas] = useState<boolean>(false);
  const [errorFinanzas, setErrorFinanzas] = useState<string | null>(null);

  // Estados para procesar pagos
  const [payingEmployeeId, setPayingEmployeeId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [customLiquidaciones, setCustomLiquidaciones] = useState<Record<string, number>>({});



  // Cargar datos
  const fetchDatosFinancieros = useCallback(async () => {
    setLoadingFinanzas(true);
    setErrorFinanzas(null);
    try {
      const startDate = new Date(anio, mes - 1, 1, 0, 0, 0, 0).toISOString();
      const endDate = new Date(mes === 12 ? anio + 1 : anio, mes === 12 ? 0 : mes, 1, 0, 0, 0, 0).toISOString();

      // 1. Obtener transacciones en el rango (tanto Compras como Ventas)
      const { data: txData, error: txErr } = await supabase
        .from('transacciones')
        .select('monto, empleado_id, fecha, tipo')
        .gte('fecha', startDate)
        .lt('fecha', endDate);

      if (txErr) throw txErr;

      const salesData = (txData || []).filter(tx => tx.tipo === 'Venta') as TransaccionPeriodo[];
      const purchasesData = (txData || []).filter(tx => tx.tipo === 'Compra') as TransaccionPeriodo[];

      setVentas(salesData);
      setCompras(purchasesData);

      // 2. Obtener movimientos de caja en el rango
      const { data: movesData, error: movesErr } = await supabase
        .from('movimientos_caja')
        .select('*, categorias_caja(nombre)')
        .gte('fecha', startDate)
        .lt('fecha', endDate)
        .order('fecha', { ascending: false });

      if (movesErr) throw movesErr;
      setMovimientos(movesData || []);

      // 3. Obtener todas las liquidaciones registradas para el período seleccionado (sin importar la fecha física del movimiento)
      const periodStr = `Período ${mes.toString().padStart(2, '0')}/${anio}`;
      const { data: liqData, error: liqErr } = await supabase
        .from('movimientos_caja')
        .select('*, categorias_caja(nombre)')
        .like('descripcion', `%${periodStr}%`);

      if (liqErr) throw liqErr;
      setLiquidacionesPeriodo(liqData || []);
    } catch (err: unknown) {
      console.error('Error fetching finanzas:', err);
      setErrorFinanzas(err instanceof Error ? err.message : 'Error al obtener datos financieros del período.');
    } finally {
      setLoadingFinanzas(false);
    }
  }, [mes, anio]);



  // Auxiliar para verificar si un empleado ya fue liquidado en este período
  const isSueldoLiquidado = useCallback((empleadoId: string) => {
    const searchDesc = `ID: ${empleadoId}`;
    return liquidacionesPeriodo.some(
      (m) =>
        m.categorias_caja?.nombre === 'SUELDOS_Y_COMISIONES' &&
        m.descripcion?.includes(searchDesc)
    );
  }, [liquidacionesPeriodo]);

  // Registrar pago de sueldo
  const handleLiquidarSueldo = useCallback(async (empleadoId: string, montoFinal: number) => {
    setPayingEmployeeId(empleadoId);
    setSuccessMessage(null);
    setErrorFinanzas(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/finanzas/liquidar-sueldo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ empleadoId, mes, anio, montoFinal }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la liquidación.');
      }

      setSuccessMessage('Liquidación y pago registrados con éxito en la caja.');
      await fetchDatosFinancieros();
    } catch (err: unknown) {
      console.error('Error pagando sueldo:', err);
      setErrorFinanzas(err instanceof Error ? err.message : 'Error al procesar la liquidación.');
    } finally {
      setPayingEmployeeId(null);
    }
  }, [mes, anio, fetchDatosFinancieros]);



  // Totales calculados en memoria para el mes
  const metricasCaja = useMemo(() => {
    const ingresosVentas = ventas.reduce((acc, v) => acc + Number(v.monto), 0);
    const ingresosOtros = movimientos
      .filter((m) => m.tipo_movimiento === 'INGRESO' && m.categorias_caja?.nombre !== 'VENTAS')
      .reduce((acc, m) => acc + Number(m.monto), 0);

    const totalIngresos = ingresosVentas + ingresosOtros;

    const egresosCompras = compras.reduce((acc, c) => acc + Number(c.monto), 0);
    const egresosOtros = movimientos
      .filter((m) => m.tipo_movimiento === 'EGRESO')
      .reduce((acc, m) => acc + Number(m.monto), 0);

    const totalEgresos = egresosCompras + egresosOtros;

    return {
      ingresosVentas,
      ingresosOtros,
      totalIngresos,
      egresosCompras,
      egresosOtros,
      totalEgresos,
      balance: totalIngresos - totalEgresos,
    };
  }, [ventas, compras, movimientos]);

  return {
    // Datos y estados
    empleados: empleadosFiltrados,
    loadingEmpleados,
    errorEmpleados,
    movimientos,
    ventas,
    compras,
    loadingFinanzas,
    errorFinanzas,
    metricasCaja,
    
    // Controles de fecha
    mes,
    setMes,
    anio,
    setAnio,
    
    // Liquidaciones
    payingEmployeeId,
    successMessage,
    setSuccessMessage,
    customLiquidaciones,
    setCustomLiquidaciones,
    isSueldoLiquidado,
    handleLiquidarSueldo,
    
    // Carga explicita
    fetchDatosFinancieros,
    fetchEmpleados,
  };
}
