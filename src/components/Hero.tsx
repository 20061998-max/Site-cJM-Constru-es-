import { useState } from 'react';
import { ArrowRight, Building, CalendarCheck2, ShieldCheck } from 'lucide-react';
import heroConstructionImg from '../assets/images/hero_construction_site_1795044275424.jpg';

const HERO_IMAGE_URL = heroConstructionImg;

export function Hero() {
  const [imgError, setImgError] = useState(false);

  return (
    <section
      id="inicio"
      className="relative bg-[#0f172a] text-white overflow-hidden"
    >
      {/* Background Architectural Visual + Scrim */}
      <div className="absolute inset-0">
        {!imgError ? (
          <img
            src={HERO_IMAGE_URL}
            alt="Canteiro de obras moderno da JM Construções em fase estrutural ao entardecer"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0f172a] via-slate-900 to-[#1e293b]" />
        )}
        <div
          className="absolute inset-0 bg-[#0f172a]/75"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-[#0f172a]/50"
          aria-hidden="true"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl 2xl:max-w-[1440px] min-[1920px]:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-16 pb-14 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28 2xl:pt-36 2xl:pb-32">
        <div className="max-w-5xl 2xl:max-w-6xl mx-auto text-center">
          <p className="text-xs sm:text-sm 2xl:text-base font-medium text-slate-300 tracking-wide mb-4">
            Engenharia Civil ·{' '}
            <span className="font-mono tabular-nums text-slate-200">
              CNPJ 59.784.297/0001-76
            </span>
          </p>

          <h1
            className="font-display font-extrabold text-white tracking-tight leading-[1.02] mb-5"
            style={{
              fontSize: 'clamp(2.5rem, 6.2vw, 6rem)',
              textWrap: 'balance',
            }}
          >
            JM CONSTRUÇÕES
          </h1>

          <p
            className="font-display font-bold text-[#ea580c] tracking-tight leading-snug mb-6 mx-auto max-w-3xl 2xl:max-w-4xl"
            style={{
              fontSize: 'clamp(1.25rem, 2.4vw, 2.25rem)',
              textWrap: 'balance',
            }}
          >
            Sua obra em boas mãos, do alicerce ao acabamento.
          </p>

          <p className="text-sm sm:text-base lg:text-lg 2xl:text-xl text-slate-200 leading-relaxed max-w-2xl 2xl:max-w-3xl mx-auto mb-10">
            Execução com engenharia de ponta, cumprimento rigoroso de cronograma e padrão técnico impecável. Transformamos projetos residenciais, comerciais e reformas em entregas sólidas, sem surpresas no orçamento.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#orcamento"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-base font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] rounded-lg transition-colors duration-150 shadow-sm whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span>Solicitar Orçamento Grátis</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </a>

            <a
              href="#obras"
              className="inline-flex items-center justify-center px-6 py-4 text-base font-medium text-white border border-slate-400/50 hover:border-white hover:bg-white/10 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Ver Obras Entregues
            </a>
          </div>
        </div>

        {/* Engineering Commitments Strip */}
        <div className="mt-16 pt-8 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-10">
          <div className="flex items-start gap-3.5">
            <CalendarCheck2 className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-display text-lg font-bold text-white tabular-nums">
                Cronograma Físico-Financeiro
              </p>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                Acompanhamento semanal de metas, compras e etapas para entrega dentro do prazo acordado.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-display text-lg font-bold text-white">
                Responsabilidade Técnica Integral
              </p>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                Conformidade normativa, controle tecnológico de materiais e garantia construtiva formalizada.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Building className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-display text-lg font-bold text-white">
                Acabamento de Precisão
              </p>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                Mão de obra qualificada para revestimentos nobres, instalações prediais e detalhamento arquitetônico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
