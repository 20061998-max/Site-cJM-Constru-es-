import { useState } from 'react';
import {
  ExternalLink,
  Megaphone,
  MessageCircle,
  PackageCheck,
} from 'lucide-react';
import { PartnerBrand, WhatsAppChannel } from '../types';
import { buildWhatsAppUrl } from '../utils/storage';

interface PartnersProps {
  partners: PartnerBrand[];
  primaryChannel: WhatsAppChannel | undefined;
}

export function Partners({ partners, primaryChannel }: PartnersProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const advertiseWaHref = primaryChannel
    ? buildWhatsAppUrl(
        primaryChannel.phoneNumber,
        'Olá! Gostaria de anunciar minha marca / loja de materiais de construção no espaço de parceiros do site da JM Construções.'
      )
    : '#contatos';

  return (
    <section
      id="parceiros"
      className="py-16 sm:py-20 lg:py-24 2xl:py-28 bg-white border-b border-slate-200"
    >
      <div className="max-w-7xl 2xl:max-w-[1440px] min-[1920px]:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="max-w-2xl 2xl:max-w-3xl">
            <p className="text-sm 2xl:text-base font-semibold text-[#ea580c] mb-2">
              Vitrine de Parceiros e Fornecedores
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-[#0f172a] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Marcas e fornecedores de confiança para sua obra
            </h2>
          </div>

          <p className="text-sm sm:text-base 2xl:text-lg text-slate-600 max-w-md 2xl:max-w-lg leading-relaxed">
            Espaço dedicado à divulgação de lojas de materiais de construção, fornecedores de aço, cimento, acabamentos e soluções técnicas recomendadas.
          </p>
        </div>

        {/* Published Partner Brands Grid */}
        {partners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 2xl:gap-8 mb-10">
            {partners.map((partner) => {
              const hasValidImage =
                Boolean(partner.mediaUrl) && !failedImages[partner.id];

              return (
                <article
                  key={partner.id}
                  className="bg-[#f8fafc] border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between transition-colors duration-150 hover:border-slate-300"
                >
                  <div>
                    <div className="aspect-[16/9] bg-white border-b border-slate-200 overflow-hidden flex items-center justify-center">
                      {hasValidImage ? (
                        <img
                          src={partner.mediaUrl}
                          alt={`Marca parceira ${partner.brandName}`}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages((prev) => ({
                              ...prev,
                              [partner.id]: true,
                            }))
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-5 text-center">
                          <PackageCheck
                            className="w-9 h-9 text-[#ea580c] mb-2"
                            aria-hidden="true"
                          />
                          <span className="font-display text-lg font-extrabold text-[#0f172a]">
                            {partner.brandName}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <p className="text-xs font-semibold text-[#ea580c] mb-1.5">
                        {partner.segment}
                      </p>
                      <h3 className="font-display text-xl font-bold text-[#0f172a] mb-2">
                        {partner.brandName}
                      </h3>
                      <p className="text-sm 2xl:text-base text-slate-600 leading-relaxed">
                        {partner.offerText}
                      </p>
                    </div>
                  </div>

                  {partner.actionUrl && (
                    <div className="px-6 pb-6 pt-3 border-t border-slate-200/70">
                      <a
                        href={partner.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f172a] hover:text-[#ea580c] transition-colors whitespace-nowrap"
                      >
                        <span>Conhecer fornecedor</span>
                        <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-semibold text-[#ea580c] mb-1.5">
                Categoria Disponível
              </p>
              <h3 className="font-display text-lg font-bold text-[#0f172a] mb-1.5">
                Materiais Básicos e Estruturais
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Espaço preparado para divulgação de depósitos, concreteiras, ferragens, tijolos e agregados.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-semibold text-[#ea580c] mb-1.5">
                Categoria Disponível
              </p>
              <h3 className="font-display text-lg font-bold text-[#0f172a] mb-1.5">
                Revestimentos e Acabamentos
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Vitrine para lojas de porcelanatos, tintas, esquadrias, marmorarias, louças e metais.
              </p>
            </div>

            <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-semibold text-[#ea580c] mb-1.5">
                Categoria Disponível
              </p>
              <h3 className="font-display text-lg font-bold text-[#0f172a] mb-1.5">
                Elétrica, Hidráulica e Locação
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Divulgação para fornecedores de infraestrutura predial, iluminação e locação de equipamentos.
              </p>
            </div>
          </div>
        )}

        {/* Supplier / Brand Advertising CTA */}
        <div className="bg-[#0f172a] text-white rounded-xl p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-11 h-11 rounded-lg bg-[#ea580c] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Megaphone className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-1.5">
                Quer divulgar sua marca ou loja de materiais aqui?
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Conecte sua empresa de materiais de construção ou serviços complementares diretamente aos clientes e obras atendidos pela JM Construções.
              </p>
            </div>
          </div>

          <a
            href={advertiseWaHref}
            target={primaryChannel ? '_blank' : undefined}
            rel={primaryChannel ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-semibold text-[#0f172a] bg-[#25d366] hover:bg-[#20bd5a] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Anunciar Minha Marca</span>
          </a>
        </div>
      </div>
    </section>
  );
}
