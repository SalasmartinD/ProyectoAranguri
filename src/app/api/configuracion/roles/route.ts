import { NextResponse } from 'next/server';
import { getSupabaseAuthClient } from '@/core/services/supabase';

export async function GET(request: Request) {
  try {
    const supabaseClient = getSupabaseAuthClient(request);
    const { data, error } = await supabaseClient
      .from('roles')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error fetching roles API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener los roles.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
      .insert([{ nombre: nombre.trim() }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, role: data });
  } catch (error: unknown) {
    console.error('Error creating role API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear el rol.' },
      { status: 500 }
    );
  }
}
