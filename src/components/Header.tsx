import { useState } from 'react';
import { Menu, MessageCircle, X } from 'lucide-react';
import { WhatsAppChannel } from '../types';
import { buildWhatsAppUrl } from '../utils/storage';

interface HeaderProps {
  primaryChannel: WhatsAppChannel | undefined;
}

const NAV_LINKS = [
  { href: '#servicos', label: 'Serviços' },
  { href: '#obras', label: 'Obras Realizadas' },
  { href: '#parceiros', label: 'Parceiros' },
  { href: '#orcamento', label: 'Orçamento' },
  { href: '#contatos', label: 'Contatos' },
];

export function Header({ primaryChannel }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryWaHref = primaryChannel
    ? buildWhatsAppUrl(
        primaryChannel.phoneNumber,
        `Olá! Vim pelo site da JM Construções e gostaria de falar com o setor ${primaryChannel.sectorName}.`
      )
    : '#contatos';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl 2xl:max-w-[1440px] min-[1920px]:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 h-16 2xl:h-20 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Title */}
        <a
          href="#inicio"
          className="font-display text-base sm:text-xl 2xl:text-2xl font-extrabold tracking-tight text-[#0f172a] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ea580c] rounded"
        >
          JM CONSTRUÇÕES
        </a>

        {/* Zone 2: Navigation Links */}
        <nav
          aria-label="Navegação Principal"
          className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-10 text-sm 2xl:text-base font-medium text-slate-600"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#0f172a] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-[#ea580c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ea580c]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href={primaryWaHref}
            target={primaryChannel ? '_blank' : undefined}
            rel={primaryChannel ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm 2xl:text-base font-semibold text-[#0f172a] bg-[#25d366] hover:bg-[#20bd5a] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f172a]"
          >
            <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden min-[430px]:inline">WhatsApp Principal</span>
            <span className="min-[430px]:hidden">WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 text-[#0f172a] hover:bg-slate-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3">
          <nav className="flex flex-col gap-1" aria-label="Menu Mobile">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-[#0f172a] hover:bg-slate-50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
