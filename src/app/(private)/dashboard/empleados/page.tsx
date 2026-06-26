'use client';

import React, { useEffect, useState } from 'react';
import { useEmpleados } from '@/core/hooks/useEmpleados';
import { TipoRemuneracion, Empleado, Role } from '@/core/types/empleado';
import { supabase } from '@/core/services/supabase';
import { 
  Users, 
  Plus, 
  TrendingUp, 
  Award, 
  X, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  ShieldAlert,
  Edit,
  UserX
} from 'lucide-react';

export default function EmpleadosPage() {
  const { empleados, loading, error, kpis, fetchEmpleados, agregarEmpleado, editarEmpleado, calcularKPIs } = useEmpleados();

  // Control del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Control de baja de empleado
  const [bajaEmpleadoId, setBajaEmpleadoId] = useState<string | null>(null);
  const [bajaEmpleadoNombre, setBajaEmpleadoNombre] = useState<string>('');
  
  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [rolId, setRolId] = useState<string>('');
  const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().split('T')[0]);
  const [activo, setActivo] = useState(true);
  const [tipoRemuneracion, setTipoRemuneracion] = useState<TipoRemuneracion>('FIJO');
  const [sueldoFijo, setSueldoFijo] = useState<number | ''>('');
  const [porcentajeComision, setPorcentajeComision] = useState<number | ''>('');
  const [diaCobro, setDiaCobro] = useState<number | ''>(5);

  // Alertas locales
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Roles cargados desde la base de datos
  const [rolesMaster, setRolesMaster] = useState<Role[]>([]);

  const fetchRolesMaster = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('nombre', { ascending: true });
      if (error) throw error;
      setRolesMaster(data || []);
      if (data && data.length > 0 && !rolId) {
        setRolId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  }, [rolId]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (!active) return;
      fetchEmpleados();
      calcularKPIs();
      fetchRolesMaster();
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchEmpleados, calcularKPIs, fetchRolesMaster]);

  // Abrir modal para agregar
  const handleOpenAdd = () => {
    setEditingId(null);
    setNombre('');
    setRolId(rolesMaster.length > 0 ? rolesMaster[0].id : '');
    setFechaIngreso(new Date().toISOString().split('T')[0]);
    setActivo(true);
    setTipoRemuneracion('FIJO');
    setSueldoFijo('');
    setPorcentajeComision('');
    setDiaCobro(5);
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (emp: Empleado) => {
    setEditingId(emp.id);
    setNombre(emp.nombre);
    setRolId(emp.rol_id || '');
    setFechaIngreso(emp.fecha_ingreso ? new Date(emp.fecha_ingreso).toISOString().split('T')[0] : '');
    setActivo(emp.activo);
    setTipoRemuneracion(emp.tipo_remuneracion || 'FIJO');
    setSueldoFijo(emp.sueldo_fijo !== undefined && emp.sueldo_fijo !== null ? emp.sueldo_fijo : '');
    setPorcentajeComision(emp.porcentaje_comision !== undefined && emp.porcentaje_comision !== null ? emp.porcentaje_comision : '');
    setDiaCobro(emp.dia_cobro !== undefined && emp.dia_cobro !== null ? emp.dia_cobro : 5);
    setIsModalOpen(true);
  };

  // Manejar envío de formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    if (!nombre.trim() || !rolId) return;

    const inputData = {
      nombre: nombre.trim(),
      rol_id: rolId,
      fecha_ingreso: fechaIngreso,
      activo,
      tipo_remuneracion: tipoRemuneracion,
      sueldo_fijo: tipoRemuneracion !== 'COMISION' ? Number(sueldoFijo || 0) : 0,
      porcentaje_comision: tipoRemuneracion !== 'FIJO' ? Number(porcentajeComision || 0) : 0,
      dia_cobro: Number(diaCobro || 5),
      ...(activo ? { fecha_baja: null } : {})
    };

    if (editingId) {
      const ok = await editarEmpleado(editingId, inputData);
      if (ok) {
        setSuccessMsg('Empleado actualizado correctamente.');
        setIsModalOpen(false);
        calcularKPIs();
      }
    } else {
      const res = await agregarEmpleado(inputData);
      if (res) {
        setSuccessMsg('Empleado registrado correctamente.');
        setIsModalOpen(false);
        calcularKPIs();
      }
    }
  };

  // Confirmar y procesar la baja del empleado
  const confirmDarDeBaja = async () => {
    if (!bajaEmpleadoId) return;
    setSuccessMsg(null);
    const hoy = new Date().toISOString();
    const ok = await editarEmpleado(bajaEmpleadoId, { fecha_baja: hoy, activo: false });
    if (ok) {
      setSuccessMsg(`Empleado "${bajaEmpleadoNombre}" dado de baja correctamente.`);
      calcularKPIs();
    }
    setBajaEmpleadoId(null);
  };

  // Encontrar el "empleado del mes"
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
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 transition-colors shrink-0 cursor-pointer"
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
                  <th className="px-6 py-4">Esquema</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {empleados.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900">
                      {emp.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {emp.roles?.nombre || 'Sin Rol'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(emp.fecha_ingreso).toLocaleDateString('es-AR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                      {emp.tipo_remuneracion || 'FIJO'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emp.fecha_baja ? (
                        <span className="inline-flex items-center rounded-md px-2 py-0.5 font-bold bg-amber-50 text-amber-700 border border-amber-100" title={`Fecha de baja: ${new Date(emp.fecha_baja).toLocaleDateString('es-AR')}`}>
                          De Baja
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 font-bold ${
                            emp.activo
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}
                        >
                          {emp.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer"
                          title="Editar Empleado"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {!emp.fecha_baja && (
                          <button
                            onClick={() => {
                              setBajaEmpleadoId(emp.id);
                              setBajaEmpleadoNombre(emp.nombre);
                            }}
                            className="text-rose-600 hover:text-rose-800 transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer"
                            title="Dar de Baja"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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

      {/* Modal Registrar/Editar Empleado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingId ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Rol</label>
                  <select
                    value={rolId}
                    onChange={(e) => setRolId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white font-semibold"
                  >
                    {rolesMaster.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Tipo Remuneración</label>
                  <select
                    value={tipoRemuneracion}
                    onChange={(e) => setTipoRemuneracion(e.target.value as TipoRemuneracion)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white font-semibold"
                  >
                    <option value="FIJO">Fijo</option>
                    <option value="COMISION">Comisión</option>
                    <option value="MIXTO">Mixto</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Día de Cobro (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={diaCobro}
                    onChange={(e) => setDiaCobro(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {tipoRemuneracion !== 'COMISION' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Sueldo Fijo ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={sueldoFijo}
                    onChange={(e) => setSueldoFijo(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej: 500000"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              )}

              {tipoRemuneracion !== 'FIJO' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Porcentaje Comisión (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={porcentajeComision}
                    onChange={(e) => setPorcentajeComision(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej: 1.5"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              )}

              {editingId && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="activo" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    Empleado Activo (aparece en las listas)
                  </label>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (editingId ? 'Guardando...' : 'Registrando...') : (editingId ? 'Guardar Cambios' : 'Registrar Empleado')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Baja */}
      {bajaEmpleadoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <ShieldAlert className="h-6 w-6 shrink-0" />
                <h3 className="font-extrabold text-slate-900 text-sm">Confirmar Baja de Empleado</h3>
              </div>
              
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                ¿Estás seguro de que deseas dar de baja a <span className="font-extrabold text-slate-800">{bajaEmpleadoNombre}</span>?
                Su fecha de baja se registrará con la fecha de hoy y se desactivará de las listas activas, manteniendo su historial comercial.
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setBajaEmpleadoId(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDarDeBaja}
                  disabled={loading}
                  className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Procesando...' : 'Confirmar Baja'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
