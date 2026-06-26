'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/core/services/supabase';
import { useEmpleados } from '@/core/hooks/useEmpleados';
import { TipoRemuneracion } from '@/core/types/empleado';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CheckCircle, 
  Calendar, 
  User, 
  CreditCard, 
  Loader2, 
  FileText, 
  PlusCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface MovimientoCaja {
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

interface CategoriaCaja {
  id: string;
  nombre: string;
  tipo_permitido: 'INGRESO' | 'EGRESO' | 'AMBOS';
  creado_en: string;
}

interface TransaccionPeriodo {
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

export default function FinanzasPage() {
  const { empleados, loading: loadingEmpleados, error: errorEmpleados, fetchEmpleados } = useEmpleados();

  // Estados de fecha
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [anio, setAnio] = useState<number>(new Date().getFullYear());

  // Filtrar empleados contratados en el período seleccionado
  const empleadosFiltrados = useMemo(() => {
    const selectedPeriod = anio * 12 + (mes - 1);
    return empleados.filter((emp) => {
      const altaStr = emp.fecha_alta || emp.creado_en || emp.fecha_ingreso;
      const altaPeriod = getPeriodValue(altaStr);
      
      const bajaStr = emp.fecha_baja;
      const bajaPeriod = bajaStr ? getPeriodValue(bajaStr) : null;
      
      return selectedPeriod >= altaPeriod && (bajaPeriod === null || selectedPeriod <= bajaPeriod);
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
    } catch (err: any) {
      console.error('Error fetching finanzas:', err);
      setErrorFinanzas(err?.message || 'Error al obtener datos financieros del período.');
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

  useEffect(() => {
    if (categoriasFiltradas.length > 0) {
      const exists = categoriasFiltradas.some((c) => c.id === manualCategoriaId);
      if (!exists) {
        setManualCategoriaId(categoriasFiltradas[0].id);
      }
    } else {
      setManualCategoriaId('');
    }
  }, [categoriasFiltradas, manualCategoriaId]);

  useEffect(() => {
    fetchEmpleados();
    fetchDatosFinancieros();
    fetchCategoriasMaster();
  }, [fetchEmpleados, fetchDatosFinancieros, fetchCategoriasMaster]);

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
  const handleLiquidarSueldo = async (empleadoId: string, montoFinal: number) => {
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
    } catch (err: any) {
      console.error('Error pagando sueldo:', err);
      setErrorFinanzas(err.message);
    } finally {
      setPayingEmployeeId(null);
    }
  };

  // Guardar movimiento manual
  const handleSaveManual = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      console.error('Error detallado:', err.message, err.status, err.response || err);
      setErrorFinanzas(err.message || err.details || (typeof err === 'object' ? JSON.stringify(err) : String(err)));
    } finally {
      setIsSavingManual(false);
    }
  };

  // Totales calculados en memoria para el mes
  const metricasCaja = useMemo(() => {
    const ingresosVentas = ventas.reduce((acc, v) => acc + Number(v.monto), 0);
    const ingresosOtros = movimientos
      .filter((m) => m.tipo_movimiento === 'INGRESO')
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

  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  const anios = [2025, 2026, 2027, 2028];

  return (
    <div className="space-y-6">
      {/* Encabezado y Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Módulo Financiero y Caja</h1>
          <p className="text-slate-500 text-sm">Control de flujo de caja, balance mensual y liquidación de haberes.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="text-xs font-bold text-slate-700 outline-none bg-transparent px-2 border-0 focus:ring-0 focus:outline-none"
            >
              {meses.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="text-xs font-bold text-slate-700 outline-none bg-transparent px-2 border-0 border-l border-slate-150 focus:ring-0 focus:outline-none focus:border-l-slate-150"
            >
              {anios.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all shrink-0"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Nuevo Movimiento
          </button>
        </div>
      </div>

      {/* Alertas */}
      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-center gap-2.5 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {(errorEmpleados || errorFinanzas) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-2.5 text-sm">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Error de Operación</span>
            {errorEmpleados || errorFinanzas}
          </div>
        </div>
      )}

      {/* Tarjetas de Resumen Financiero */}
      <div className="grid gap-5 sm:grid-cols-3">
        {/* Tarjeta de Ingresos */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ingresos del Mes</span>
            <span className="text-2xl font-black text-slate-900">
              ${metricasCaja.totalIngresos.toLocaleString('es-AR')}
            </span>
            <div className="text-[10px] text-slate-400">
              Ventas: ${metricasCaja.ingresosVentas.toLocaleString('es-AR')} | Otros: ${metricasCaja.ingresosOtros.toLocaleString('es-AR')}
            </div>
          </div>
          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Tarjeta de Egresos */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Egresos del Mes</span>
            <span className="text-2xl font-black text-slate-900">
              ${metricasCaja.totalEgresos.toLocaleString('es-AR')}
            </span>
            <div className="text-[10px] text-slate-400 font-sans">
              Compras: ${metricasCaja.egresosCompras.toLocaleString('es-AR')} | Gastos: ${metricasCaja.egresosOtros.toLocaleString('es-AR')}
            </div>
          </div>
          <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>

        {/* Tarjeta de Balance Neto */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Balance Neto</span>
            <span className={`text-2xl font-black ${metricasCaja.balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              ${metricasCaja.balance.toLocaleString('es-AR')}
            </span>
            <div className="text-[10px] text-slate-400">Ingresos vs Egresos del período</div>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${metricasCaja.balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Grid Principal: Liquidación de Sueldos y Libro Diario */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Panel de Liquidación de Haberes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Liquidación de Haberes y Comisiones</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {loadingEmpleados || loadingFinanzas ? (
              <div className="py-20 flex items-center justify-center text-slate-400 text-xs gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                <span>Calculando comisiones del período...</span>
              </div>
            ) : empleadosFiltrados.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-xs font-semibold">
                No hay empleados contratados en el período seleccionado.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs text-slate-700 font-sans">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Empleado</th>
                      <th className="px-6 py-4">Remuneración</th>
                      <th className="px-6 py-4 text-center">Ventas Mes</th>
                      <th className="px-6 py-4 text-right">Comisión</th>
                      <th className="px-6 py-4 text-right">Total a Liquidar</th>
                      <th className="px-6 py-4 text-right">Estado / Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empleadosFiltrados.map((emp) => {
                      // Filtrar ventas del empleado
                      const ventasEmp = ventas.filter((v) => v.empleado_id === emp.id);
                      const ventasCount = ventasEmp.length;
                      const totalMontoVentas = ventasEmp.reduce((acc, v) => acc + Number(v.monto), 0);
                      const comisionCalculada = (totalMontoVentas * Number(emp.porcentaje_comision || 0)) / 100;

                      // Calcular total de remuneración
                      let totalLiquidar = 0;
                      if (emp.tipo_remuneracion === 'FIJO') {
                        totalLiquidar = Number(emp.sueldo_fijo || 0);
                      } else if (emp.tipo_remuneracion === 'COMISION') {
                        totalLiquidar = comisionCalculada;
                      } else if (emp.tipo_remuneracion === 'MIXTO') {
                        totalLiquidar = Number(emp.sueldo_fijo || 0) + comisionCalculada;
                      }

                      const liquidado = isSueldoLiquidado(emp.id);
                      const altaStr = emp.fecha_alta || emp.creado_en || emp.fecha_ingreso;
                      const altaPeriod = getPeriodValue(altaStr);
                      const selectedPeriod = anio * 12 + (mes - 1);
                      const esAnteriorAlIngreso = selectedPeriod < altaPeriod;

                      const customValue = customLiquidaciones[emp.id];
                      const montoFinal = customValue !== undefined ? customValue : totalLiquidar;

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-extrabold text-slate-900">{emp.nombre}</div>
                            <div className="text-[10px] text-slate-400">{emp.roles?.nombre || 'Sin Rol'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-bold text-slate-800">{emp.tipo_remuneracion}</div>
                            {emp.tipo_remuneracion !== 'COMISION' && (
                              <div className="text-[10px] text-slate-400">Fijo: ${Number(emp.sueldo_fijo).toLocaleString('es-AR')}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-slate-800">
                            {ventasCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-slate-700">
                            ${comisionCalculada.toLocaleString('es-AR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-indigo-500 font-bold text-xs">$</span>
                              <input
                                type="number"
                                disabled={liquidado || esAnteriorAlIngreso || totalLiquidar <= 0 || payingEmployeeId !== null}
                                value={montoFinal}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                                  setCustomLiquidaciones(prev => ({
                                    ...prev,
                                    [emp.id]: val
                                  }));
                                }}
                                className="w-24 text-right font-black text-indigo-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-100 disabled:bg-transparent disabled:border-transparent disabled:text-indigo-700 disabled:shadow-none"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {liquidado ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-100 select-none" title="El período ya fue pagado">
                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                                Liquidado
                              </span>
                            ) : esAnteriorAlIngreso ? (
                              <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 border border-amber-100 select-none" title="El mes seleccionado es anterior al ingreso del empleado">
                                Previo al Ingreso
                              </span>
                            ) : totalLiquidar <= 0 ? (
                              <span className="inline-flex items-center rounded-md bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-400 border border-slate-100 select-none">
                                Sin haberes
                              </span>
                            ) : (
                              <button
                                disabled={payingEmployeeId !== null}
                                onClick={() => handleLiquidarSueldo(emp.id, montoFinal)}
                                className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-[10px] font-extrabold text-white shadow hover:bg-indigo-700 active:scale-97 transition-all cursor-pointer disabled:opacity-50"
                              >
                                {payingEmployeeId === emp.id ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Pagando...
                                  </>
                                ) : (
                                  'Registrar Pago'
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Libro Diario de Movimientos */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Libro Diario (Caja)</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {loadingFinanzas ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                Cargando libro diario...
              </div>
            ) : movimientos.length === 0 ? (
              <div className="py-20 text-center text-slate-400 text-xs">
                No se registran movimientos en el período.
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-150 scrollbar-thin">
                {movimientos.map((m) => (
                  <div key={m.id} className="p-4 hover:bg-slate-50/50 flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-400 text-[10px]">
                        {new Date(m.fecha).toLocaleDateString('es-AR')}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-extrabold border ${
                          m.tipo_movimiento === 'INGRESO'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}
                      >
                        {m.tipo_movimiento}
                      </span>
                    </div>

                    <div className="font-bold text-slate-800">{(m.categorias_caja?.nombre || 'Otros').replace(/_/g, ' ')}</div>
                    <div className="text-[10px] text-slate-500 leading-snug">{m.descripcion}</div>

                    <div className="text-right font-black text-slate-900 mt-0.5">
                      {m.tipo_movimiento === 'INGRESO' ? '+' : '-'}${Number(m.monto).toLocaleString('es-AR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Registro Manual de Movimiento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
              <h3 className="font-bold text-slate-900 text-sm">Registrar Movimiento de Caja</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipo Movimiento</label>
                  <select
                    value={manualTipo}
                    onChange={(e) => {
                      setManualTipo(e.target.value as 'INGRESO' | 'EGRESO');
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white font-semibold"
                  >
                    <option value="EGRESO">Egreso</option>
                    <option value="INGRESO">Ingreso</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Categoría</label>
                  <select
                    value={manualCategoriaId}
                    onChange={(e) => setManualCategoriaId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white font-semibold"
                  >
                    {categoriasFiltradas.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monto ($)</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={manualMonto}
                  onChange={(e) => setManualMonto(e.target.value)}
                  placeholder="Ej: 25000"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descripción / Detalle</label>
                <textarea
                  required
                  value={manualDescripcion}
                  onChange={(e) => setManualDescripcion(e.target.value)}
                  placeholder="Ej: Pago de alquiler del local central, compra de insumos de oficina..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingManual}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingManual && <Loader2 className="h-3 w-3 animate-spin" />}
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
