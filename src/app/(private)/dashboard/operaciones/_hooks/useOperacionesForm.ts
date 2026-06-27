import { useState, useCallback, useMemo } from 'react';
import { useOperaciones } from '@/core/hooks/useOperaciones';
import { useVehiculos } from '@/core/hooks/useVehiculos';
import { useEmpleados } from '@/core/hooks/useEmpleados';

export function useOperacionesForm() {
  const { transacciones, loading: txLoading, fetchTransacciones, registrarVenta } = useOperaciones();
  const { vehiculos, fetchVehiculos } = useVehiculos();
  const { empleados, fetchEmpleados } = useEmpleados();

  // Estados para los formularios
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulario Venta
  const [selectedVehiculoId, setSelectedVehiculoId] = useState('');
  const [montoVenta, setMontoVenta] = useState<number | ''>('');

  // Filtrar vehículos disponibles para la venta
  const vehiculosDisponibles = useMemo(() => {
    return vehiculos.filter(v => v.estado === 'Disponible');
  }, [vehiculos]);

  // Filtrar empleados activos (baja lógica)
  const empleadosActivos = useMemo(() => {
    return empleados.filter(emp => emp.fecha_baja === null);
  }, [empleados]);

  // Manejar envío de venta
  const handleVentaSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validar empleado activo
    const empActivo = empleadosActivos.find(emp => emp.id === selectedEmpleadoId);
    if (!empActivo) {
      setErrorMsg('El empleado seleccionado no es válido o está de baja.');
      return;
    }

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
  }, [selectedVehiculoId, selectedEmpleadoId, montoVenta, registrarVenta, fetchVehiculos, empleadosActivos]);

  return {
    transacciones,
    txLoading,
    fetchTransacciones,
    vehiculos,
    fetchVehiculos,
    empleados,
    fetchEmpleados,
    vehiculosDisponibles,
    empleadosActivos,

    // Estados de control y mensajes
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
  };
}
