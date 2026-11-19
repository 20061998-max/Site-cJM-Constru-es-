import { FormEvent, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  MessageCircle,
  Send,
} from 'lucide-react';
import { QuoteLead, QuoteProjectType, WhatsAppChannel } from '../types';
import {
  buildWhatsAppUrl,
  formatBrazilianInputPhone,
  formatPhoneDisplay,
} from '../utils/storage';

interface QuoteFormProps {
  channels: WhatsAppChannel[];
  preselectedProjectType: QuoteProjectType;
  onAddLead: (payload: {
    clientName: string;
    clientWhatsApp: string;
    sectorId: string;
    projectType: QuoteProjectType;
    details: string;
  }) => Promise<QuoteLead>;
}

const PROJECT_TYPES: QuoteProjectType[] = [
  'Construção Residencial',
  'Reforma Geral',
  'Obra Comercial',
  'Acabamento/Outros',
];

export function QuoteForm({
  channels,
  preselectedProjectType,
  onAddLead,
}: QuoteFormProps) {
  const primaryChannel =
    channels.find((c) => c.isPrimary) ?? channels[0];

  const [clientName, setClientName] = useState('');
  const [clientWhatsApp, setClientWhatsApp] = useState('');
  const [sectorId, setSectorId] = useState(primaryChannel?.id ?? '');
  const [projectType, setProjectType] = useState<QuoteProjectType>(
    preselectedProjectType
  );
  const [details, setDetails] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedState, setSubmittedState] = useState<{
    lead: QuoteLead;
    whatsappUrl: string;
  } | null>(null);

  useEffect(() => {
    setProjectType(preselectedProjectType);
  }, [preselectedProjectType]);

  useEffect(() => {
    if (!channels.some((c) => c.id === sectorId)) {
      setSectorId(primaryChannel?.id ?? '');
    }
  }, [channels, sectorId, primaryChannel?.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedName = clientName.trim();
    const phoneDigits = clientWhatsApp.replace(/\D/g, '');

    if (trimmedName.length < 3) {
      setErrorMsg('Informe seu nome completo para prosseguir com o orçamento.');
      return;
    }

    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setErrorMsg(
        'Informe um número de WhatsApp válido com DDD (ex: (11) 99999-9999).'
      );
      return;
    }

    const chosenChannel =
      channels.find((c) => c.id === sectorId) ?? primaryChannel;

    if (!chosenChannel) {
      setErrorMsg(
        'Nenhum canal de atendimento está disponível no momento. Tente novamente mais tarde.'
      );
      return;
    }

    const formattedDetails =
      details.trim() || 'A detalhar durante o atendimento técnico.';

    setIsSubmitting(true);
    try {
      const savedLead = await onAddLead({
        clientName: trimmedName,
        clientWhatsApp: formatPhoneDisplay(phoneDigits),
        sectorId: chosenChannel.id,
        projectType,
        details: formattedDetails,
      });

      const waMessage = [
        `*NOVO PEDIDO DE ORÇAMENTO — JM CONSTRUÇÕES*`,
        ``,
        `*Cliente:* ${savedLead.clientName}`,
        `*WhatsApp:* ${savedLead.clientWhatsApp}`,
        `*Setor Escolhido:* ${savedLead.sectorName}`,
        `*Tipo de Obra:* ${savedLead.projectType}`,
        `*Detalhes da Obra:* ${savedLead.details}`,
        ``,
        `Enviado pelo site oficial (CNPJ: 59.784.297/0001-76).`,
      ].join('\n');

      const whatsappUrl = buildWhatsAppUrl(chosenChannel.phoneNumber, waMessage);

      // Open WhatsApp safely via synthetic anchor click (avoids window.open blockers)
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSubmittedState({ lead: savedLead, whatsappUrl });
      setClientName('');
      setClientWhatsApp('');
      setDetails('');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Não foi possível registrar seu orçamento no servidor. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="orcamento" className="py-16 sm:py-20 lg:py-24 2xl:py-28 bg-[#0f172a] text-white">
      <div className="max-w-7xl 2xl:max-w-[1440px] min-[1920px]:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 2xl:gap-16 items-stretch">
          {/* Left Column: Engineering Value Proposition */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold text-[#ea580c] mb-2">
                Central de Orçamentos
              </p>
              <h2
                className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-5"
                style={{ textWrap: 'balance' }}
              >
                Solicite sua análise técnica e orçamento sem compromisso
              </h2>
              <p className="text-slate-300 text-base leading-relaxed mb-8">
                Preencha os dados da sua obra ao lado e escolha diretamente o setor responsável. Sua solicitação é registrada em nossa central e direcionada imediatamente para o atendimento no WhatsApp.
              </p>

              <div className="space-y-5 border-t border-white/15 pt-8">
                <div className="flex items-start gap-3.5">
                  <ClipboardCheck
                    className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-display text-base font-bold text-white">
                      Levantamento Quantitativo Claro
                    </h3>
                    <p className="text-sm text-slate-300 mt-0.5 leading-relaxed">
                      Escopo detalhado por etapa de obra: fundação, estrutura, instalações e acabamento.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <MessageCircle
                    className="w-5 h-5 text-[#25d366] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="font-display text-base font-bold text-white">
                      Encaminhamento Direto ao Setor
                    </h3>
                    <p className="text-sm text-slate-300 mt-0.5 leading-relaxed">
                      Ao enviar, sua mensagem já segue formatada para o WhatsApp da equipe selecionada.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/15 text-xs text-slate-400">
              JM Construções · Atendimento de segunda a sábado ·{' '}
              <span className="font-mono tabular-nums text-slate-300">
                CNPJ 59.784.297/0001-76
              </span>
            </div>
          </div>

          {/* Right Column: Lead Conversion Form */}
          <div className="lg:col-span-7 bg-white text-slate-900 rounded-xl p-6 sm:p-8 lg:p-10 shadow-xl">
            {submittedState ? (
              <div className="h-full flex flex-col justify-center py-6">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                </div>

                <h3 className="font-display text-2xl font-bold text-[#0f172a] mb-2">
                  Orçamento registrado com sucesso
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                  Recebemos os dados de <strong>{submittedState.lead.clientName}</strong> para{' '}
                  <strong>{submittedState.lead.projectType}</strong>. Caso o WhatsApp não tenha sido aberto automaticamente pelo navegador, utilize o botão abaixo para iniciar a conversa com o setor{' '}
                  <strong>{submittedState.lead.sectorName}</strong>.
                </p>

                <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-4 text-sm text-slate-700 space-y-1.5 mb-7">
                  <p>
                    <span className="font-semibold text-[#0f172a]">Setor:</span>{' '}
                    {submittedState.lead.sectorName}
                  </p>
                  <p>
                    <span className="font-semibold text-[#0f172a]">Telefone informado:</span>{' '}
                    <span className="font-mono tabular-nums">
                      {submittedState.lead.clientWhatsApp}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-[#0f172a]">Detalhes:</span>{' '}
                    {submittedState.lead.details}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={submittedState.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#0f172a] bg-[#25d366] hover:bg-[#20bd5a] rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Abrir Conversa no WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setSubmittedState(null)}
                    className="px-5 py-3.5 text-sm font-semibold text-slate-700 hover:text-[#0f172a] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Enviar novo orçamento
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-display text-xl font-bold text-[#0f172a]">
                    Dados da Obra e Contato
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Campos marcados com * são obrigatórios.
                  </p>
                </div>

                {errorMsg && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 p-3.5 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="quote-name"
                      className="block text-sm font-semibold text-[#0f172a] mb-1.5"
                    >
                      Nome Completo *
                    </label>
                    <input
                      id="quote-name"
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo Silva"
                      className="w-full px-3.5 py-2.5 text-sm text-[#0f172a] bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quote-whatsapp"
                      className="block text-sm font-semibold text-[#0f172a] mb-1.5"
                    >
                      WhatsApp com DDD *
                    </label>
                    <input
                      id="quote-whatsapp"
                      type="tel"
                      required
                      value={clientWhatsApp}
                      onChange={(e) =>
                        setClientWhatsApp(formatBrazilianInputPhone(e.target.value))
                      }
                      placeholder="(11) 99999-9999"
                      className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums text-[#0f172a] bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="quote-sector"
                      className="block text-sm font-semibold text-[#0f172a] mb-1.5"
                    >
                      Com qual setor deseja falar? *
                    </label>
                    <select
                      id="quote-sector"
                      value={sectorId}
                      onChange={(e) => setSectorId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm text-[#0f172a] bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20"
                    >
                      {channels.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.sectorName}
                          {ch.isPrimary ? ' (Principal)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="quote-type"
                      className="block text-sm font-semibold text-[#0f172a] mb-1.5"
                    >
                      Tipo de Obra *
                    </label>
                    <select
                      id="quote-type"
                      value={projectType}
                      onChange={(e) =>
                        setProjectType(e.target.value as QuoteProjectType)
                      }
                      className="w-full px-3.5 py-2.5 text-sm text-[#0f172a] bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20"
                    >
                      {PROJECT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="quote-details"
                    className="block text-sm font-semibold text-[#0f172a] mb-1.5"
                  >
                    Detalhes da Obra (metragem, cidade/bairro, descrição)
                  </label>
                  <textarea
                    id="quote-details"
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Informe a cidade/bairro, área estimada em m² e se já possui projeto arquitetônico ou terreno."
                    className="w-full px-3.5 py-2.5 text-sm text-[#0f172a] bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]/20 resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 text-base font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-60 rounded-lg transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f172a]"
                >
                  <Send className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    {isSubmitting
                      ? 'Registrando no site...'
                      : 'Enviar Orçamento e Abrir WhatsApp'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
