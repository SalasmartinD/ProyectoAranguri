'use client';

import React, { useEffect } from 'react';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { useInventario } from './_hooks/useInventario';
import { InventarioTable } from './_components/InventarioTable';
import { VehiculoModal } from './_components/VehiculoModal';

export default function InventarioPage() {
  const {
    vehiculos,
    loading,
    error,
    fetchVehiculos,
    
    // Controles de búsqueda y modal
    searchTerm,
    setSearchTerm,
    isFormOpen,
    setIsFormOpen,
    editingId,
    successMsg,
    setSuccessMsg,

    // Estados del formulario
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
    estado,
    setEstado,
    existingImages,
    setExistingImages,
    selectedFiles,
    setSelectedFiles,
    uploadProgress,
    isSubmitting,
    formError,
    descripcion,
    setDescripcion,
    isOptimizing,
    tipo,
    setTipo,
    combustible,
    setCombustible,
    transmision,
    setTransmision,
    motorizacion,
    setMotorizacion,

    // Handlers
    handleOpenAdd,
    handleOpenEdit,
    handleSubmit,
    handleDelete,
    handleOptimizeDescription,
  } = useInventario();

  // Carga inicial de datos
  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (!active) return;
      fetchVehiculos();
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchVehiculos]);

  // Limpiar mensaje de éxito
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, setSuccessMsg]);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestión de Inventario</h1>
          <p className="text-slate-500 text-sm">Administra el stock, especificaciones técnicas y estados de visibilidad.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Agregar Vehículo
        </button>
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-center gap-2.5 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-2.5 text-sm">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Error de Operación</span>
            {error}
          </div>
        </div>
      )}

      {/* Tabla del inventario */}
      <InventarioTable
        vehiculos={vehiculos}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleOpenEdit={handleOpenEdit}
        handleDelete={handleDelete}
      />

      {/* Modal / Formulario Desplegable */}
      {isFormOpen && (
        <VehiculoModal
          setIsFormOpen={setIsFormOpen}
          editingId={editingId}
          handleSubmit={handleSubmit}
          formError={formError}
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
          estado={estado}
          setEstado={setEstado}
          descripcion={descripcion}
          setDescripcion={setDescripcion}
          isOptimizing={isOptimizing}
          handleOptimizeDescription={handleOptimizeDescription}
          existingImages={existingImages}
          setExistingImages={setExistingImages}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          loading={loading}
          isSubmitting={isSubmitting}
          uploadProgress={uploadProgress}
        />
      )}
    </div>
  );
}
