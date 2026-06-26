import { describe, it, expect } from 'vitest';
import { calcularSueldo, RemuneracionInput } from '@/core/utils/finance';

describe('Cálculo de Liquidación de Haberes (calcularSueldo)', () => {
  // Test 1: Debe verificar que un empleado con tipo 'FIJO' reciba exactamente su sueldo base (ej. 500000) y que las comisiones se sumen en 0.
  it('Debe verificar que un empleado con tipo FIJO reciba exactamente su sueldo base y las comisiones sumen 0', () => {
    const empleado: RemuneracionInput = {
      tipo_remuneracion: 'FIJO',
      sueldo_fijo: 500000,
      porcentaje_comision: 2, // No debe influir en la liquidación de tipo FIJO
    };
    
    // Incluso con ventas registradas (ej. 10,000,000), solo debe percibir su sueldo básico.
    const totalLiquidado = calcularSueldo(empleado, 10000000);
    expect(totalLiquidado).toBe(500000);
  });

  // Test 2: Debe verificar que un empleado con tipo 'COMISION' y un porcentaje del 2% reciba exactamente 400000 si el volumen de autos vendidos asignados en el mes suma 20000000, dejando el sueldo fijo en 0.
  it('Debe verificar que un empleado con tipo COMISION y 2% reciba 400000 con ventas de 20000000, dejando el sueldo fijo en 0', () => {
    const empleado: RemuneracionInput = {
      tipo_remuneracion: 'COMISION',
      sueldo_fijo: 500000, // Aunque se especifique sueldo base, al ser COMISION pura, no debe sumarse
      porcentaje_comision: 2,
    };
    
    // 2% de 20,000,000 = 400,000
    const totalLiquidado = calcularSueldo(empleado, 20000000);
    expect(totalLiquidado).toBe(400000);
  });

  // Test 3: Debe verificar que un empleado con tipo 'MIXTO' sume correctamente el sueldo base más el porcentaje exacto de sus ventas del periodo (ej: 500000 base + 2% de 10000000 = 700000).
  it('Debe verificar que un empleado con tipo MIXTO sume correctamente el sueldo base más el porcentaje de ventas (500000 base + 2% de 10000000 = 700000)', () => {
    const empleado: RemuneracionInput = {
      tipo_remuneracion: 'MIXTO',
      sueldo_fijo: 500000,
      porcentaje_comision: 2,
    };
    
    // 500,000 + 2% de 10,000,000 = 700,000
    const totalLiquidado = calcularSueldo(empleado, 10000000);
    expect(totalLiquidado).toBe(700000);
  });

  // Test 4: Caso límite. Validar que si las ventas vienen vacías o el array es nulo, el sistema devuelva el sueldo base de forma segura sin arrojar NaN o crashear.
  it('Debe verificar de forma segura los casos limites de ventas vacias, nulas, NaN o negativas retornando el sueldo base', () => {
    const empleado: RemuneracionInput = {
      tipo_remuneracion: 'MIXTO',
      sueldo_fijo: 500000,
      porcentaje_comision: 2,
    };
    
    // Ventas en 0
    expect(calcularSueldo(empleado, 0)).toBe(500000);

    // Ventas con valor NaN (por ejemplo, ante errores de casteo en arrays nulos/vacíos)
    expect(calcularSueldo(empleado, NaN)).toBe(500000);

    // Ventas con valor negativo
    expect(calcularSueldo(empleado, -150000)).toBe(500000);
  });
});
