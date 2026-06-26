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
      .from('categorias_caja')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching categories API:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al obtener las categorías.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabaseClient = getAuthClient(request);
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
  } catch (error: any) {
    console.error('Error creating category API:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al crear la categoría.' },
      { status: 500 }
    );
  }
}
