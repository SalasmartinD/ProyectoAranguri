'use client';

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useOperacionesForm } from './_hooks/useOperacionesForm';
import { OperacionesForm } from './_components/OperacionesForm';
import { TransaccionesTable } from './_components/TransaccionesTable';

export default function OperacionesPage() {
  const {
    transacciones,
    txLoading,
    fetchTransacciones,
    fetchVehiculos,
    fetchEmpleados,
    vehiculosDisponibles,
    empleados,

    // Estados de control y mensajes
    activeTab,
    setActiveTab,
    selectedEmpleadoId,
    setSelectedEmpleadoId,
    successMsg,
    setSuccessMsg,
    errorMsg,

    // Formulario Venta
    selectedVehiculoId,
    setSelectedVehiculoId,
    montoVenta,
    setMontoVenta,
    handleVentaSubmit,

    // Formulario Compra
    marca,
    setMarca,
    modelo,
    setModelo,
    anio,
    setAnio,
    precioCompra,
    setPrecioCompra,
    precioVenta,
    setPrecioVenta,
    kilometros,
    setKilometros,
    existingImages,
    setExistingImages,
    selectedFiles,
    setSelectedFiles,
    uploadProgress,
    isSubmitting,
    tipo,
    setTipo,
    combustible,
    setCombustible,
    transmision,
    setTransmision,
    motorizacion,
    setMotorizacion,
    handleCompraSubmit,
  } = useOperacionesForm();

  // Carga inicial de datos
  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (!active) return;
      fetchTransacciones();
      fetchVehiculos(true); // Cargar solo disponibles para la venta
      fetchEmpleados();
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchTransacciones, fetchVehiculos, fetchEmpleados]);

  // Limpiar mensaje de éxito después de unos segundos
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, setSuccessMsg]);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Columna de Formularios */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Operaciones de Caja</h1>
          <p className="text-slate-500 text-sm">Registra compras y ventas de stock con impacto en tiempo real.</p>
        </div>

        {/* Alertas */}
        {successMsg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-start gap-2.5 text-xs">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-2.5 text-xs">
            <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Caja de Formularios */}
        <OperacionesForm
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedEmpleadoId={selectedEmpleadoId}
          setSelectedEmpleadoId={setSelectedEmpleadoId}
          empleados={empleados}
          txLoading={txLoading}
          selectedVehiculoId={selectedVehiculoId}
          setSelectedVehiculoId={setSelectedVehiculoId}
          vehiculosDisponibles={vehiculosDisponibles}
          montoVenta={montoVenta}
          setMontoVenta={setMontoVenta}
          handleVentaSubmit={handleVentaSubmit}
          marca={marca}
          setMarca={setMarca}
          modelo={modelo}
          setModelo={setModelo}
          anio={anio}
          setAnio={setAnio}
          kilometros={kilometros}
          setKilometros={setKilometros}
          precioCompra={precioCompra}
          setPrecioCompra={setPrecioCompra}
          precioVenta={precioVenta}
          setPrecioVenta={setPrecioVenta}
          tipo={tipo}
          setTipo={setTipo}
          combustible={combustible}
          setCombustible={setCombustible}
          transmision={transmision}
          setTransmision={setTransmision}
          motorizacion={motorizacion}
          setMotorizacion={setMotorizacion}
          existingImages={existingImages}
          setExistingImages={setExistingImages}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          uploadProgress={uploadProgress}
          isSubmitting={isSubmitting}
          handleCompraSubmit={handleCompraSubmit}
        />
      </div>

      {/* Columna de Logs de Historial */}
      <TransaccionesTable
        transacciones={transacciones}
        txLoading={txLoading}
      />
    </div>
  );
}
