'use client';

import React, { useEffect } from 'react';
import { PlusCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useFinanzas } from './_hooks/useFinanzas';
import { ResumenTarjetas } from './_components/ResumenTarjetas';
import { LiquidacionPanel } from './_components/LiquidacionPanel';
import { LibroDiarioTable } from './_components/LibroDiarioTable';
import { MovimientoManualModal } from './_components/MovimientoManualModal';

export default function FinanzasPage() {
  const {
    empleados,
    loadingEmpleados,
    errorEmpleados,
    movimientos,
    ventas,
    loadingFinanzas,
    errorFinanzas,
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
    
    // Métodos de carga
    fetchDatosFinancieros,
    fetchCategoriasMaster,
    fetchEmpleados,
  } = useFinanzas();

  // Carga inicial y reactiva al cambiar el período (mes/año)
  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (!active) return;
      fetchEmpleados();
      fetchDatosFinancieros();
      fetchCategoriasMaster();
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchEmpleados, fetchDatosFinancieros, fetchCategoriasMaster]);

  // Limpiar mensaje de éxito después de unos segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, setSuccessMessage]);

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

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
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
      <ResumenTarjetas metricasCaja={metricasCaja} />

      {/* Grid Principal: Liquidación de Sueldos y Libro Diario */}
      <div className="grid gap-6 lg:grid-cols-3">
        <LiquidacionPanel
          empleados={empleados}
          ventas={ventas}
          loadingEmpleados={loadingEmpleados}
          loadingFinanzas={loadingFinanzas}
          payingEmployeeId={payingEmployeeId}
          customLiquidaciones={customLiquidaciones}
          setCustomLiquidaciones={setCustomLiquidaciones}
          isSueldoLiquidado={isSueldoLiquidado}
          handleLiquidarSueldo={handleLiquidarSueldo}
          mes={mes}
          anio={anio}
        />

        <LibroDiarioTable
          movimientos={movimientos}
          loadingFinanzas={loadingFinanzas}
        />
      </div>

      {/* Modal para Registro Manual de Movimiento */}
      {isModalOpen && (
        <MovimientoManualModal
          setIsModalOpen={setIsModalOpen}
          manualMonto={manualMonto}
          setManualMonto={setManualMonto}
          manualTipo={manualTipo}
          setManualTipo={setManualTipo}
          manualCategoriaId={manualCategoriaId}
          setManualCategoriaId={setManualCategoriaId}
          manualDescripcion={manualDescripcion}
          setManualDescripcion={setManualDescripcion}
          categoriasFiltradas={categoriasFiltradas}
          isSavingManual={isSavingManual}
          handleSaveManual={handleSaveManual}
        />
      )}
    </div>
  );
}
