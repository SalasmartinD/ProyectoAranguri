import { describe, it, expect } from 'vitest';
import { 
  calcularLiquidacion, 
  EmpleadoContrato, 
  VentaVehiculo 
} from '@/core/utils/finance';

describe('Cálculo de Liquidación de Haberes (calcularLiquidacion)', () => {
  // Caso 1 (Sueldo Fijo): Debe validar que un empleado con sueldo fijo de $500.000 y $0 en comisiones reciba exactamente $500.000 netos.
  it('Caso 1: Empleado con sueldo fijo de $500.000 y $0 en comisiones debe recibir exactamente $500.000 netos', () => {
    const empleado: EmpleadoContrato = {
      tipo_remuneracion: 'FIJO',
      sueldo_fijo: 500000,
      porcentaje_comision: 0,
    };
    
    // Lista de ventas del mes (incluso si hay ventas registradas, la comisión es del 0%)
    const ventas: VentaVehiculo[] = [
      { monto: 5000000 },
      { monto: 3000000 }
    ];

    const neto = calcularLiquidacion(empleado, ventas);
    expect(neto).toBe(500000);
  });

  // Caso 2 (Solo Comisión): Debe validar que un empleado que cobra únicamente comisión (ej. 2% sobre las ventas) reciba exactamente $400.000 si acumuló un volumen de ventas de $20.000.000 en el mes.
  it('Caso 2: Empleado con tipo COMISION y 2% sobre ventas debe recibir exactamente $400.000 sobre ventas de $20.000.000', () => {
    const empleado: EmpleadoContrato = {
      tipo_remuneracion: 'COMISION',
      sueldo_fijo: 0,
      porcentaje_comision: 2,
    };

    const ventas: VentaVehiculo[] = [
      { monto: 12000000 },
      { monto: 8000000 } // Total ventas = $20.000.000
    ];

    const neto = calcularLiquidacion(empleado, ventas);
    expect(neto).toBe(400000); // 2% de 20.000.000 = 400.000
  });

  // Caso 3 (Esquema Mixto): Debe validar la suma correcta de un sueldo base de $500.000 más el 2% de comisión sobre un total de ventas de $10.000.000, dando como resultado neto exactamente $700.000.
  it('Caso 3: Empleado mixto con sueldo base de $500.000 y 2% de comision debe recibir exactamente $700.000 sobre ventas de $10.000.000', () => {
    const empleado: EmpleadoContrato = {
      tipo_remuneracion: 'MIXTO',
      sueldo_fijo: 500000,
      porcentaje_comision: 2,
    };

    const ventas: VentaVehiculo[] = [
      { monto: 10000000 } // 2% de 10.000.000 = 200.000
    ];

    const neto = calcularLiquidacion(empleado, ventas);
    expect(neto).toBe(700000); // 500.000 base + 200.000 comision = 700.000
  });

  // Caso 4 (Resiliencia/Bordes): Si el listado de ventas viene vacío ([]) o es nulo, el sistema debe retornar el sueldo base correspondiente de forma segura sin arrojar NaN ni romper la ejecución.
  it('Caso 4: Si el listado de ventas viene vacio o nulo, debe retornar el sueldo base de forma segura sin arrojar NaN', () => {
    const empleado: EmpleadoContrato = {
      tipo_remuneracion: 'MIXTO',
      sueldo_fijo: 500000,
      porcentaje_comision: 2,
    };

    // Listado vacío []
    const netoVacio = calcularLiquidacion(empleado, []);
    expect(netoVacio).toBe(500000);

    // Listado nulo
    const netoNulo = calcularLiquidacion(empleado, null);
    expect(netoNulo).toBe(500000);

    // Listado undefined
    const netoUndefined = calcularLiquidacion(empleado, undefined);
    expect(netoUndefined).toBe(500000);

    // Listado con montos invalidos (ej. NaN o string de texto)
    const ventasInvalidas: VentaVehiculo[] = [
      { monto: 'monto_invalido' },
      { monto: -100000 }, // Negativos deben computar como 0
      { monto: NaN }
    ];
    const netoInvalido = calcularLiquidacion(empleado, ventasInvalidas);
    expect(netoInvalido).toBe(500000);
  });
});
