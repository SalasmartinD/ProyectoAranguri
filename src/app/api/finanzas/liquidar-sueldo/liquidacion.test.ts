import { describe, it, expect } from 'vitest';
import { calcularSueldo, RemuneracionInput } from '@/core/utils/finance';

describe('Cálculo de Liquidación de Haberes (calcularSueldo)', () => {
  it('debe liquidar sueldo de empleado con remuneración FIJA pura (solo retorna el básico)', () => {
    const empleado: RemuneracionInput = {
      tipo_remuneracion: 'FIJO',
      sueldo_fijo: 150000,
      porcentaje_comision: 5,
    };
    // Incluso con ventas asignadas, el sueldo fijo puro no comisiona
    const totalLiquidado = calcularSueldo(empleado, 8000000);
    expect(totalLiquidado).toBe(150000);
  });

  it('debe liquidar sueldo de empleado con remuneración COMISION pura (calcula porcentaje sobre ventas)', () => {
    const empleado: RemuneracionInput = {
      tipo_remuneracion: 'COMISION',
      sueldo_fijo: 150000, // Aunque tenga sueldo fijo, al ser COMISION pura no se suma
      porcentaje_comision: 1.5, // 1.5% de comisión
    };
    const totalLiquidado = calcularSueldo(empleado, 10000000); // 10 millones en ventas
    expect(totalLiquidado).toBe(150000); // 1.5% de 10,000,000 = 150,000
  });

  it('debe liquidar sueldo de empleado con remuneración MIXTA (básico + comisión sobre ventas)', () => {
    const empleado: RemuneracionInput = {
      tipo_remuneracion: 'MIXTO',
      sueldo_fijo: 200000,
      porcentaje_comision: 2.0, // 2% de comisión
    };
    const totalLiquidado = calcularSueldo(empleado, 5000000); // 5 millones en ventas
    expect(totalLiquidado).toBe(300000); // 200,000 + 100,000 (2% de 5M) = 300,000
  });

  it('debe manejar de forma segura el caso límite donde el empleado no realizó ventas (comisión de 0 sin NaNs)', () => {
    const empleado: RemuneracionInput = {
      tipo_remuneracion: 'MIXTO',
      sueldo_fijo: 180000,
      porcentaje_comision: 3.0,
    };
    
    // Ventas en 0
    const totalLiquidadoCero = calcularSueldo(empleado, 0);
    expect(totalLiquidadoCero).toBe(180000);

    // Ventas con un valor inválido (NaN o negativo) devueltas a 0 de forma segura
    const totalLiquidadoNaN = calcularSueldo(empleado, NaN);
    expect(totalLiquidadoNaN).toBe(180000);

    const totalLiquidadoNegativo = calcularSueldo(empleado, -500000);
    expect(totalLiquidadoNegativo).toBe(180000);
  });

  it('debe devolver 0 si los sueldos fijos o comisiones son valores inválidos o nulos', () => {
    const empleadoNull: RemuneracionInput = {
      tipo_remuneracion: 'MIXTO',
      sueldo_fijo: null,
      porcentaje_comision: undefined,
    };
    const totalLiquidado = calcularSueldo(empleadoNull, 500000);
    expect(totalLiquidado).toBe(0);
  });
});
