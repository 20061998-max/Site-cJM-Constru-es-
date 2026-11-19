import { useState } from 'react';
import { ExternalLink, MessageCircle, X } from 'lucide-react';
import { WhatsAppChannel } from '../types';
import { buildWhatsAppUrl, formatPhoneDisplay } from '../utils/storage';

interface FloatingWhatsAppProps {
  channels: WhatsAppChannel[];
}

export function FloatingWhatsApp({ channels }: FloatingWhatsAppProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label="Atendimento rápido via WhatsApp"
          className="w-80 max-w-[calc(100vw-2.5rem)] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="bg-[#0f172a] text-white px-4 py-3.5 flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm font-bold">
                Atendimento WhatsApp
              </p>
              <p className="text-xs text-slate-300">
                Selecione o setor para conversar
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu de WhatsApp"
              className="p-1.5 text-slate-300 hover:text-white rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {channels.map((ch) => (
              <a
                key={ch.id}
                href={buildWhatsAppUrl(
                  ch.phoneNumber,
                  `Olá! Vim pelo site da JM Construções e gostaria de falar com ${ch.sectorName}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#f8fafc] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0f172a] truncate">
                    {ch.sectorName}
                  </p>
                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    {formatPhoneDisplay(ch.phoneNumber)}
                    {ch.isPrimary ? ' · Principal' : ''}
                  </p>
                </div>
                <ExternalLink
                  className="w-4 h-4 text-[#25d366] shrink-0"
                  aria-hidden="true"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label={
          open ? 'Fechar opções de WhatsApp' : 'Abrir atendimento via WhatsApp'
        }
        className="w-13 h-13 rounded-full bg-[#25d366] hover:bg-[#20bd5a] text-[#0f172a] shadow-lg border border-white/50 flex items-center justify-center transition-transform duration-150 hover:scale-105 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f172a]"
      >
        {open ? (
          <X className="w-6 h-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="w-6 h-6" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
