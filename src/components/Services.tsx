import { ArrowUpRight, Building2, Hammer, Layers, Store } from 'lucide-react';
import { QuoteProjectType } from '../types';

interface ServicesProps {
  onSelectServiceForQuote: (projectType: QuoteProjectType) => void;
}

interface ServiceItem {
  number: string;
  title: string;
  description: string;
  scope: string;
  icon: typeof Building2;
  quoteType: QuoteProjectType;
  featured?: boolean;
}

const SERVICES: ServiceItem[] = [
  {
    number: '01.',
    title: 'Construção Residencial do Zero',
    description:
      'Execução completa de casas térreas, sobrados e residências de alto padrão, desde a terraplanagem e fundação até a entrega das chaves.',
    scope: 'Fundação · Estrutura · Alvenaria · Instalações · Entrega',
    icon: Building2,
    quoteType: 'Construção Residencial',
    featured: true,
  },
  {
    number: '02.',
    title: 'Reformas e Ampliações',
    description:
      'Modernização estrutural, abertura de vãos com reforço metálico, ampliações residenciais e adequação completa de plantas antigas.',
    scope: 'Reforço Estrutural · Demolição Segura · Ampliação',
    icon: Hammer,
    quoteType: 'Reforma Geral',
  },
  {
    number: '03.',
    title: 'Obras Comerciais',
    description:
      'Construção e adequação de lojas, clínicas, escritórios, galpões e showrooms com agilidade operacional e foco em retorno do investimento.',
    scope: 'Varejo · Corporativo · Normas Técnicas e Acessibilidade',
    icon: Store,
    quoteType: 'Obra Comercial',
  },
  {
    number: '04.',
    title: 'Acabamento de Alto Padrão',
    description:
      'Assentamento de porcelanatos de grande formato, pedras naturais, gesso acartonado, luminotécnica, pintura fina e impermeabilização rigorosa.',
    scope: 'Revestimentos Nobres · Gesso · Pintura Arquitetônica',
    icon: Layers,
    quoteType: 'Acabamento/Outros',
    featured: true,
  },
];

export function Services({ onSelectServiceForQuote }: ServicesProps) {
  return (
    <section id="servicos" className="py-16 sm:py-20 lg:py-24 2xl:py-28 bg-[#f8fafc] border-b border-slate-200">
      <div className="max-w-7xl 2xl:max-w-[1440px] min-[1920px]:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-2xl 2xl:max-w-3xl">
            <p className="text-sm 2xl:text-base font-semibold text-[#ea580c] mb-2">
              Especialidades de Engenharia
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-[#0f172a] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Soluções completas para cada etapa da sua construção
            </h2>
          </div>
          <p className="text-sm sm:text-base 2xl:text-lg text-slate-600 max-w-md 2xl:max-w-lg leading-relaxed">
            Gestão de canteiro transparente, equipe própria especializada e rigor técnico do projeto básico aos ajustes finais.
          </p>
        </div>

        {/* Asymmetric Editorial Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 2xl:gap-8">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            const spanClass =
              index === 0 || index === 3 ? 'lg:col-span-7' : 'lg:col-span-5';

            return (
              <article
                key={service.number}
                className={`${spanClass} bg-white border border-slate-200 rounded-xl p-7 sm:p-8 flex flex-col justify-between transition-colors duration-150 hover:border-slate-300`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <span className="font-mono text-sm font-semibold text-[#ea580c] tabular-nums">
                      {service.number}
                    </span>
                    <div className="w-11 h-11 rounded-lg bg-[#0f172a] text-white flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0f172a] mb-3">
                    {service.title}
                  </h3>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-5">
                    {service.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs font-medium text-slate-500">
                    {service.scope}
                  </span>

                  <button
                    type="button"
                    onClick={() => onSelectServiceForQuote(service.quoteType)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0f172a] hover:text-[#ea580c] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea580c] rounded"
                  >
                    <span>Orçar este serviço</span>
                    <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
