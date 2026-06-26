'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/core/services/supabase';
import { 
  Settings, 
  Shield, 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  X, 
  AlertCircle, 
  CheckCircle
} from 'lucide-react';

interface Role {
  id: string;
  nombre: string;
  creado_en: string;
}

interface CategoriaCaja {
  id: string;
  nombre: string;
  tipo_permitido: 'INGRESO' | 'EGRESO' | 'AMBOS';
  creado_en: string;
}

export default function ConfiguracionPage() {
  // Datos
  const [roles, setRoles] = useState<Role[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCaja[]>([]);
  
  // Loading
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // Alertas
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modales y Formularios
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleNombre, setRoleNombre] = useState('');
  const [isSavingRole, setIsSavingRole] = useState(false);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoriaCaja | null>(null);
  const [catNombre, setCatNombre] = useState('');
  const [catTipo, setCatTipo] = useState<'INGRESO' | 'EGRESO' | 'AMBOS'>('EGRESO');
  const [isSavingCat, setIsSavingCat] = useState(false);

  // Fetch Roles
  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/configuracion/roles', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al obtener roles.');
      setRoles(data || []);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Error al obtener roles.');
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  // Fetch Categorías
  const fetchCategorias = useCallback(async () => {
    setLoadingCategorias(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/configuracion/categorias-caja', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al obtener categorías.');
      setCategorias(data || []);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Error al obtener categorías.');
    } finally {
      setLoadingCategorias(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      await Promise.resolve();
      if (!active) return;
      fetchRoles();
      fetchCategorias();
    };
    loadData();
    return () => {
      active = false;
    };
  }, [fetchRoles, fetchCategorias]);

  // Guardar/Editar Rol
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleNombre.trim()) return;

    setIsSavingRole(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const url = editingRole 
        ? `/api/configuracion/roles/${editingRole.id}` 
        : '/api/configuracion/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ nombre: roleNombre }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al guardar el rol.');

      setSuccessMsg(editingRole ? 'Rol actualizado correctamente.' : 'Rol creado correctamente.');
      setIsRoleModalOpen(false);
      setRoleNombre('');
      setEditingRole(null);
      await fetchRoles();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar el rol.');
    } finally {
      setIsSavingRole(false);
    }
  };

  // Guardar/Editar Categoría
  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNombre.trim()) return;

    setIsSavingCat(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const url = editingCat 
        ? `/api/configuracion/categorias-caja/${editingCat.id}` 
        : '/api/configuracion/categorias-caja';
      const method = editingCat ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ nombre: catNombre, tipo_permitido: catTipo }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al guardar la categoría.');

      setSuccessMsg(editingCat ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.');
      setIsCatModalOpen(false);
      setCatNombre('');
      setEditingCat(null);
      await fetchCategorias();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar la categoría.');
    } finally {
      setIsSavingCat(false);
    }
  };

  // Eliminar Rol
  const handleDeleteRole = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el rol "${nombre}"?`)) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/configuracion/roles/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al eliminar el rol.');

      setSuccessMsg('Rol eliminado correctamente.');
      await fetchRoles();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Error al eliminar el rol.');
    }
  };

  // Eliminar Categoría
  const handleDeleteCat = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${nombre.replace(/_/g, ' ')}"?`)) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`/api/configuracion/categorias-caja/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al eliminar la categoría.');

      setSuccessMsg('Categoría eliminada correctamente.');
      await fetchCategorias();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Error al eliminar la categoría.');
    }
  };

  // Abrir Modal Rol
  const openRoleModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleNombre(role.nombre);
    } else {
      setEditingRole(null);
      setRoleNombre('');
    }
    setIsRoleModalOpen(true);
  };

  // Abrir Modal Categoría
  const openCatModal = (cat?: CategoriaCaja) => {
    if (cat) {
      setEditingCat(cat);
      setCatNombre(cat.nombre);
      setCatTipo(cat.tipo_permitido);
    } else {
      setEditingCat(null);
      setCatNombre('');
      setCatTipo('EGRESO');
    }
    setIsCatModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-600 animate-spin-slow" />
          Ajustes del Sistema
        </h1>
        <p className="text-slate-500 text-sm">Gestiona las tablas maestras de roles de equipo y categorías de caja.</p>
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 flex items-center gap-2.5 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 flex items-start gap-2.5 text-sm">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Error de Operación</span>
            {errorMsg}
          </div>
        </div>
      )}

      {/* Paneles de Ajustes */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Panel Roles */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">Roles del Equipo</h3>
            </div>
            <button
              onClick={() => openRoleModal()}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Nuevo Rol
            </button>
          </div>

          <div className="flex-1 overflow-x-auto text-xs text-slate-700 font-sans">
            {loadingRoles ? (
              <div className="py-20 flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                <span>Cargando roles...</span>
              </div>
            ) : roles.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                No hay roles configurados en el sistema.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Nombre del Rol</th>
                    <th className="px-6 py-4">Creado en</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roles.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900">
                        {r.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-semibold">
                        {new Date(r.creado_en).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openRoleModal(r)}
                            className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer"
                            title="Editar Rol"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(r.id, r.nombre)}
                            className="text-rose-600 hover:text-rose-800 transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer"
                            title="Eliminar Rol"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Panel Categorías */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">Categorías de Caja</h3>
            </div>
            <button
              onClick={() => openCatModal()}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Nueva Categoría
            </button>
          </div>

          <div className="flex-1 overflow-x-auto text-xs text-slate-700 font-sans">
            {loadingCategorias ? (
              <div className="py-20 flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                <span>Cargando categorías...</span>
              </div>
            ) : categorias.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                No hay categorías configuradas en el sistema.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Nombre de Categoría</th>
                    <th className="px-6 py-4">Tipo Permitido</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categorias.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900">
                        {c.nombre.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 font-bold border ${
                            c.tipo_permitido === 'INGRESO'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : c.tipo_permitido === 'EGRESO'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}
                        >
                          {c.tipo_permitido}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openCatModal(c)}
                            className="text-slate-600 hover:text-indigo-600 transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer"
                            title="Editar Categoría"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCat(c.id, c.nombre)}
                            className="text-rose-600 hover:text-rose-800 transition-colors inline-flex items-center gap-1 font-semibold cursor-pointer"
                            title="Eliminar Categoría"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal Roles */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre del Rol</label>
                <input
                  type="text"
                  required
                  value={roleNombre}
                  onChange={(e) => setRoleNombre(e.target.value)}
                  placeholder="Ej: Gerente de Ventas, Mecánico..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingRole}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingRole && <Loader2 className="h-3 w-3 animate-spin" />}
                  {editingRole ? 'Guardar Cambios' : 'Crear Rol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Categorías */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingCat ? 'Editar Categoría' : 'Crear Nueva Categoría'}
              </h3>
              <button
                onClick={() => setIsCatModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCat} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre de la Categoría</label>
                <input
                  type="text"
                  required
                  value={catNombre}
                  onChange={(e) => setCatNombre(e.target.value)}
                  placeholder="Ej: Repuestos, Publicidad, Limpieza..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipo de Movimiento Permitido</label>
                <select
                  value={catTipo}
                  onChange={(e) => setCatTipo(e.target.value as 'INGRESO' | 'EGRESO' | 'AMBOS')}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 bg-white font-semibold"
                >
                  <option value="EGRESO">Egreso (Gasto)</option>
                  <option value="INGRESO">Ingreso (Entrada)</option>
                  <option value="AMBOS">Ambos (Ingreso / Egreso)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-98 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCat}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingCat && <Loader2 className="h-3 w-3 animate-spin" />}
                  {editingCat ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
