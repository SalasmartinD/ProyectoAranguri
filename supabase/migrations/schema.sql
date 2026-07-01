-- =========================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS Y POLÍTICAS DE SEGURIDAD (RLS)
-- UBICACIÓN: /supabase/migrations/schema.sql
-- =========================================================================

-- Habilitar la extensión UUID si no está activa
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. TABLA: roles
-- -------------------------------------------------------------------------
create table if not exists public.roles (
    id uuid primary key default gen_random_uuid(),
    nombre text not null unique check (char_length(nombre) >= 2),
    creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- 2. TABLA: categorias_caja
-- -------------------------------------------------------------------------
create table if not exists public.categorias_caja (
    id uuid primary key default gen_random_uuid(),
    nombre text not null unique check (char_length(nombre) >= 2),
    tipo_permitido text not null check (tipo_permitido in ('INGRESO', 'EGRESO', 'AMBOS')),
    creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- 3. TABLA: empleados (Baja Lógica y Relación con Roles)
-- -------------------------------------------------------------------------
create table if not exists public.empleados (
    id uuid primary key default gen_random_uuid(),
    nombre text not null check (char_length(nombre) >= 2),
    rol_id uuid not null references public.roles(id) on delete restrict,
    sueldo_fijo numeric(12, 2) check (sueldo_fijo >= 0),
    porcentaje_comision numeric(5, 2) check (porcentaje_comision >= 0 and porcentaje_comision <= 100),
    tipo_remuneracion text not null check (tipo_remuneracion in ('FIJO', 'COMISION', 'MIXTO')),
    fecha_alta timestamp with time zone default timezone('utc'::text, now()) not null,
    fecha_baja timestamp with time zone default null,
    creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- 4. TABLA: vehiculos (Catálogo de Inventario)
-- -------------------------------------------------------------------------
create table if not exists public.vehiculos (
    id uuid primary key default gen_random_uuid(),
    marca text not null check (char_length(marca) >= 2),
    modelo text not null check (char_length(modelo) >= 1),
    anio integer not null check (anio >= 1900 and anio <= extract(year from current_date) + 1),
    precio_compra numeric(12, 2) not null check (precio_compra > 0),
    precio_venta numeric(12, 2) not null check (precio_venta > 0),
    kilometros integer not null check (kilometros >= 0),
    estado text not null default 'Disponible' check (estado in ('Disponible', 'Vendido', 'Pausado')),
    imagenes text[] not null default '{}',
    descripcion text,
    tipo text check (tipo in ('SEDAN', 'SUV', 'PICKUP', 'HATCHBACK', 'COUPE', 'VAN')),
    combustible text check (combustible in ('NAFTA', 'DIESEL', 'HIBRIDO', 'ELECTRICO')),
    transmision text check (transmision in ('MANUAL', 'AUTOMATICA')),
    motorizacion text,
    creado_en timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- 5. TABLA: transacciones (Operaciones de Ventas/Compras)
-- -------------------------------------------------------------------------
create table if not exists public.transacciones (
    id uuid primary key default gen_random_uuid(),
    tipo text not null check (tipo in ('Compra', 'Venta')),
    vehiculo_id uuid not null references public.vehiculos(id) on delete cascade,
    empleado_id uuid not null references public.empleados(id) on delete restrict,
    monto numeric(12, 2) not null check (monto > 0),
    ganancia_neta numeric(12, 2) not null default 0,
    fecha timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- 6. TABLA: movimientos_caja (Libro Contable Diario)
-- -------------------------------------------------------------------------
create table if not exists public.movimientos_caja (
    id uuid primary key default gen_random_uuid(),
    tipo_movimiento text not null check (tipo_movimiento in ('INGRESO', 'EGRESO')),
    monto numeric(12, 2) not null check (monto > 0),
    categoria_id uuid not null references public.categorias_caja(id) on delete restrict,
    descripcion text not null check (char_length(descripcion) >= 5),
    fecha timestamp with time zone default timezone('utc'::text, now()) not null
);

-- -------------------------------------------------------------------------
-- 7. TABLA: sistema_logs (Auditoría del Sistema)
-- -------------------------------------------------------------------------
create table if not exists public.sistema_logs (
    id uuid primary key default gen_random_uuid(),
    timestamp timestamp with time zone default now() not null,
    nivel text not null constraint chk_logs_nivel check (nivel in ('INFO', 'WARN', 'ERROR', 'CRITICAL')),
    contexto text not null,
    mensaje text not null,
    usuario_id uuid references auth.users(id) on delete set null,
    metadatos jsonb default '{}'::jsonb not null
);

-- -------------------------------------------------------------------------
-- VALORES POR DEFECTO: categorías contables obligatorias
-- -------------------------------------------------------------------------
insert into public.categorias_caja (nombre, tipo_permitido)
values 
    ('Adquisición de Inventario', 'EGRESO'),
    ('VENTAS', 'INGRESO')
on conflict (nombre) do update set tipo_permitido = excluded.tipo_permitido;

-- -------------------------------------------------------------------------
-- ÍNDICES (Optimización del Catálogo y Reportes Financieros)
-- -------------------------------------------------------------------------
create index if not exists idx_vehiculos_estado on public.vehiculos(estado);
create index if not exists idx_vehiculos_filtros on public.vehiculos(marca, modelo, anio, precio_venta);
create index if not exists idx_transacciones_fecha on public.transacciones(fecha);
create index if not exists idx_movimientos_caja_fecha on public.movimientos_caja(fecha);

-- =========================================================================
-- AUTOMATIZACIÓN DE NEGOCIO: PROCEDIMIENTOS ALMACENADOS Y TRIGGERS
-- =========================================================================

-- 1. Trigger para registrar egreso automático al ingresar stock
create or replace function public.procesar_adquisicion_vehiculo_automatico()
returns trigger as $$
declare
    v_categoria_id uuid;
begin
    select id into v_categoria_id
    from public.categorias_caja
    where nombre = 'Adquisición de Inventario'
    limit 1;

    if v_categoria_id is null then
        raise exception 'La categoría contable "Adquisición de Inventario" no existe en el sistema.';
    end if;

    insert into public.movimientos_caja (tipo_movimiento, monto, categoria_id, descripcion)
    values (
        'EGRESO',
        new.precio_compra,
        v_categoria_id,
        'Egreso automático por adquisición de stock: ' || new.marca || ' ' || new.modelo || ' (Vehículo ID: ' || new.id || ')'
    );

    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_procesar_adquisicion_vehiculo_automatico on public.vehiculos;
create trigger trg_procesar_adquisicion_vehiculo_automatico
after insert on public.vehiculos
for each row
execute function public.procesar_adquisicion_vehiculo_automatico();


-- 2. Trigger para registrar el ingreso al vender e inhabilitar de-autorizados
create or replace function public.procesar_operacion_transaccional()
returns trigger as $$
declare
    v_precio_compra numeric(12, 2);
    v_marca text;
    v_modelo text;
    v_categoria_ventas_id uuid;
    v_empleado_baja timestamp with time zone;
begin
    -- Validar baja lógica del empleado
    select fecha_baja into v_empleado_baja
    from public.empleados
    where id = new.empleado_id;

    if v_empleado_baja is not null then
        raise exception 'El empleado seleccionado está dado de baja (de-autorizado) y no puede realizar operaciones.';
    end if;

    -- Obtener datos del vehículo
    select precio_compra, marca, modelo into v_precio_compra, v_marca, v_modelo
    from public.vehiculos
    where id = new.vehiculo_id;

    -- Buscar categoría contable
    select id into v_categoria_ventas_id from public.categorias_caja where nombre = 'VENTAS' limit 1;

    if new.tipo = 'Venta' then
        new.ganancia_neta := new.monto - v_precio_compra;
        
        update public.vehiculos
        set estado = 'Vendido'
        where id = new.vehiculo_id;

        if v_categoria_ventas_id is not null then
            insert into public.movimientos_caja (tipo_movimiento, monto, categoria_id, descripcion)
            values (
                'INGRESO',
                new.monto,
                v_categoria_ventas_id,
                'Ingreso por venta automática: ' || v_marca || ' ' || v_modelo || ' (Transacción ID: ' || new.id || ')'
            );
        end if;
    else
        raise exception 'La transacción de tipo % no está permitida. El ingreso de stock se debe hacer únicamente desde el módulo de Inventario.', new.tipo;
    end if;

    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_procesar_operacion_transaccional on public.transacciones;
create trigger trg_procesar_operacion_transaccional
before insert on public.transacciones
for each row
execute function public.procesar_operacion_transaccional();

-- =========================================================================
-- SEGURIDAD (RLS - Row Level Security)
-- =========================================================================
alter table public.vehiculos enable row level security;
alter table public.empleados enable row level security;
alter table public.movimientos_caja enable row level security;
alter table public.transacciones enable row level security;
alter table public.categorias_caja enable row level security;
alter table public.roles enable row level security;
alter table public.sistema_logs enable row level security;

-- A. Políticas para vehículos
drop policy if exists "Vehiculos legibles publicamente" on public.vehiculos;
create policy "Vehiculos legibles publicamente"
on public.vehiculos for select
using (true);

drop policy if exists "Admin control total de vehiculos" on public.vehiculos;
create policy "Admin control total de vehiculos"
on public.vehiculos for all
to authenticated
using (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', auth.jwt() -> 'user_metadata' ->> 'role', '') = 'Administrador')
with check (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', auth.jwt() -> 'user_metadata' ->> 'role', '') = 'Administrador');

-- B. Políticas para transacciones
drop policy if exists "Personal puede leer transacciones" on public.transacciones;
create policy "Personal puede leer transacciones"
on public.transacciones for select
to authenticated
using (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', auth.jwt() -> 'user_metadata' ->> 'role', '') in ('Administrador', 'Vendedor'));

drop policy if exists "Personal puede crear transacciones" on public.transacciones;
create policy "Personal puede crear transacciones"
on public.transacciones for insert
to authenticated
with check (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', auth.jwt() -> 'user_metadata' ->> 'role', '') in ('Administrador', 'Vendedor'));

-- C. Políticas de bloqueo total para vendedoras/es en empleados y finanzas (Caja/Liquidaciones)
drop policy if exists "Admin acceso total a empleados" on public.empleados;
create policy "Admin acceso total a empleados"
on public.empleados for all
to authenticated
using (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', auth.jwt() -> 'user_metadata' ->> 'role', '') = 'Administrador')
with check (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', auth.jwt() -> 'user_metadata' ->> 'role', '') = 'Administrador');

drop policy if exists "Admin acceso total a caja y liquidaciones" on public.movimientos_caja;
create policy "Admin acceso total a caja y liquidaciones"
on public.movimientos_caja for all
to authenticated
using (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', auth.jwt() -> 'user_metadata' ->> 'role', '') = 'Administrador')
with check (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', auth.jwt() -> 'user_metadata' ->> 'role', '') = 'Administrador');

-- D. Políticas para roles y categorías
drop policy if exists "Lectura de roles para todo el personal" on public.roles;
create policy "Lectura de roles para todo el personal"
on public.roles for select
to authenticated
using (true);

drop policy if exists "Admin acceso total a configuracion de roles" on public.roles;
create policy "Admin acceso total a configuracion de roles"
on public.roles for all
to authenticated
using (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', auth.jwt() -> 'user_metadata' ->> 'role', '') = 'Administrador');

drop policy if exists "Lectura de categorias para todo el personal" on public.categorias_caja;
create policy "Lectura de categorias para todo el personal"
on public.categorias_caja for select
to authenticated
using (true);

drop policy if exists "Admin acceso total a configuracion de categorias" on public.categorias_caja;
create policy "Admin acceso total a configuracion de categorias"
on public.categorias_caja for all
to authenticated
using (coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', auth.jwt() -> 'user_metadata' ->> 'role', '') = 'Administrador');

-- =========================================================================
-- PERMISOS DE EJECUCIÓN EXTRA (GRANT)
-- =========================================================================
-- Grant de permisos de ejecución para la función de validación de roles en RLS
-- Error corregido: permission denied for function auth_get_user_role (Código: 42501)
grant execute on function public.auth_get_user_role() to authenticated;
grant execute on function public.auth_get_user_role() to anon;
