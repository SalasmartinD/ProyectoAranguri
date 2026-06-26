'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/core/services/supabase';
import { Vehiculo } from '@/core/types/vehiculo';
import { ArrowLeft, Calendar, Gauge, MessageSquare, ShieldCheck, AlertCircle, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DetalleVehiculoPage({ params }: PageProps) {
  const { id } = React.use(params);
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    async function fetchVehiculo() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: dbError } = await supabase
          .from('vehiculos')
          .select('*')
          .eq('id', id)
          .single();

        if (dbError) throw dbError;
        setVehiculo(data);
      } catch (err: any) {
        console.error('Error fetching vehiculo detail:', err);
        setError('No se pudo encontrar la información de este vehículo.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchVehiculo();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="py-12 space-y-8 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-24" />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-20 bg-slate-200 rounded w-full" />
            <div className="h-12 bg-slate-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehiculo) {
    return (
      <div className="py-12 text-center max-w-md mx-auto space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Vehículo no encontrado</h2>
        <p className="text-slate-500 text-sm">{error || 'El vehículo solicitado no existe o no está disponible.'}</p>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  // Generar el mensaje personalizado de WhatsApp
  const mensajeWhatsApp = `Hola! Vengo de su web y quiero consultar por el vehículo: ${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.anio}) - Precio: $${vehiculo.precio_venta.toLocaleString('es-AR')}.`;
  const urlWhatsApp = `https://wa.me/5491122334455?text=${encodeURIComponent(mensajeWhatsApp)}`;

  return (
    <div className="py-4 space-y-6">
      {/* Botón de volver */}
      <div>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>
      </div>

      {/* Detalle del Vehículo */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Galería / Imagen */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm aspect-video md:aspect-auto md:h-[360px]">
            {vehiculo.imagenes && vehiculo.imagenes.length > 0 ? (
              <img
                src={vehiculo.imagenes[activeImgIndex]}
                alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                className="h-full w-full object-cover transition-all duration-300 animate-in fade-in"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400 text-sm font-semibold bg-gradient-to-br from-slate-50 to-slate-100">
                Sin foto disponible
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {vehiculo.imagenes && vehiculo.imagenes.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
              {vehiculo.imagenes.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`relative h-16 w-24 flex-shrink-0 rounded-xl overflow-hidden border-2 bg-slate-50 transition-all cursor-pointer ${
                    idx === activeImgIndex
                      ? 'border-indigo-600 ring-2 ring-indigo-100 scale-102'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-101'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Especificaciones y Botón de WhatsApp */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                {vehiculo.estado}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 leading-tight md:text-4xl">
                {vehiculo.marca} {vehiculo.modelo}
              </h1>
            </div>

            {/* Características rápidas */}
            <div className="flex gap-6 py-2">
              <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-100/60 rounded-xl px-3.5 py-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Año</span>
                  <span className="font-bold">{vehiculo.anio}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600 text-sm bg-slate-100/60 rounded-xl px-3.5 py-2">
                <Gauge className="h-4 w-4 text-indigo-600" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Kilómetros</span>
                  <span className="font-bold">{vehiculo.kilometros.toLocaleString('es-AR')} km</span>
                </div>
              </div>
            </div>

            {/* Precio */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Precio Final Bonificado</span>
              <span className="text-3xl font-black text-slate-950">${vehiculo.precio_venta.toLocaleString('es-AR')}</span>
            </div>

            {/* Garantías o Info extra */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2 text-slate-600 text-xs">
                <BadgeCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                <span>Documentación lista para transferir y al día</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 text-xs">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                <span>Garantía de motor y caja de cambios por 3 meses</span>
              </div>
            </div>
          </div>

          {/* Botón WhatsApp */}
          <a
            href={urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 py-4 px-6 text-sm font-extrabold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-99 focus:outline-none"
          >
            <MessageSquare className="h-5 w-5 text-emerald-300 animate-pulse" />
            Consultar por WhatsApp
          </a>
        </div>
      </div>

      {/* Sección de Descripción de Ancho Completo */}
      {vehiculo.descripcion && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-3.5 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Descripción y Detalles Destacados</h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium">
            {vehiculo.descripcion}
          </p>
        </div>
      )}
    </div>
  );
}
