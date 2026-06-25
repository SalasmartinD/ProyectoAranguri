import Link from 'next/link';
import { Car } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Car className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-slate-800">
              Automotores<span className="text-indigo-600">Salas</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} AutomotoresSalas Concesionaria. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="/login" className="text-xs text-slate-400 hover:text-indigo-600 transition-colors">
              Acceso Staff
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
