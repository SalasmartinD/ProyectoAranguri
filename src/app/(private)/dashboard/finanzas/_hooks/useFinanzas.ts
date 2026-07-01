import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/core/services/supabase';
import { useEmpleados } from '@/core/hooks/useEmpleados';

export interface MovimientoCaja {
  id: string;
  fecha: string;
  monto: number;
  tipo_movimiento: 'INGRESO' | 'EGRESO';
  categoria_id: string;
  categorias_caja?: {
    nombre: string;
  };
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

function getPeriodValue(dateStr: string): number {
  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    return d.getUTCFullYear() * 12 + d.getUTCMonth();
  }
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    return parseInt(parts[0], 10) * 12 + (parseInt(parts[1], 10) - 1);
  }
  const d = new Date(dateStr);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
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
  const [ventas, setVentas] = useState<TransaccionPeriodo[]>([]);
  const [compras, setCompras] = useState<TransaccionPeriodo[]>([]);
  const [loadingFinanzas, setLoadingFinanzas] = useState<boolean>(false);
  const [errorFinanzas, setErrorFinanzas] = useState<string | null>(null);

  // Estados para procesar pagos
  const [payingEmployeeId, setPayingEmployeeId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [customLiquidaciones, setCustomLiquidaciones] = useState<Record<string, number>>({});

  // Estado para modal de movimiento manual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualMonto, setManualMonto] = useState<string>('');
  const [manualTipo, setManualTipo] = useState<'INGRESO' | 'EGRESO'>('EGRESO');
  const [manualCategoriaId, setManualCategoriaId] = useState<string>('');
  const [manualDescripcion, setManualDescripcion] = useState('');
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Categorías de caja cargadas desde la BD
  const [categoriasMaster, setCategoriasMaster] = useState<CategoriaCaja[]>([]);

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
    } catch (err: unknown) {
      console.error('Error fetching finanzas:', err);
      setErrorFinanzas(err instanceof Error ? err.message : 'Error al obtener datos financieros del período.');
    } finally {
      setLoadingFinanzas(false);
    }
  }, [mes, anio]);

  // Cargar categorías maestras
  const fetchCategoriasMaster = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_caja')
        .select('*')
        .order('nombre', { ascending: true });
      if (error) throw error;
      setCategoriasMaster(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const categoriasFiltradas = useMemo(() => {
    return categoriasMaster.filter(
      (cat) => cat.tipo_permitido === 'AMBOS' || cat.tipo_permitido === manualTipo
    );
  }, [categoriasMaster, manualTipo]);

  // Auxiliar para verificar si un empleado ya fue liquidado en este período
  const isSueldoLiquidado = useCallback((empleadoId: string) => {
    const searchDesc = `ID: ${empleadoId}`;
    const periodStr = `Período ${mes.toString().padStart(2, '0')}/${anio}`;
    return movimientos.some(
      (m) =>
        m.categorias_caja?.nombre === 'SUELDOS_Y_COMISIONES' &&
        m.descripcion?.includes(searchDesc) &&
        m.descripcion?.includes(periodStr)
    );
  }, [movimientos, mes, anio]);

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

  // Guardar movimiento manual
  const handleSaveManual = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMonto || Number(manualMonto) <= 0 || !manualDescripcion.trim() || !manualCategoriaId) {
      alert('Por favor ingresa un monto válido, una categoría y una descripción.');
      return;
    }

    setIsSavingManual(true);
    setErrorFinanzas(null);
    try {
      const { error: dbErr } = await supabase
        .from('movimientos_caja')
        .insert([
          {
            monto: Number(manualMonto),
            tipo_movimiento: manualTipo,
            categoria_id: manualCategoriaId,
            descripcion: manualDescripcion.trim(),
          },
        ]);

      if (dbErr) throw dbErr;

      setIsModalOpen(false);
      setManualMonto('');
      setManualDescripcion('');
      setSuccessMessage('Movimiento manual registrado exitosamente.');
      await fetchDatosFinancieros();
    } catch (err: unknown) {
      console.error('Error detallado:', err);
      const errMsg = err instanceof Error ? err.message : 'Error de base de datos.';
      setErrorFinanzas(errMsg);
    } finally {
      setIsSavingManual(false);
    }
  }, [manualMonto, manualTipo, manualCategoriaId, manualDescripcion, fetchDatosFinancieros]);

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
    categoriasMaster,
    categoriasFiltradas,
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
    
    // Movimientos manuales
    isModalOpen,
    setIsModalOpen,
    manualMonto,
    setManualMonto,
    manualTipo,
    setManualTipo,
    manualCategoriaId,
    setManualCategoriaId,
    manualDescripcion,
    setManualDescripcion,
    isSavingManual,
    handleSaveManual,
    
    // Carga explicita
    fetchDatosFinancieros,
    fetchCategoriasMaster,
    fetchEmpleados,
  };
}
