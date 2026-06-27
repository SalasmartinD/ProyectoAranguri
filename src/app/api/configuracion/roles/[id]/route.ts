import { NextResponse } from 'next/server';
import { getSupabaseAuthClient } from '@/core/services/supabase';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabaseClient = getSupabaseAuthClient(request);
    const body = await request.json().catch(() => null);
    if (!body || !body.nombre) {
      return NextResponse.json(
        { error: 'Falta el nombre del rol.' },
        { status: 400 }
      );
    }

    const { nombre } = body;
    const { data, error } = await supabaseClient
      .from('roles')
      .update({ nombre: nombre.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, role: data });
  } catch (error: unknown) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar el rol.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabaseClient = getSupabaseAuthClient(request);

    // Validar si algún empleado tiene este rol asignado
    const { count, error: countErr } = await supabaseClient
      .from('empleados')
      .select('*', { count: 'exact', head: true })
      .eq('rol_id', id);

    if (countErr) throw countErr;

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Operación denegada: No se puede eliminar el rol porque está asignado a uno o más empleados.' },
        { status: 400 }
      );
    }

    const { error: deleteErr } = await supabaseClient
      .from('roles')
      .delete()
      .eq('id', id);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar el rol.' },
      { status: 500 }
    );
  }
}
