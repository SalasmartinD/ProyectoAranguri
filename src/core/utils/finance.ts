export interface RemuneracionInput {
  tipo_remuneracion: 'FIJO' | 'COMISION' | 'MIXTO';
  sueldo_fijo?: number | string | null;
  porcentaje_comision?: number | string | null;
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
