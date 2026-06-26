'use client';

import React, { useEffect, useState } from 'react';
import { useOperaciones } from '@/core/hooks/useOperaciones';
import { useVehiculos } from '@/core/hooks/useVehiculos';
import { useEmpleados } from '@/core/hooks/useEmpleados';
import { VehiculoInput, TipoVehiculo, TipoCombustible, TipoTransmision } from '@/core/types/vehiculo';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  DollarSign, 
  Users, 
  Car,
  AlertCircle, 
  CheckCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { supabase } from '@/core/services/supabase';

export default function OperacionesPage() {
  const { transacciones, loading: txLoading, error: txError, fetchTransacciones, registrarCompra, registrarVenta } = useOperaciones();
  const { vehiculos, fetchVehiculos } = useVehiculos();
  const { empleados, fetchEmpleados } = useEmpleados();

  // Estados para los formularios
  const [activeTab, setActiveTab] = useState<'venta' | 'compra'>('venta');
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulario Venta
  const [selectedVehiculoId, setSelectedVehiculoId] = useState('');
  const [montoVenta, setMontoVenta] = useState<number | ''>('');

  // Formulario Compra (Alta de Auto)
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState<number | ''>(new Date().getFullYear());
  const [precioCompra, setPrecioCompra] = useState<number | ''>('');
  const [precioVenta, setPrecioVenta] = useState<number | ''>('');
  const [kilometros, setKilometros] = useState<number | ''>('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipo, setTipo] = useState<TipoVehiculo | ''>('');
  const [combustible, setCombustible] = useState<TipoCombustible | ''>('');
  const [transmision, setTransmision] = useState<TipoTransmision | ''>('');
  const [motorizacion, setMotorizacion] = useState('');

  useEffect(() => {
    fetchTransacciones();
    fetchVehiculos(true); // Cargar solo disponibles para la venta
    fetchEmpleados();
  }, [fetchTransacciones, fetchVehiculos, fetchEmpleados]);

  // Manejar envío de venta
  const handleVentaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!selectedVehiculoId || !selectedEmpleadoId || !montoVenta || Number(montoVenta) <= 0) {
      setErrorMsg('Por favor completa todos los campos con montos válidos.');
      return;
    }

    const ok = await registrarVenta(selectedVehiculoId, selectedEmpleadoId, Number(montoVenta));
    if (ok) {
      setSuccessMsg('Venta registrada con éxito. El vehículo cambió de estado a "Vendido" automáticamente.');
      setSelectedVehiculoId('');
      setSelectedEmpleadoId('');
      setMontoVenta('');
      fetchVehiculos(true); // Refrescar lista de vehículos disponibles
    } else {
      setErrorMsg('Error al registrar la transacción de venta.');
    }
  };

  // Manejar envío de compra
  const handleCompraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setIsSubmitting(true);
    setUploadProgress(null);

    if (!selectedEmpleadoId || !marca || !modelo || !precioCompra || !precioVenta || kilometros === '') {
      setErrorMsg('Por favor completa todos los campos del vehículo y selecciona un empleado.');
      setIsSubmitting(false);
      return;
    }

    try {
      const targetId = crypto.randomUUID();
      const uploadedUrls: string[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(`Subiendo imágenes (${i + 1}/${selectedFiles.length})...`);
        const fileExt = file.name.split('.').pop();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileName = `${timestamp}_${randomStr}.${fileExt}`;
        const filePath = `autos/${targetId}/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('vehiculos')
          .upload(filePath, file);

        if (uploadErr) {
          throw new Error(`Error al subir la imagen ${file.name}: ${uploadErr.message}`);
        }

        const { data } = supabase.storage
          .from('vehiculos')
          .getPublicUrl(filePath);

        if (data?.publicUrl) {
          uploadedUrls.push(data.publicUrl);
        }
      }

      const finalImagenes = [...existingImages, ...uploadedUrls];

      const nuevoVehiculo: VehiculoInput = {
        id: targetId,
        marca,
        modelo,
        anio: Number(anio || 0),
        precio_compra: Number(precioCompra || 0),
        precio_venta: Number(precioVenta || 0),
        kilometros: Number(kilometros || 0),
        estado: 'Disponible',
        imagenes: finalImagenes,
        tipo: tipo || null,
        combustible: combustible || null,
        transmision: transmision || null,
        motorizacion: motorizacion.trim() || null,
      };

      const ok = await registrarCompra(nuevoVehiculo, selectedEmpleadoId);
      if (ok) {
        setSuccessMsg('Compra registrada con éxito. El vehículo ha sido ingresado al stock como "Disponible".');
        setMarca('');
        setModelo('');
        setAnio(new Date().getFullYear());
        setPrecioCompra('');
        setPrecioVenta('');
        setKilometros('');
        setExistingImages([]);
        setSelectedFiles([]);
        setTipo('');
        setCombustible('');
        setTransmision('');
        setMotorizacion('');
        setSelectedEmpleadoId('');
        fetchVehiculos(true); // Refrescar lista de vehículos disponibles
      } else {
        setErrorMsg('Error al registrar el vehículo y la transacción de compra.');
      }
    } catch (err: any) {
      console.error('Error al registrar la compra:', err);
      setErrorMsg(err?.message || 'Error al subir las imágenes o registrar el vehículo.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  // Filtrar vehículos disponibles para la venta
  const vehiculosDisponibles = vehiculos.filter(v => v.estado === 'Disponible');

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
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50">
            <button
              onClick={() => {
                setActiveTab('venta');
                setSuccessMsg(null);
                setErrorMsg(null);
              }}
              className={`flex-1 py-3.5 text-xs font-bold text-center border-b-2 transition-all ${
                activeTab === 'venta'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Registrar Venta
            </button>
            <button
              onClick={() => {
                setActiveTab('compra');
                setSuccessMsg(null);
                setErrorMsg(null);
              }}
              className={`flex-1 py-3.5 text-xs font-bold text-center border-b-2 transition-all ${
                activeTab === 'compra'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Registrar Compra
            </button>
          </div>

          <div className="p-6">
            {/* Formulario Venta */}
            {activeTab === 'venta' && (
              <form onSubmit={handleVentaSubmit} className="space-y-4">
                {/* Vehículo a vender */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Seleccionar Vehículo</label>
                  <select
                    required
                    value={selectedVehiculoId}
                    onChange={(e) => {
                      setSelectedVehiculoId(e.target.value);
                      const veh = vehiculosDisponibles.find(v => v.id === e.target.value);
                      if (veh) setMontoVenta(veh.precio_venta);
                    }}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="">-- Seleccionar de Stock --</option>
                    {vehiculosDisponibles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.marca} {v.modelo} ({v.anio}) - Sugerido: ${v.precio_venta.toLocaleString('es-AR')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vendedor */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Empleado Responsable</label>
                  <select
                    required
                    value={selectedEmpleadoId}
                    onChange={(e) => setSelectedEmpleadoId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="">-- Seleccionar Empleado --</option>
                    {empleados.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombre} ({emp.roles?.nombre || 'Sin Rol'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monto Venta */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Monto Final Venta ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="number"
                      required
                      min="1"
                      value={montoVenta}
                      onChange={(e) => setMontoVenta(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all"
                >
                  Confirmar Venta
                </button>
              </form>
            )}

            {/* Formulario Compra */}
            {activeTab === 'compra' && (
              <form onSubmit={handleCompraSubmit} className="space-y-4">
                {/* Empleado receptor */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Empleado Responsable</label>
                  <select
                    required
                    value={selectedEmpleadoId}
                    onChange={(e) => setSelectedEmpleadoId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="">-- Seleccionar Empleado --</option>
                    {empleados.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombre} ({emp.roles?.nombre || 'Sin Rol'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specs del auto */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Marca</label>
                    <input
                      type="text"
                      required
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      placeholder="Ford"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Modelo</label>
                    <input
                      type="text"
                      required
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      placeholder="Focus"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Año</label>
                    <input
                      type="number"
                      required
                      value={anio}
                      onChange={(e) => setAnio(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Kilómetros</label>
                    <input
                      type="number"
                      required
                      value={kilometros}
                      onChange={(e) => setKilometros(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Tipo de Vehículo</label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as TipoVehiculo | '')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="">-- Seleccionar --</option>
                      <option value="SEDAN">Sedán</option>
                      <option value="SUV">SUV</option>
                      <option value="PICKUP">Pickup</option>
                      <option value="HATCHBACK">Hatchback</option>
                      <option value="COUPE">Coupé</option>
                      <option value="VAN">Van</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Combustible</label>
                    <select
                      value={combustible}
                      onChange={(e) => setCombustible(e.target.value as TipoCombustible | '')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="">-- Seleccionar --</option>
                      <option value="NAFTA">Nafta</option>
                      <option value="DIESEL">Diésel</option>
                      <option value="HIBRIDO">Híbrido</option>
                      <option value="ELECTRICO">Eléctrico</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Transmisión</label>
                    <select
                      value={transmision}
                      onChange={(e) => setTransmision(e.target.value as TipoTransmision | '')}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="">-- Seleccionar --</option>
                      <option value="MANUAL">Manual</option>
                      <option value="AUTOMATICA">Automática</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Motorización</label>
                    <input
                      type="text"
                      value={motorizacion}
                      onChange={(e) => setMotorizacion(e.target.value)}
                      placeholder="Ej: 1.4 TSI, 2.0 TDI"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Costo Compra ($)</label>
                    <input
                      type="number"
                      required
                      value={precioCompra}
                      onChange={(e) => setPrecioCompra(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Precio Venta ($)</label>
                    <input
                      type="number"
                      required
                      value={precioVenta}
                      onChange={(e) => setPrecioVenta(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <ImageUploader
                    existingImages={existingImages}
                    onExistingImagesChange={setExistingImages}
                    selectedFiles={selectedFiles}
                    onSelectedFilesChange={setSelectedFiles}
                  />
                </div>

                <button
                  type="submit"
                  disabled={txLoading || isSubmitting}
                  className="flex w-full justify-center items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50"
                >
                  {(txLoading || isSubmitting) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {uploadProgress
                    ? uploadProgress
                    : isSubmitting
                    ? 'Guardando...'
                    : 'Registrar Ingreso y Pago'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Columna de Logs de Historial */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Historial Completo de Operaciones</h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {txLoading && transacciones.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              Cargando historial de transacciones...
            </div>
          ) : transacciones.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              No se han registrado operaciones en el sistema.
            </div>
          ) : (
            <div className="overflow-x-auto text-xs text-slate-700 font-sans">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Vehículo</th>
                    <th className="px-6 py-4">Responsable</th>
                    <th className="px-6 py-4">Monto</th>
                    <th className="px-6 py-4 text-right">Ganancia Neta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transacciones.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {new Date(tx.fecha).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 font-bold ${
                            tx.tipo === 'Compra'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}
                        >
                          {tx.tipo === 'Compra' ? (
                            <ArrowDownLeft className="h-3.5 w-3.5 text-blue-500" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                          {tx.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900">
                          {tx.vehiculo ? `${tx.vehiculo.marca} ${tx.vehiculo.modelo}` : 'Vehículo Eliminado'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {tx.vehiculo ? `Año ${tx.vehiculo.anio}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.empleado?.nombre || 'Desconocido'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900">
                        ${Number(tx.monto).toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-extrabold text-emerald-600">
                        {tx.tipo === 'Venta' ? `$${Number(tx.ganancia_neta).toLocaleString('es-AR')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
