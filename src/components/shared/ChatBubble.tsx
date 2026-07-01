'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { Message } from '@/core/types/chat';
import { MarkdownRenderer } from '@/core/components/MarkdownRenderer';

// Definir constante inicial estática fuera del componente para mantener la pureza
const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome',
    role: 'model',
    content: '¡Hola! Soy tu asesor virtual. ¿En qué vehículo estás interesado hoy? Puedo buscar por precio, kilómetros o segmento.',
    timestamp: '2026-06-26T00:00:00.000Z',
  },
];

// Función de utilidad pura/aislada fuera del componente para evitar advertencias de react-hooks/purity
function createMessage(role: 'user' | 'model', content: string): Message {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 11),
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) {
      setInput('');
    }
    setError(null);

    const userMessage = createMessage('user', text);

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al comunicarse con el asistente.');
      }

      setMessages((prev) => [
        ...prev,
        createMessage('model', data.response),
      ]);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    handleSend(suggestion);
  };

  const suggestions = [
    '¿Qué autos tienen por menos de $20,000?',
    '¿Tienen algún auto familiar o SUV?',
    'Mostrar autos con menos de 50,000 km',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Botón Flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700 active:scale-95 focus:outline-none"
          aria-label="Abrir asistente de IA"
        >
          <MessageCircle className="h-6 w-6 animate-pulse" />
        </button>
      )}

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="flex h-[500px] w-[360px] flex-col rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-md md:w-[400px]">
          {/* Encabezado */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-indigo-600 to-violet-700 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-200 animate-pulse" />
              <div>
                <h3 className="font-semibold text-sm leading-tight">Asesor Virtual IA</h3>
                <span className="text-[10px] text-indigo-200">Consultando stock disponible en tiempo real</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-none px-4 py-2.5 text-sm flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Asistente temporalmente inactivo</span>
                  {error}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          {messages.length === 1 && !loading && !error && (
            <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Consultas rápidas:</span>
              <div className="flex flex-col gap-1.5">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestion(s)}
                    className="text-left text-xs text-indigo-600 bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1.5 transition-all text-ellipsis overflow-hidden whitespace-nowrap"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formulario de Entrada */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-slate-100 bg-white p-3 rounded-b-2xl"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta sobre nuestro stock..."
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow transition-colors hover:bg-indigo-700 active:scale-95 focus:outline-none disabled:opacity-40 disabled:hover:bg-indigo-600 disabled:active:scale-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
