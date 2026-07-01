import { NextResponse } from 'next/server';
import { getSupabaseAuthClient } from '@/core/services/supabase';

export async function GET(request: Request) {
  try {
    const supabaseClient = getSupabaseAuthClient(request);
    const { data, error } = await supabaseClient
      .from('categorias_caja')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error fetching categories API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener las categorías.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
      .insert([
        {
          nombre: cleanNombre,
          tipo_permitido
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, categoria: data });
  } catch (error: unknown) {
    console.error('Error creating category API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear la categoría.' },
      { status: 500 }
    );
  }
}
