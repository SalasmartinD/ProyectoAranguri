-- =========================================================================
-- MIGRACIÓN: REFACTORIZACIÓN INTEGRAL DE STOCK, CAJA Y BAJA LÓGICA
-- UBICACIÓN: /supabase/migrations/refactor_caja_stock.sql
-- =========================================================================

-- 1. Asegurar la existencia de la categoría contable 'Adquisición de Inventario' para egresos
INSERT INTO public.categorias_caja (nombre, tipo_permitido)
VALUES ('Adquisición de Inventario', 'EGRESO')
ON CONFLICT (nombre) DO UPDATE SET tipo_permitido = 'EGRESO';

-- 2. Asegurar la existencia de la categoría contable 'VENTAS' para ingresos
INSERT INTO public.categorias_caja (nombre, tipo_permitido)
VALUES ('VENTAS', 'INGRESO')
ON CONFLICT (nombre) DO UPDATE SET tipo_permitido = 'INGRESO';

-- -------------------------------------------------------------------------
-- 3. TRIGGER: Registro Automático de Egreso al ingresar un vehículo (Inventario)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.procesar_adquisicion_vehiculo_automatico()
RETURNS TRIGGER AS $$
DECLARE
    v_categoria_id UUID;
BEGIN
    -- Buscar la categoría dedicada a adquisición de stock
    SELECT id INTO v_categoria_id
    FROM public.categorias_caja
    WHERE nombre = 'Adquisición de Inventario'
    LIMIT 1;

    -- Si no existe por algún motivo, usar un fallback o lanzar excepción
    IF v_categoria_id IS NULL THEN
        RAISE EXCEPTION 'La categoría contable "Adquisición de Inventario" no existe en el sistema.';
    END IF;

    -- Registrar el Egreso automático en movimientos_caja (libro diario)
    -- Se utiliza NEW.precio_compra (costo de adquisición del auto)
    INSERT INTO public.movimientos_caja (tipo_movimiento, monto, categoria_id, descripcion)
    VALUES (
        'EGRESO',
        NEW.precio_compra,
        v_categoria_id,
        'Egreso automático por adquisición de stock: ' || NEW.marca || ' ' || NEW.modelo || ' (Vehículo ID: ' || NEW.id || ')'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asignar el trigger AFTER INSERT a la tabla vehiculos
DROP TRIGGER IF EXISTS trg_procesar_adquisicion_vehiculo_automatico ON public.vehiculos;
CREATE TRIGGER trg_procesar_adquisicion_vehiculo_automatico
AFTER INSERT ON public.vehiculos
FOR EACH ROW
EXECUTE FUNCTION public.procesar_adquisicion_vehiculo_automatico();


-- -------------------------------------------------------------------------
-- 4. TRIGGER: Registro Contable y Verificación de Estado al Vender (Operaciones)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.procesar_operacion_transaccional()
RETURNS TRIGGER AS $$
DECLARE
    v_precio_compra NUMERIC(12, 2);
    v_marca TEXT;
    v_modelo TEXT;
    v_categoria_ventas_id UUID;
    v_empleado_baja TIMESTAMP WITH TIME ZONE;
BEGIN
    -- A. Validar que el empleado no esté dado de baja
    SELECT fecha_baja INTO v_empleado_baja
    FROM public.empleados
    WHERE id = NEW.empleado_id;

    IF v_empleado_baja IS NOT NULL THEN
        RAISE EXCEPTION 'El empleado seleccionado está dado de baja (de-autorizado) y no puede realizar operaciones.';
    END IF;

    -- B. Obtener datos técnicos y precio de costo del vehículo
    SELECT precio_compra, marca, modelo INTO v_precio_compra, v_marca, v_modelo
    FROM public.vehiculos
    WHERE id = NEW.vehiculo_id;

    -- C. Obtener la categoría contable 'VENTAS'
    SELECT id INTO v_categoria_ventas_id 
    FROM public.categorias_caja 
    WHERE nombre = 'VENTAS'
    LIMIT 1;

    -- D. Procesar contabilidad en base al tipo de operación
    IF NEW.tipo = 'Venta' THEN
        -- Calcular la ganancia neta (Monto venta - Precio compra)
        NEW.ganancia_neta := NEW.monto - v_precio_compra;
        
        -- Marcar el auto como Vendido
        UPDATE public.vehiculos
        SET estado = 'Vendido'
        WHERE id = NEW.vehiculo_id;

        -- Registrar el Ingreso en movimientos_caja
        IF v_categoria_ventas_id IS NOT NULL THEN
            INSERT INTO public.movimientos_caja (tipo_movimiento, monto, categoria_id, descripcion)
            VALUES (
                'INGRESO',
                NEW.monto,
                v_categoria_ventas_id,
                'Ingreso por venta automática: ' || v_marca || ' ' || v_modelo || ' (Transacción ID: ' || NEW.id || ')'
            );
        END IF;
    ELSE
        -- Restricción estricta de unificación: no se permiten compras desde este canal
        RAISE EXCEPTION 'La transacción de tipo % no está permitida. El ingreso de stock se debe hacer únicamente desde el módulo de Inventario.', NEW.tipo;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asegurar la existencia del trigger BEFORE INSERT en la tabla transacciones
DROP TRIGGER IF EXISTS trg_procesar_operacion_transaccional ON public.transacciones;
CREATE TRIGGER trg_procesar_operacion_transaccional
BEFORE INSERT ON public.transacciones
FOR EACH ROW
EXECUTE FUNCTION public.procesar_operacion_transaccional();
