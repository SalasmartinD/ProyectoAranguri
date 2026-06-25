'use client';

import React, { useEffect, useState } from 'react';
import { useEmpleados } from '@/core/hooks/useEmpleados';
import { EmpleadoRol } from '@/core/types/empleado';
import { 
  Users, 
  Plus, 
  TrendingUp, 
  Award, 
  DollarSign, 
  X, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  ShieldAlert
} from 'lucide-react';

export default function EmpleadosPage() {
  const { empleados, loading, error, kpis, fetchEmpleados, agregarEmpleado, calcularKPIs } = useEmpleados();

  // Control del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<EmpleadoRol>('Vendedor');
  const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().split('T')[0]);

  // Alertas locales
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchEmpleados();
    calcularKPIs();
  }, [fetchEmpleados, calcularKPIs]);

  // Manejar adición de empleado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    if (!nombre.trim()) return;

    const res = await agregarEmpleado({
      nombre: nombre.trim(),
      rol,
      fecha_ingreso: fechaIngreso,
      activo: true,
    });

    if (res) {
      setSuccessMsg('Empleado agregado correctamente al equipo.');
      setIsModalOpen(false);
      setNombre('');
      setRol('Vendedor');
      setFechaIngreso(new Date().toISOString().split('T')[0]);
      calcularKPIs(); // Recalcular KPIs incluyendo el nuevo
    }
  };

  // Encontrar el "empleado del mes" (el que tenga mayor monto de ventas)
  const empleadoEstrella = [...kpis].sort((a, b) => b.montoTotalMes - a.montoTotalMes)[0];

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Equipo y Desempeño</h1>
          <p className="text-slate-500 text-sm">Monitorea KPIs de ventas mensuales, roles e ingresos al equipo.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Registrar Empleado
        </button>
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-center gap-2.5 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-2.5 text-sm">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Error de Operación</span>
            {error}
          </div>
        </div>
      )}

      {/* Tarjeta Empleado Estrella del Mes */}
      {empleadoEstrella && empleadoEstrella.ventasMes > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl" />
          <div className="space-y-2 relative">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
              <Award className="h-3.5 w-3.5" />
              Líder en Ventas del Mes
            </span>
            <h2 className="text-xl font-extrabold">{empleadoEstrella.nombre}</h2>
            <p className="text-xs text-slate-400">
              Ha concretado <span className="text-white font-bold">{empleadoEstrella.ventasMes} ventas</span> este mes, generando un volumen comercial de <span className="text-white font-bold">${empleadoEstrella.montoTotalMes.toLocaleString('es-AR')}</span>.
            </p>
          </div>
          <div className="bg-indigo-600/30 border border-indigo-500/20 rounded-2xl p-4 flex gap-4 text-xs font-semibold shrink-0">
            <div>
              <span className="text-indigo-300 block mb-0.5 text-[10px]">Ganancia Neta Mes</span>
              <span className="text-lg font-black text-emerald-400">${empleadoEstrella.gananciaNetaMes.toLocaleString('es-AR')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Listado y KPIs */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Tabla/Lista de Empleados */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Equipo Concesionaria</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 font-sans">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Fecha Ingreso</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empleados.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900">
                      {emp.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emp.rol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(emp.fecha_ingreso).toLocaleDateString('es-AR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 font-bold ${
                          emp.activo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                        }`}
                      >
                        {emp.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Desglose de KPIs */}
        <div className="md:col-span-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Ventas del Mes Actual</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {kpis.map((kpi) => (
              <div key={kpi.empleadoId} className="p-5 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 text-xs block">{kpi.nombre}</span>
                  <span className="text-[10px] text-slate-400 block">{kpi.ventasMes} ventas concretadas</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-slate-900 block text-xs">${kpi.montoTotalMes.toLocaleString('es-AR')}</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">Profit: +${kpi.gananciaNetaMes.toLocaleString('es-AR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Registrar Empleado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h3 className="font-bold text-slate-900 text-sm">Registrar Nuevo Empleado</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Rol</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as EmpleadoRol)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="Vendedor">Vendedor</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Gerente">Gerente</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Fecha de Ingreso</label>
                <input
                  type="date"
                  required
                  value={fechaIngreso}
                  onChange={(e) => setFechaIngreso(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50"
                >
                  {loading ? 'Agregando...' : 'Registrar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
