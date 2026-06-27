import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/core/services/supabase';
import { useOperaciones } from '@/core/hooks/useOperaciones';
import { useVehiculos } from '@/core/hooks/useVehiculos';
import { useEmpleados } from '@/core/hooks/useEmpleados';
import { VehiculoInput, TipoVehiculo, TipoCombustible, TipoTransmision } from '@/core/types/vehiculo';

export function useOperacionesForm() {
  const { transacciones, loading: txLoading, fetchTransacciones, registrarCompra, registrarVenta } = useOperaciones();
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

  // Filtrar vehículos disponibles para la venta
  const vehiculosDisponibles = useMemo(() => {
    return vehiculos.filter(v => v.estado === 'Disponible');
  }, [vehiculos]);

  // Manejar envío de venta
  const handleVentaSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [selectedVehiculoId, selectedEmpleadoId, montoVenta, registrarVenta, fetchVehiculos]);

  // Manejar envío de compra
  const handleCompraSubmit = useCallback(async (e: React.FormEvent) => {
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
    } catch (err: unknown) {
      console.error('Error al registrar la compra:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Error al subir las imágenes o registrar el vehículo.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  }, [
    selectedEmpleadoId,
    marca,
    modelo,
    anio,
    precioCompra,
    precioVenta,
    kilometros,
    selectedFiles,
    existingImages,
    tipo,
    combustible,
    transmision,
    motorizacion,
    registrarCompra,
    fetchVehiculos,
  ]);

  return {
    transacciones,
    txLoading,
    fetchTransacciones,
    vehiculos,
    fetchVehiculos,
    empleados,
    fetchEmpleados,
    vehiculosDisponibles,

    // Estados de control y mensajes
    activeTab,
    setActiveTab,
    selectedEmpleadoId,
    setSelectedEmpleadoId,
    successMsg,
    setSuccessMsg,
    errorMsg,
    setErrorMsg,

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
  };
}
