import { Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export function Footer({ onOpenAdmin }: FooterProps) {
  return (
    <footer className="bg-[#0f172a] text-slate-300">
      <div className="max-w-7xl 2xl:max-w-[1440px] min-[1920px]:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/15">
          <div className="md:col-span-6">
            <p className="font-display text-xl font-extrabold text-white tracking-tight">
              JM CONSTRUÇÕES
            </p>
            <p className="text-base text-slate-300 mt-2 max-w-md leading-relaxed">
              &ldquo;Sua obra em boas mãos, do alicerce ao acabamento.&rdquo;
            </p>
            <div className="mt-5 inline-block border border-white/20 rounded-lg px-4 py-2.5 bg-white/5">
              <p className="text-xs text-slate-400">Dados Fiscais Oficiais</p>
              <p className="font-mono text-sm font-semibold text-white tabular-nums mt-0.5">
                CNPJ: 59.784.297/0001-76
              </p>
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-display text-sm font-bold text-white mb-3">
              Navegação
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#inicio" className="hover:text-white transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="#servicos" className="hover:text-white transition-colors">
                  Serviços
                </a>
              </li>
              <li>
                <a href="#obras" className="hover:text-white transition-colors">
                  Obras Realizadas
                </a>
              </li>
              <li>
                <a href="#parceiros" className="hover:text-white transition-colors">
                  Parceiros e Fornecedores
                </a>
              </li>
              <li>
                <a href="#orcamento" className="hover:text-white transition-colors">
                  Orçamento
                </a>
              </li>
              <li>
                <a href="#contatos" className="hover:text-white transition-colors">
                  Contatos
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-display text-sm font-bold text-white mb-3">
              Especialidades
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Construção Residencial do Zero</li>
              <li>Reformas e Ampliações</li>
              <li>Obras Comerciais</li>
              <li>Acabamento de Alto Padrão</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} JM Construções · CNPJ 59.784.297/0001-76. Todos os direitos reservados.
          </p>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea580c]"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Área Administrativa (Acesso Restrito)</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
