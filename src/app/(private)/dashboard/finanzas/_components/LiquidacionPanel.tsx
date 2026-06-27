import React from 'react';
import { CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/core/utils/finance';

interface Empleado {
  id: string;
  nombre: string;
  sueldo_fijo: number | string | null;
  porcentaje_comision: number | string | null;
  tipo_remuneracion: 'FIJO' | 'COMISION' | 'MIXTO';
  fecha_alta?: string;
  creado_en?: string;
  fecha_ingreso?: string;
  fecha_baja?: string | null;
  roles?: {
    nombre: string;
  };
}

interface TransaccionPeriodo {
  monto: number;
  empleado_id: string;
  fecha: string;
  tipo: 'Compra' | 'Venta';
}

interface LiquidacionPanelProps {
  empleados: Empleado[];
  ventas: TransaccionPeriodo[];
  loadingEmpleados: boolean;
  loadingFinanzas: boolean;
  payingEmployeeId: string | null;
  customLiquidaciones: Record<string, number>;
  setCustomLiquidaciones: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  isSueldoLiquidado: (empleadoId: string) => boolean;
  handleLiquidarSueldo: (empleadoId: string, montoFinal: number) => Promise<void>;
  mes: number;
  anio: number;
}

function getPeriodValue(dateStr: string): number {
  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    return d.getUTCFullYear() * 12 + d.getUTCMonth();
  }
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    return parseInt(parts[0], 10) * 12 + (parseInt(parts[1], 10) - 1);
  }
  const d = new Date(dateStr);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}

export function LiquidacionPanel({
  empleados,
  ventas,
  loadingEmpleados,
  loadingFinanzas,
  payingEmployeeId,
  customLiquidaciones,
  setCustomLiquidaciones,
  isSueldoLiquidado,
  handleLiquidarSueldo,
  mes,
  anio,
}: LiquidacionPanelProps) {
  return (
    <div className="lg:col-span-2 space-y-4 min-w-0">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-900">Liquidación de Haberes y Comisiones</h2>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-w-0">
        {loadingEmpleados || loadingFinanzas ? (
          <div className="py-20 flex items-center justify-center text-slate-400 text-xs gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <span>Calculando comisiones del período...</span>
          </div>
        ) : empleados.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs font-semibold">
            No hay empleados contratados en el período seleccionado.
          </div>
        ) : (
          <div className="overflow-x-auto text-xs text-slate-700 font-sans">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Empleado</th>
                  <th className="px-6 py-4">Remuneración</th>
                  <th className="px-6 py-4 text-center">Ventas Mes</th>
                  <th className="px-6 py-4 text-right">Comisión</th>
                  <th className="px-6 py-4 text-right">Total a Liquidar</th>
                  <th className="px-6 py-4 text-right">Estado / Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empleados.map((emp) => {
                  const ventasEmp = ventas.filter((v) => v.empleado_id === emp.id);
                  const ventasCount = ventasEmp.length;
                  const totalMontoVentas = ventasEmp.reduce((acc, v) => acc + Number(v.monto), 0);
                  const comisionCalculada = (totalMontoVentas * Number(emp.porcentaje_comision || 0)) / 100;

                  let totalLiquidar = 0;
                  if (emp.tipo_remuneracion === 'FIJO') {
                    totalLiquidar = Number(emp.sueldo_fijo || 0);
                  } else if (emp.tipo_remuneracion === 'COMISION') {
                    totalLiquidar = comisionCalculada;
                  } else if (emp.tipo_remuneracion === 'MIXTO') {
                    totalLiquidar = Number(emp.sueldo_fijo || 0) + comisionCalculada;
                  }

                  const liquidado = isSueldoLiquidado(emp.id);
                  const altaStr = emp.fecha_alta || emp.creado_en || emp.fecha_ingreso;
                  const altaPeriod = altaStr ? getPeriodValue(altaStr) : 0;
                  const selectedPeriod = anio * 12 + (mes - 1);
                  const esAnteriorAlIngreso = selectedPeriod < altaPeriod;

                  const customValue = customLiquidaciones[emp.id];
                  const montoFinal = customValue !== undefined ? customValue : totalLiquidar;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900">{emp.nombre}</div>
                        <div className="text-[10px] text-slate-400">{emp.roles?.nombre || 'Sin Rol'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{emp.tipo_remuneracion}</div>
                        {emp.tipo_remuneracion !== 'COMISION' && (
                          <div className="text-[10px] text-slate-400">Fijo: {formatCurrency(emp.sueldo_fijo)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-slate-800">
                        {ventasCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-slate-700">
                        {formatCurrency(comisionCalculada)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-indigo-500 font-bold text-xs">$</span>
                          <input
                            type="number"
                            disabled={liquidado || esAnteriorAlIngreso || totalLiquidar <= 0 || payingEmployeeId !== null}
                            value={montoFinal}
                            onChange={(e) => {
                              const val = e.target.value === '' ? 0 : Number(e.target.value);
                              setCustomLiquidaciones(prev => ({
                                ...prev,
                                [emp.id]: val
                              }));
                            }}
                            className="w-24 text-right font-black text-indigo-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-100 disabled:bg-transparent disabled:border-transparent disabled:text-indigo-700 disabled:shadow-none"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {liquidado ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-100 select-none" title="El período ya fue pagado">
                            <CheckCircle className="h-3 w-3 text-emerald-500" />
                            Liquidado
                          </span>
                        ) : esAnteriorAlIngreso ? (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 border border-amber-100 select-none" title="El mes seleccionado es anterior al ingreso del empleado">
                            Previo al Ingreso
                          </span>
                        ) : totalLiquidar <= 0 ? (
                          <span className="inline-flex items-center rounded-md bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-400 border border-slate-100 select-none">
                            Sin haberes
                          </span>
                        ) : (
                          <button
                            disabled={payingEmployeeId !== null}
                            onClick={() => handleLiquidarSueldo(emp.id, montoFinal)}
                            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-[10px] font-extrabold text-white shadow hover:bg-indigo-700 active:scale-97 transition-all cursor-pointer disabled:opacity-50"
                          >
                            {payingEmployeeId === emp.id ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Pagando...
                              </>
                            ) : (
                              'Registrar Pago'
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
