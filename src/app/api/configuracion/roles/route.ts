import { NextResponse } from 'next/server';
import { supabase } from '@/core/services/supabase';
import { createClient } from '@supabase/supabase-js';

function getAuthClient(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return supabase;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
    }
  );
}

export async function GET(request: Request) {
  try {
    const supabaseClient = getAuthClient(request);
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
    const supabaseClient = getAuthClient(request);
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
