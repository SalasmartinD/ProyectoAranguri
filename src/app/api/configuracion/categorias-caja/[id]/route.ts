import { NextResponse } from 'next/server';
import { getSupabaseAuthClient } from '@/core/services/supabase';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabaseClient = getSupabaseAuthClient(request);
    const body = await request.json().catch(() => null);
    if (!body || !body.nombre || !body.tipo_permitido) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: nombre y tipo_permitido.' },
        { status: 400 }
      );
    }

    const { nombre, tipo_permitido } = body;
    const cleanNombre = nombre.trim().toUpperCase().replace(/\s+/g, '_');

    const { data, error } = await supabaseClient
      .from('categorias_caja')
      .update({ nombre: cleanNombre, tipo_permitido })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, categoria: data });
  } catch (error: unknown) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar la categoría.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabaseClient = getSupabaseAuthClient(request);

    // Validar si algún movimiento de caja está utilizando esta categoría
    const { count, error: countErr } = await supabaseClient
      .from('movimientos_caja')
      .select('*', { count: 'exact', head: true })
      .eq('categoria_id', id);

    if (countErr) throw countErr;

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Operación denegada: No se puede eliminar la categoría porque tiene movimientos contables registrados.' },
        { status: 400 }
      );
    }

    const { error: deleteErr } = await supabaseClient
      .from('categorias_caja')
      .delete()
      .eq('id', id);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar la categoría.' },
      { status: 500 }
    );
  }
}
