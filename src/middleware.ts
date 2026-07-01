import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verificación de Sesión
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Helper para redireccionar y propagar las cookies mutadas (ej. tokens refrescados)
  const redirectWithCookies = (targetUrl: string | URL) => {
    const redirectResponse = NextResponse.redirect(targetUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
      });
    });
    return redirectResponse;
  };

  // Si no hay usuario y se intenta acceder a rutas privadas
  if (!user && url.pathname.startsWith('/dashboard')) {
    url.pathname = '/login';
    return redirectWithCookies(url);
  }

  // Si hay usuario y se intenta acceder a /login, redirigir al dashboard
  if (user && url.pathname === '/login') {
    url.pathname = '/dashboard';
    return redirectWithCookies(url);
  }

  // Control de Acceso Basado en Roles (RBAC)
  if (user && url.pathname.startsWith('/dashboard')) {
    const rol = user.user_metadata?.rol || user.user_metadata?.role || '';
    
    // Si el rol es 'Vendedor' e intenta acceder a rutas financieras o de configuración
    if (rol === 'Vendedor') {
      const isFinanzas = url.pathname.startsWith('/dashboard/finanzas');
      const isConfiguracion = url.pathname.startsWith('/dashboard/configuracion');
      
      if (isFinanzas || isConfiguracion) {
        url.pathname = '/dashboard/inventario';
        return redirectWithCookies(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login'
  ],
};
