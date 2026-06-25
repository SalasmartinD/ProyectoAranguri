import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Sparkles, MessageSquare } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 py-8 md:py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-20 text-white shadow-2xl sm:px-12 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#312e81,transparent)] opacity-40" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        
        <div className="relative mx-auto max-w-3xl text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            Asistente con Inteligencia Artificial Activo
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Encuentra tu próximo vehículo ideal
          </h1>
          
          <p className="max-w-xl text-lg text-slate-300 leading-relaxed">
            Explora nuestro catálogo seleccionado de autos y motos disponibles. Usa nuestro asesor virtual inteligente para consultar stock al instante con lenguaje natural.
          </p>
          
          <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/catalogo"
              className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500 hover:shadow-indigo-500/20 hover:scale-102 active:scale-98"
            >
              Ver Catálogo Completo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <a
              href="https://wa.me/5491122334455?text=Hola!%20Quiero%20consultar%20por%20un%20vehículo."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid gap-8 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Asistente IA 24/7</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Pregúntale a nuestro chat virtual sobre marcas, precios, kilómetros y recibe recomendaciones al instante con lenguaje natural.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Garantía Asegurada</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Todos nuestros vehículos pasan por una rigurosa inspección mecánica y legal antes de ingresar a nuestro catálogo.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
            <Star className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">El Mejor Precio</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Ofrecemos tasaciones justas y transparentes tanto para compra como para venta de vehículos, maximizando tu presupuesto.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-8 md:p-12">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">¿Listo para cambiar tu vehículo?</h2>
          <p className="text-slate-600 leading-relaxed">
            Ponte en contacto con nuestro equipo de profesionales. Tasamos tu usado en el acto y ofrecemos planes de financiación a tu medida.
          </p>
        </div>
        <a
          href="https://wa.me/5491122334455?text=Hola!%20Quiero%20vender%20mi%20auto%20o%20hacer%20una%20consulta."
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
        >
          Hablar con un Asesor
        </a>
      </section>
    </div>
  );
}
