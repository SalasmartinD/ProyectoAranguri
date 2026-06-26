import { NextResponse } from 'next/server';
import { supabase } from '@/core/services/supabase';
import { createClient } from '@supabase/supabase-js';
import { calcularSueldo } from '@/core/utils/finance';

function getPeriodValue(dateStr: string): number {
  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    return d.getUTCFullYear() * 12 + d.getUTCMonth();
  }
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    return parseInt(parts[0], 10) * 12 + (parseInt(parts[1], 10) - 1);
  }
  const d = new Date(dateStr);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    let supabaseClient = supabase;
    if (token) {
      supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'Cuerpo de petición vacío.' },
        { status: 400 }
      );
    }

    const empleadoId = body.empleado_id || body.empleadoId;
    const { mes, anio, montoFinal, monto_final } = body;
    const customMontoFinal = montoFinal !== undefined ? Number(montoFinal) : (monto_final !== undefined ? Number(monto_final) : null);

    if (!empleadoId || !mes || !anio) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: empleadoId (o empleado_id), mes y anio.' },
        { status: 400 }
      );
    }

    const numericMes = Number(mes);
    const numericAnio = Number(anio);

    if (numericMes < 1 || numericMes > 12) {
      return NextResponse.json(
        { error: 'El mes debe estar entre 1 y 12.' },
        { status: 400 }
      );
    }

    // 1. Obtener datos del empleado
    const { data: empleado, error: empErr } = await supabaseClient
      .from('empleados')
      .select('*')
      .eq('id', empleadoId)
      .single();

    if (empErr || !empleado) {
      return NextResponse.json(
        { error: 'Empleado no encontrado.' },
        { status: 404 }
      );
    }

    // Validación temporal
    const targetPeriod = numericAnio * 12 + (numericMes - 1);
    const fechaAltaStr = empleado.fecha_alta || empleado.creado_en || empleado.fecha_ingreso;

    if (fechaAltaStr) {
      const altaPeriod = getPeriodValue(fechaAltaStr);
      if (targetPeriod < altaPeriod) {
        return NextResponse.json(
          { error: `Operación rechazada: el período seleccionado (${numericMes.toString().padStart(2, '0')}/${numericAnio}) es anterior a la fecha de alta/ingreso del empleado.` },
          { status: 400 }
        );
      }
    }

    if (empleado.fecha_baja) {
      const bajaPeriod = getPeriodValue(empleado.fecha_baja);
      if (targetPeriod > bajaPeriod) {
        return NextResponse.json(
          { error: `Operación rechazada: el período seleccionado (${numericMes.toString().padStart(2, '0')}/${numericAnio}) es posterior a la fecha de baja del empleado.` },
          { status: 400 }
        );
      }
    }

    // Buscar la categoría 'SUELDOS_Y_COMISIONES' dinámicamente
    const { data: categoriaCaja, error: catErr } = await supabaseClient
      .from('categorias_caja')
      .select('id')
      .eq('nombre', 'SUELDOS_Y_COMISIONES')
      .single();

    if (catErr || !categoriaCaja) {
      console.error('Categoría SUELDOS_Y_COMISIONES no encontrada:', catErr);
      return NextResponse.json(
        { error: 'Error de configuración: La categoría de caja SUELDOS_Y_COMISIONES no existe en la base de datos.' },
        { status: 500 }
      );
    }

    // 2. Control de duplicados: Buscar si ya existe la liquidación en movimientos_caja
    const searchDesc = `ID: ${empleadoId}`;
    const periodStr = `Período ${numericMes.toString().padStart(2, '0')}/${numericAnio}`;

    const { data: existingMovements, error: existErr } = await supabaseClient
      .from('movimientos_caja')
      .select('id')
      .eq('categoria_id', categoriaCaja.id)
      .like('descripcion', `%${searchDesc}%`)
      .like('descripcion', `%${periodStr}%`);

    if (existErr) {
      console.error('Error al validar liquidaciones existentes:', existErr);
      return NextResponse.json(
        { error: 'Error de base de datos al validar liquidaciones duplicadas.' },
        { status: 500 }
      );
    }

    if (existingMovements && existingMovements.length > 0) {
      return NextResponse.json(
        { error: 'Este empleado ya cuenta con una liquidación de sueldo registrada para el período indicado.' },
        { status: 400 }
      );
    }

    // 3. Obtener ventas del período
    const startDate = new Date(numericAnio, numericMes - 1, 1, 0, 0, 0, 0).toISOString();
    const endDate = new Date(numericMes === 12 ? numericAnio + 1 : numericAnio, numericMes === 12 ? 0 : numericMes, 1, 0, 0, 0, 0).toISOString();

    const { data: sales, error: salesErr } = await supabaseClient
      .from('transacciones')
      .select('monto')
      .eq('empleado_id', empleadoId)
      .eq('tipo', 'Venta')
      .gte('fecha', startDate)
      .lt('fecha', endDate);

    if (salesErr) {
      console.error('Error al obtener ventas del empleado:', salesErr);
      return NextResponse.json(
        { error: 'Error de base de datos al obtener las ventas del período.' },
        { status: 500 }
      );
    }

    // 4. Calcular liquidación
    const totalVentas = (sales || []).reduce((sum, s) => sum + Number(s.monto), 0);
    const sueldoFijo = Number(empleado.sueldo_fijo || 0);
    const comision = (totalVentas * Number(empleado.porcentaje_comision || 0)) / 100;

    let totalLiquidado = 0;
    if (customMontoFinal !== null) {
      totalLiquidado = customMontoFinal;
    } else {
      totalLiquidado = calcularSueldo({
        tipo_remuneracion: empleado.tipo_remuneracion,
        sueldo_fijo: empleado.sueldo_fijo,
        porcentaje_comision: empleado.porcentaje_comision
      }, totalVentas);
    }

    if (totalLiquidado <= 0) {
      return NextResponse.json(
        { error: 'El monto total a liquidar debe ser mayor a $0.' },
        { status: 400 }
      );
    }

    // 5. Registrar el Egreso en la caja
    const esAjustado = customMontoFinal !== null;
    const descripcion = `Pago de sueldo - ${empleado.nombre} (ID: ${empleadoId}) - Período ${numericMes.toString().padStart(2, '0')}/${numericAnio}.${esAjustado ? ` Ajustado a: $${totalLiquidado.toLocaleString('es-AR')}.` : ''} Sueldo Fijo: $${sueldoFijo.toLocaleString('es-AR')}, Comisión: $${comision.toLocaleString('es-AR')} (${sales?.length || 0} ventas).`;

    const { data: movimiento, error: moveErr } = await supabaseClient
      .from('movimientos_caja')
      .insert([
        {
          monto: totalLiquidado,
          tipo_movimiento: 'EGRESO',
          categoria_id: categoriaCaja.id,
          descripcion
        }
      ])
      .select()
      .single();

    if (moveErr) {
      console.error('Error al registrar egreso en caja:', moveErr);
      return NextResponse.json(
        { error: 'No se pudo completar la operación de liquidación en el registro de caja.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      movimiento
    });
  } catch (error: any) {
    console.error('Error general en liquidar-sueldo Route:', error);
    return NextResponse.json(
      { error: error?.message || 'Ocurrió un error inesperado al procesar la liquidación.' },
      { status: 500 }
    );
  }
}
