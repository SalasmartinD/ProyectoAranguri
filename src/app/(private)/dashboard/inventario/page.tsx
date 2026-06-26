'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useVehiculos } from '@/core/hooks/useVehiculos';
import { Vehiculo, VehiculoEstado, TipoVehiculo, TipoCombustible, TipoTransmision } from '@/core/types/vehiculo';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Eye,
  Sparkles
} from 'lucide-react';
import { ImageUploader } from '@/components/dashboard/ImageUploader';
import { supabase } from '@/core/services/supabase';

export default function InventarioPage() {
  const { vehiculos, loading, error, fetchVehiculos, agregarVehiculo, editarVehiculo, eliminarVehiculo } = useVehiculos();
  
  // Estados de control
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Campos del formulario
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState<number | ''>(new Date().getFullYear());
  const [precioCompra, setPrecioCompra] = useState<number | ''>('');
  const [precioVenta, setPrecioVenta] = useState<number | ''>('');
  const [kilometros, setKilometros] = useState<number | ''>('');
  const [estado, setEstado] = useState<VehiculoEstado>('Disponible');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [tipo, setTipo] = useState<TipoVehiculo | ''>('');
  const [combustible, setCombustible] = useState<TipoCombustible | ''>('');
  const [transmision, setTransmision] = useState<TipoTransmision | ''>('');
  const [motorizacion, setMotorizacion] = useState('');

  // Mensajes de éxito locales
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchVehiculos();
  }, [fetchVehiculos]);

  // Filtrar vehículos en memoria
  const filteredVehiculos = useMemo(() => {
    return vehiculos.filter((v) =>
      v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehiculos, searchTerm]);

  // Abrir formulario para agregar nuevo
  const handleOpenAdd = () => {
    setEditingId(null);
    setMarca('');
    setModelo('');
    setAnio(new Date().getFullYear());
    setPrecioCompra('');
    setPrecioVenta('');
    setKilometros('');
    setEstado('Disponible');
    setExistingImages([]);
    setSelectedFiles([]);
    setUploadProgress(null);
    setFormError(null);
    setDescripcion('');
    setTipo('');
    setCombustible('');
    setTransmision('');
    setMotorizacion('');
    setIsFormOpen(true);
  };

  // Abrir formulario para editar
  const handleOpenEdit = (v: Vehiculo) => {
    setEditingId(v.id);
    setMarca(v.marca);
    setModelo(v.modelo);
    setAnio(v.anio);
    setPrecioCompra(v.precio_compra);
    setPrecioVenta(v.precio_venta);
    setKilometros(v.kilometros);
    setEstado(v.estado);
    setExistingImages(v.imagenes || []);
    setSelectedFiles([]);
    setUploadProgress(null);
    setFormError(null);
    setDescripcion(v.descripcion || '');
    setTipo(v.tipo || '');
    setCombustible(v.combustible || '');
    setTransmision(v.transmision || '');
    setMotorizacion(v.motorizacion || '');
    setIsFormOpen(true);
  };

  // Enviar formulario (Crear o Editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setFormError(null);
    setIsSubmitting(true);
    setUploadProgress(null);

    try {
      const targetId = editingId || crypto.randomUUID();
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

      const inputData = {
        marca,
        modelo,
        anio: Number(anio || 0),
        precio_compra: Number(precioCompra || 0),
        precio_venta: Number(precioVenta || 0),
        kilometros: Number(kilometros || 0),
        estado,
        imagenes: finalImagenes,
        descripcion: descripcion.trim() || null,
        tipo: tipo || null,
        combustible: combustible || null,
        transmision: transmision || null,
        motorizacion: motorizacion.trim() || null,
      };

      if (editingId) {
        const ok = await editarVehiculo(editingId, inputData);
        if (ok) {
          setSuccessMsg('Vehículo actualizado exitosamente.');
          setIsFormOpen(false);
        }
      } else {
        const res = await agregarVehiculo({
          id: targetId,
          ...inputData,
        });
        if (res) {
          setSuccessMsg('Vehículo agregado exitosamente.');
          setIsFormOpen(false);
        }
      }
    } catch (err: any) {
      console.error('Error al guardar vehículo:', err);
      setFormError(err?.message || 'Error al procesar la subida o guardar el registro.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  // Eliminar vehículo
  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este vehículo permanentemente?')) {
      const ok = await eliminarVehiculo(id);
      if (ok) {
        setSuccessMsg('Vehículo eliminado del inventario.');
      }
    }
  };

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

      {/* Barra de Filtros e inventario */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar por marca o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {loading && vehiculos.length === 0 ? (
          <div className="py-20 flex items-center justify-center text-slate-400 text-xs gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <span>Cargando inventario...</span>
          </div>
        ) : filteredVehiculos.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            No se encontraron vehículos en el inventario.
          </div>
        ) : (
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Vehículo</th>
                  <th className="px-6 py-4">Año / KM</th>
                  <th className="px-6 py-4">Precio Compra</th>
                  <th className="px-6 py-4">Precio Venta</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehiculos.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          {v.imagenes && v.imagenes.length > 0 ? (
                            <img src={v.imagenes[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-slate-100 flex items-center justify-center text-[8px] text-slate-400 font-bold">
                              SIN FOTO
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block leading-tight">{v.marca}</span>
                          <span className="text-slate-500 text-[10px]">{v.modelo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="block text-slate-800 font-semibold">{v.anio}</span>
                      <span className="text-slate-400 text-[10px]">{v.kilometros.toLocaleString('es-AR')} km</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                      ${v.precio_compra.toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-extrabold text-indigo-700">
                      ${v.precio_venta.toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 font-bold ${
                          v.estado === 'Disponible'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : v.estado === 'Vendido'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        {v.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2.5">
                      <button
                        onClick={() => handleOpenEdit(v)}
                        className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 font-semibold"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="text-slate-600 hover:text-red-600 transition-colors inline-flex items-center gap-1 font-semibold"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal / Formulario Desplegable */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Form */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingId ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-800 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
                  <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Error al Guardar</span>
                    {formError}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Marca</label>
                  <input
                    type="text"
                    required
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    placeholder="Ej: Ford"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Modelo</label>
                  <input
                    type="text"
                    required
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="Ej: Focus"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Año</label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={anio}
                    onChange={(e) => setAnio(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Kilómetros</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={kilometros}
                    onChange={(e) => setKilometros(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Precio Compra ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Precio Venta ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Tipo de Vehículo</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoVehiculo | '')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 bg-white"
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
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 bg-white"
                  >
                    <option value="">-- Seleccionar --</option>
                    <option value="NAFTA">Nafta</option>
                    <option value="DIESEL">Diésel</option>
                    <option value="HIBRIDO">Híbrido</option>
                    <option value="ELECTRICO">Eléctrico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Transmisión</label>
                  <select
                    value={transmision}
                    onChange={(e) => setTransmision(e.target.value as TipoTransmision | '')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 bg-white"
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
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-slate-500">Estado</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as VehiculoEstado)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 bg-white"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="Pausado">Pausado</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-500 font-sans">Descripción del Vehículo (Opcional)</label>
                  <button
                    type="button"
                    disabled={!marca.trim() || !modelo.trim() || !anio || isOptimizing}
                    onClick={async () => {
                      setIsOptimizing(true);
                      setFormError(null);
                      try {
                        const response = await fetch('/api/generate-description', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ 
                            borrador: descripcion,
                            marca,
                            modelo,
                            anio,
                            combustible: combustible || undefined,
                            transmision: transmision || undefined,
                            motorizacion: motorizacion.trim() || undefined
                          }),
                        });
                        const data = await response.json();
                        
                        if (!response.ok) {
                          throw new Error(data.error || 'Error al conectar con el servidor.');
                        }
                        
                        if (data.description) {
                          setDescripcion(data.description);
                        }
                      } catch (err: any) {
                        console.error('Error optimizando descripción:', err);
                        setFormError(err?.message || 'No se pudo optimizar la descripción con Gemini.');
                      } finally {
                        setIsOptimizing(false);
                      }
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all select-none cursor-pointer ${
                      isOptimizing 
                        ? 'bg-indigo-50 text-indigo-500 animate-pulse' 
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100/70 active:scale-97'
                    } disabled:opacity-50`}
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Optimizando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        Reformular con IA
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: tapizado de cuero impecable, services oficiales al día, algunos rayones leves en paragolpes trasero, único dueño..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 bg-white"
                />
              </div>

              <div className="space-y-1">
                <ImageUploader
                  existingImages={existingImages}
                  onExistingImagesChange={setExistingImages}
                  selectedFiles={selectedFiles}
                  onSelectedFilesChange={setSelectedFiles}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {(loading || isSubmitting) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {uploadProgress
                    ? uploadProgress
                    : isSubmitting
                    ? 'Guardando...'
                    : editingId
                    ? 'Actualizar Cambios'
                    : 'Registrar Vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
