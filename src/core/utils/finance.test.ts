import { describe, it, expect } from 'vitest';
import { 
  calcularSueldo,
  calcularLiquidacion, 
  formatCurrency,
  EmpleadoContrato, 
  VentaVehiculo 
} from './finance';

describe('Cálculo de Sueldo Individual (calcularSueldo)', () => {
  it('Debe calcular correctamente el sueldo fijo sin ventas', () => {
    const res = calcularSueldo({ tipo_remuneracion: 'FIJO', sueldo_fijo: 350000 }, 0);
    expect(res).toBe(350000);
  });

  it('Debe calcular correctamente la comisión pura', () => {
    const res = calcularSueldo({ tipo_remuneracion: 'COMISION', porcentaje_comision: 1.5 }, 10000000);
    expect(res).toBe(150000);
  });

  it('Debe calcular correctamente el esquema mixto', () => {
    const res = calcularSueldo({ tipo_remuneracion: 'MIXTO', sueldo_fijo: 200000, porcentaje_comision: 2 }, 5000000);
    expect(res).toBe(300000);
  });

  it('Debe retornar 0 para valores inválidos o negativos', () => {
    const res = calcularSueldo({ tipo_remuneracion: 'FIJO', sueldo_fijo: -100 }, -5000);
    expect(res).toBe(0);
  });
});

describe('Cálculo de Liquidación de Haberes (calcularLiquidacion)', () => {
  it('Caso 1: Empleado con sueldo fijo de $500.000 y $0 en comisiones debe recibir exactamente $500.000 netos', () => {
    const empleado: EmpleadoContrato = {
      tipo_remuneracion: 'FIJO',
      sueldo_fijo: 500000,
      porcentaje_comision: 0,
    };
    const ventas: VentaVehiculo[] = [
      { monto: 5000000 },
      { monto: 3000000 }
    ];
    const neto = calcularLiquidacion(empleado, ventas);
    expect(neto).toBe(500000);
  });

  it('Caso 2: Empleado con tipo COMISION y 2% sobre ventas debe recibir exactamente $400.000 sobre ventas de $20.000.000', () => {
    const empleado: EmpleadoContrato = {
      tipo_remuneracion: 'COMISION',
      sueldo_fijo: 0,
      porcentaje_comision: 2,
    };
    const ventas: VentaVehiculo[] = [
      { monto: 12000000 },
      { monto: 8000000 }
    ];
    const neto = calcularLiquidacion(empleado, ventas);
    expect(neto).toBe(400000);
  });

  it('Caso 3: Empleado mixto con sueldo base de $500.000 y 2% de comision debe recibir exactamente $700.000 sobre ventas de $10.000.000', () => {
    const empleado: EmpleadoContrato = {
      tipo_remuneracion: 'MIXTO',
      sueldo_fijo: 500000,
      porcentaje_comision: 2,
    };
    const ventas: VentaVehiculo[] = [
      { monto: 10000000 }
    ];
    const neto = calcularLiquidacion(empleado, ventas);
    expect(neto).toBe(700000);
  });

  it('Caso 4: Si el listado de ventas viene vacio o nulo, debe retornar el sueldo base de forma segura sin arrojar NaN', () => {
    const empleado: EmpleadoContrato = {
      tipo_remuneracion: 'MIXTO',
      sueldo_fijo: 500000,
      porcentaje_comision: 2,
    };
    expect(calcularLiquidacion(empleado, [])).toBe(500000);
    expect(calcularLiquidacion(empleado, null)).toBe(500000);
    expect(calcularLiquidacion(empleado, undefined)).toBe(500000);

    const ventasInvalidas: VentaVehiculo[] = [
      { monto: 'monto_invalido' },
      { monto: -100000 },
      { monto: NaN }
    ];
    expect(calcularLiquidacion(empleado, ventasInvalidas)).toBe(500000);
  });
});

describe('Formateo de Moneda (formatCurrency)', () => {
  it('Debe formatear números válidos como moneda', () => {
    expect(formatCurrency(500000)).toContain('500');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('Debe retornar $0 para valores nulos, indefinidos o no numéricos', () => {
    expect(formatCurrency(null)).toBe('$0');
    expect(formatCurrency(undefined)).toBe('$0');
    expect(formatCurrency(NaN)).toBe('$0');
    expect(formatCurrency('texto_invalido')).toBe('$0');
  });

  it('Debe formatear strings numéricos correctamente', () => {
    expect(formatCurrency('150000')).toContain('150');
  });
});
