import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/core/services/supabase';
import { useVehiculos } from '@/core/hooks/useVehiculos';
import { Vehiculo, VehiculoEstado, TipoVehiculo, TipoCombustible, TipoTransmision } from '@/core/types/vehiculo';

export function useInventario() {
  const {
    vehiculos,
    loading,
    error,
    fetchVehiculos,
    agregarVehiculo,
    editarVehiculo,
    eliminarVehiculo,
  } = useVehiculos();

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

  // Filtrar vehículos en memoria
  const filteredVehiculos = useMemo(() => {
    return vehiculos.filter(
      (v) =>
        v.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehiculos, searchTerm]);

  // Abrir formulario para agregar nuevo
  const handleOpenAdd = useCallback(() => {
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
  }, []);

  // Abrir formulario para editar
  const handleOpenEdit = useCallback((v: Vehiculo) => {
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
  }, []);

  // Enviar formulario (Crear o Editar)
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
    } catch (err: unknown) {
      console.error('Error al guardar vehículo:', err);
      setFormError(err instanceof Error ? err.message : 'Error al procesar la subida o guardar el registro.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  }, [
    editingId,
    selectedFiles,
    existingImages,
    marca,
    modelo,
    anio,
    precioCompra,
    precioVenta,
    kilometros,
    estado,
    descripcion,
    tipo,
    combustible,
    transmision,
    motorizacion,
    agregarVehiculo,
    editarVehiculo,
  ]);

  // Eliminar vehículo
  const handleDelete = useCallback(async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este vehículo permanentemente?')) {
      const ok = await eliminarVehiculo(id);
      if (ok) {
        setSuccessMsg('Vehículo eliminado del inventario.');
      }
    }
  }, [eliminarVehiculo]);

  // Optimizar descripción con Gemini IA
  const handleOptimizeDescription = useCallback(async () => {
    if (!marca.trim() || !modelo.trim() || !anio) return;
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
          motorizacion: motorizacion.trim() || undefined,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al conectar con el servidor.');
      }

      if (data.description) {
        setDescripcion(data.description);
      }
    } catch (err: unknown) {
      console.error('Error optimizando descripción:', err);
      setFormError(err instanceof Error ? err.message : 'No se pudo optimizar la descripción con Gemini.');
    } finally {
      setIsOptimizing(false);
    }
  }, [marca, modelo, anio, combustible, transmision, motorizacion, descripcion]);

  return {
    vehiculos: filteredVehiculos,
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
    setFormError,
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
  };
}
