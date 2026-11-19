import { useState } from 'react';
import { CalendarClock, Lock, MessageCircle, Rocket } from 'lucide-react';
import { LaunchConfig, WhatsAppChannel } from '../types';
import { buildWhatsAppUrl } from '../utils/storage';

const HERO_IMAGE_URL = '/src/assets/images/hero_construction_site_1795044275424.jpg';

interface LaunchCountdownProps {
  config: LaunchConfig;
  nowMs: number;
  primaryChannel?: WhatsAppChannel;
  onOpenAdmin: () => void;
}

function getTimeParts(targetIso: string, nowMs: number) {
  const targetMs = Date.parse(targetIso);
  if (!Number.isFinite(targetMs)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  const diff = Math.max(0, targetMs - nowMs);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, expired: diff <= 0 };
}

export function LaunchCountdown({
  config,
  nowMs,
  primaryChannel,
  onOpenAdmin,
}: LaunchCountdownProps) {
  const [imgError, setImgError] = useState(false);
  const { days, hours, minutes, seconds } = getTimeParts(
    config.scheduledAt,
    nowMs
  );

  const formattedScheduledDate = (() => {
    const parsed = Date.parse(config.scheduledAt);
    if (!Number.isFinite(parsed)) return '';
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(parsed));
  })();

  const whatsappUrl = primaryChannel
    ? buildWhatsAppUrl(
        primaryChannel.phoneNumber,
        'Olá JM Construções! Vi a página de lançamento do site e gostaria de solicitar um atendimento.'
      )
    : '#';

  const pad = (val: number) => String(val).padStart(2, '0');

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-white relative overflow-hidden">
      {/* Background visual */}
      <div className="absolute inset-0">
        {!imgError ? (
          <img
            src={HERO_IMAGE_URL}
            alt="Canteiro de obras moderno JM Construções"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center opacity-40"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0f172a] via-slate-900 to-[#1e293b]" />
        )}
        <div
          className="absolute inset-0 bg-[#0f172a]/75"
          aria-hidden="true"
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="w-full max-w-4xl 2xl:max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-slate-300">
              CNPJ 59.784.297/0001-76 · Lançamento Oficial
            </p>
            <h1
              className="font-display font-extrabold text-white tracking-tight leading-none"
              style={{ fontSize: 'clamp(2.5rem, 6.2vw, 5.75rem)' }}
            >
              JM CONSTRUÇÕES
            </h1>
            <p className="font-display text-lg sm:text-2xl font-bold text-[#ea580c]">
              Sua obra em boas mãos, do alicerce ao acabamento.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-xl sm:text-3xl font-bold text-white leading-snug">
              {config.headline}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {config.subheadline}
            </p>
          </div>

          {/* Countdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 max-w-2xl mx-auto">
            {[
              { label: 'Dias', value: pad(days) },
              { label: 'Horas', value: pad(hours) },
              { label: 'Minutos', value: pad(minutes) },
              { label: 'Segundos', value: pad(seconds) },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white/5 backdrop-blur-xs border border-white/15 rounded-xl py-5 px-4"
              >
                <p className="font-display text-3xl sm:text-5xl font-extrabold text-white tabular-nums">
                  {item.value}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1.5 uppercase tracking-wider">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {formattedScheduledDate && (
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-200 bg-white/10 border border-white/15 px-4 py-2 rounded-lg">
              <CalendarClock className="w-4 h-4 text-[#ea580c] shrink-0" aria-hidden="true" />
              <span>
                {config.autoOpen
                  ? `Abertura automática programada para ${formattedScheduledDate}`
                  : `Lançamento previsto para ${formattedScheduledDate}`}
              </span>
            </div>
          )}

          {/* Direct WhatsApp CTA */}
          {primaryChannel && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-base font-semibold text-[#0f172a] bg-[#25d366] hover:bg-[#20bd5a] rounded-lg transition-colors shadow-sm"
              >
                <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Falar no WhatsApp Principal</span>
              </a>
              <div className="inline-flex items-center gap-2 text-xs text-slate-300">
                <Rocket className="w-4 h-4 text-[#ea580c]" aria-hidden="true" />
                <span>Atendimento comercial ativo durante o pré-lançamento</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Discreet Footer with Admin Access */}
      <footer className="relative z-10 border-t border-white/10 py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} JM Construções · CNPJ 59.784.297/0001-76
          </p>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Área Administrativa (Acesso Restrito)</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
