export interface RemuneracionInput {
  tipo_remuneracion: 'FIJO' | 'COMISION' | 'MIXTO';
  sueldo_fijo?: number | string | null;
  porcentaje_comision?: number | string | null;
}

export interface EmpleadoContrato {
  tipo_remuneracion: 'FIJO' | 'COMISION' | 'MIXTO';
  sueldo_fijo?: number | string | null;
  porcentaje_comision?: number | string | null;
}

export interface VentaVehiculo {
  monto: number | string;
}

/**
 * Calcula el salario del mes basándose en el tipo de remuneración y las ventas totales.
 * Asegura que no se generen valores nulos o NaN.
 */
export function calcularSueldo(empleado: RemuneracionInput, totalVentas: number): number {
  const sueldoFijo = Number(empleado.sueldo_fijo || 0);
  const pctComision = Number(empleado.porcentaje_comision || 0);
  const ventas = isNaN(totalVentas) || totalVentas < 0 ? 0 : totalVentas;

  const comision = (ventas * pctComision) / 100;

  let totalLiquidado = 0;
  if (empleado.tipo_remuneracion === 'FIJO') {
    totalLiquidado = sueldoFijo;
  } else if (empleado.tipo_remuneracion === 'COMISION') {
    totalLiquidado = comision;
  } else if (empleado.tipo_remuneracion === 'MIXTO') {
    totalLiquidado = sueldoFijo + comision;
  }

  return isNaN(totalLiquidado) || totalLiquidado < 0 ? 0 : totalLiquidado;
}

/**
 * Calcula la liquidación de haberes a partir de un listado de ventas de forma segura y resiliente.
 */
export function calcularLiquidacion(
  empleado: EmpleadoContrato,
  ventas: VentaVehiculo[] | null | undefined
): number {
  const totalVentas = (ventas || []).reduce((sum, s) => {
    if (!s || s.monto === undefined || s.monto === null) return sum;
    const val = Number(s.monto);
    return sum + (isNaN(val) || val < 0 ? 0 : val);
  }, 0);

  return calcularSueldo(empleado, totalVentas);
}

/**
 * Formatea un número como moneda ARS ($).
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === undefined || value === null) return '$0';
  const num = Number(value);
  if (isNaN(num)) return '$0';
  return `$${num.toLocaleString('es-AR')}`;
}
