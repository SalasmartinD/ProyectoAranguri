-- Grant de permisos de ejecución para la función de validación de roles en RLS
-- Error corregido: permission denied for function auth_get_user_role (Código: 42501)

GRANT EXECUTE ON FUNCTION public.auth_get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_get_user_role() TO anon;
