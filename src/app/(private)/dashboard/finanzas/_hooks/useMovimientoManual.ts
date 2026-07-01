import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/core/services/supabase';

export interface CategoriaCaja {
  id: string;
  nombre: string;
  tipo_permitido: 'INGRESO' | 'EGRESO' | 'AMBOS';
  creado_en: string;
}

export function useMovimientoManual(onSuccess: () => Promise<void>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualMonto, setManualMonto] = useState<string>('');
  const [manualTipo, setManualTipo] = useState<'INGRESO' | 'EGRESO'>('EGRESO');
  const [manualCategoriaId, setManualCategoriaId] = useState<string>('');
  const [manualDescripcion, setManualDescripcion] = useState('');
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [categoriasMaster, setCategoriasMaster] = useState<CategoriaCaja[]>([]);

  const fetchCategoriasMaster = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_caja')
        .select('*')
        .order('nombre', { ascending: true });
      if (error) throw error;
      setCategoriasMaster(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const categoriasFiltradas = useMemo(() => {
    return categoriasMaster.filter(
      (cat) => cat.tipo_permitido === 'AMBOS' || cat.tipo_permitido === manualTipo
    );
  }, [categoriasMaster, manualTipo]);

  const handleSaveManual = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMonto || Number(manualMonto) <= 0 || !manualDescripcion.trim() || !manualCategoriaId) {
      alert('Por favor ingresa un monto válido, una categoría y una descripción.');
      return;
    }

    setIsSavingManual(true);
    try {
      const { error: dbErr } = await supabase
        .from('movimientos_caja')
        .insert([
          {
            monto: Number(manualMonto),
            tipo_movimiento: manualTipo,
            categoria_id: manualCategoriaId,
            descripcion: manualDescripcion.trim(),
          },
        ]);

      if (dbErr) throw dbErr;

      setIsModalOpen(false);
      setManualMonto('');
      setManualDescripcion('');
      await onSuccess();
    } catch (err: unknown) {
      console.error('Error detallado:', err);
      const errMsg = err instanceof Error ? err.message : 'Error de base de datos.';
      alert(`Error al registrar movimiento: ${errMsg}`);
    } finally {
      setIsSavingManual(false);
    }
  }, [manualMonto, manualTipo, manualCategoriaId, manualDescripcion, onSuccess]);

  return {
    isModalOpen,
    setIsModalOpen,
    manualMonto,
    setManualMonto,
    manualTipo,
    setManualTipo,
    manualCategoriaId,
    setManualCategoriaId,
    manualDescripcion,
    setManualDescripcion,
    isSavingManual,
    categoriasFiltradas,
    fetchCategoriasMaster,
    handleSaveManual,
  };
}
