-- Crear tabla de logs y auditoría del sistema
CREATE TABLE IF NOT EXISTS public.sistema_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    nivel TEXT NOT NULL CONSTRAINT chk_logs_nivel CHECK (nivel IN ('INFO', 'WARN', 'ERROR', 'CRITICAL')),
    contexto TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadatos JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- Habilitar Row Level Security (RLS) para evitar lecturas/escrituras desde el cliente
ALTER TABLE public.sistema_logs ENABLE ROW LEVEL SECURITY;

-- Al no declarar ninguna política de SELECT o INSERT para los roles authenticated o anon,
-- Supabase bloquea por defecto toda manipulación a nivel cliente (Zero Trust).
-- El backend podrá operar con omisión total de RLS usando únicamente la Service Role Key.
