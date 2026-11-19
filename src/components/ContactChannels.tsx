import { MessageCircle, PhoneCall, UserCheck } from 'lucide-react';
import { WhatsAppChannel } from '../types';
import { buildWhatsAppUrl, formatPhoneDisplay } from '../utils/storage';

interface ContactChannelsProps {
  channels: WhatsAppChannel[];
}

export function ContactChannels({ channels }: ContactChannelsProps) {
  return (
    <section id="contatos" className="py-16 sm:py-20 lg:py-24 2xl:py-28 bg-[#f8fafc] border-b border-slate-200">
      <div className="max-w-7xl 2xl:max-w-[1440px] min-[1920px]:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-2xl 2xl:max-w-3xl mb-10 sm:mb-12">
          <p className="text-sm 2xl:text-base font-semibold text-[#ea580c] mb-2">
            Atendimento Direto
          </p>
          <h2
            className="font-display text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-[#0f172a] tracking-tight mb-3"
            style={{ textWrap: 'balance' }}
          >
            Canais oficiais de atendimento via WhatsApp
          </h2>
          <p className="text-sm sm:text-base 2xl:text-lg text-slate-600 leading-relaxed">
            Fale diretamente com o departamento responsável pela sua demanda para agilizar visitas técnicas, cotações ou acompanhamento de obra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 2xl:gap-8">
          {channels.map((channel) => {
            const waUrl = buildWhatsAppUrl(
              channel.phoneNumber,
              `Olá! Gostaria de falar com o setor ${channel.sectorName} da JM Construções.`
            );

            return (
              <article
                key={channel.id}
                className="bg-white border border-slate-200 rounded-xl p-7 flex flex-col justify-between transition-colors duration-150 hover:border-slate-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      {channel.isPrimary ? (
                        <span className="text-[#ea580c]">
                          Canal Principal · Atendimento Prioritário
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          Setor Especializado
                        </span>
                      )}
                    </div>
                    <PhoneCall
                      className="w-4 h-4 text-slate-400 shrink-0"
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#0f172a] mb-1.5">
                    {channel.sectorName}
                  </h3>

                  <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-3">
                    <UserCheck className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                    <span>Responsável: {channel.responsibleName}</span>
                  </div>

                  {channel.description && (
                    <p className="text-sm text-slate-600 leading-relaxed mb-5">
                      {channel.description}
                    </p>
                  )}
                </div>

                <div className="pt-5 border-t border-slate-100 space-y-3">
                  <p className="font-mono text-base font-semibold text-[#0f172a] tabular-nums">
                    {formatPhoneDisplay(channel.phoneNumber)}
                  </p>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-[#0f172a] bg-[#25d366] hover:bg-[#20bd5a] rounded-lg transition-colors duration-150 whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Iniciar Conversa no WhatsApp</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
