import { useEffect, useMemo, useState } from 'react';
import { AdminModal } from './components/AdminModal';
import { ContactChannels } from './components/ContactChannels';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { LaunchCountdown } from './components/LaunchCountdown';
import { MediaLightbox } from './components/MediaLightbox';
import { Partners } from './components/Partners';
import { Portfolio } from './components/Portfolio';
import { QuoteForm } from './components/QuoteForm';
import { Services } from './components/Services';
import {
  LaunchConfig,
  PartnerBrand,
  PortfolioProject,
  QuoteLead,
  QuoteProjectType,
  WhatsAppChannel,
} from './types';
import {
  DEFAULT_LAUNCH_CONFIG,
  INITIAL_WHATSAPP_CHANNELS,
  submitQuoteLead,
  subscribeLaunchConfig,
  subscribePublicChannels,
  subscribePublicPartners,
  subscribePublicProjects,
} from './utils/storage';

export default function App() {
  const [channels, setChannels] = useState<WhatsAppChannel[]>(
    INITIAL_WHATSAPP_CHANNELS
  );
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [partners, setPartners] = useState<PartnerBrand[]>([]);
  const [launchConfig, setLaunchConfig] = useState<LaunchConfig>(
    DEFAULT_LAUNCH_CONFIG
  );
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [adminPreviewSite, setAdminPreviewSite] = useState(false);

  const [selectedQuoteType, setSelectedQuoteType] = useState<QuoteProjectType>(
    'Construção Residencial'
  );
  const [lightboxProject, setLightboxProject] =
    useState<PortfolioProject | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);

  const primaryChannel = useMemo(
    () => channels.find((c) => c.isPrimary) ?? channels[0],
    [channels]
  );

  useEffect(() => {
    const unsubChannels = subscribePublicChannels(setChannels);
    const unsubProjects = subscribePublicProjects(setProjects);
    const unsubPartners = subscribePublicPartners(setPartners);
    const unsubLaunch = subscribeLaunchConfig(setLaunchConfig);
    return () => {
      unsubChannels();
      unsubProjects();
      unsubPartners();
      unsubLaunch();
    };
  }, []);

  useEffect(() => {
    if (launchConfig.mode !== 'scheduled') return;
    setNowMs(Date.now());
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [launchConfig.mode]);

  const isPreLaunchGateActive = useMemo(() => {
    if (launchConfig.mode !== 'scheduled') return false;
    const targetMs = Date.parse(launchConfig.scheduledAt);
    if (!Number.isFinite(targetMs)) return false;
    if (nowMs >= targetMs && launchConfig.autoOpen) return false;
    return true;
  }, [launchConfig, nowMs]);

  const handleSelectServiceForQuote = (projectType: QuoteProjectType) => {
    setSelectedQuoteType(projectType);
    const section = document.getElementById('orcamento');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddLead = async (payload: {
    clientName: string;
    clientWhatsApp: string;
    sectorId: string;
    projectType: QuoteProjectType;
    details: string;
  }): Promise<QuoteLead> => {
    const chosen =
      channels.find((c) => c.id === payload.sectorId) ??
      primaryChannel ??
      INITIAL_WHATSAPP_CHANNELS[0];

    return submitQuoteLead({
      ...payload,
      sectorName: chosen.sectorName,
      sectorPhone: chosen.phoneNumber,
    });
  };

  if (isPreLaunchGateActive && !adminPreviewSite) {
    return (
      <>
        <LaunchCountdown
          config={launchConfig}
          nowMs={nowMs}
          primaryChannel={primaryChannel}
          onOpenAdmin={() => setAdminOpen(true)}
        />
        <AdminModal
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          channels={channels}
          projects={projects}
          partners={partners}
          launchConfig={launchConfig}
          adminPreviewSite={adminPreviewSite}
          onTogglePreviewSite={() => setAdminPreviewSite((prev) => !prev)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 overflow-x-clip">
      {isPreLaunchGateActive && adminPreviewSite && (
        <div className="bg-[#ea580c] text-white text-xs font-semibold px-4 py-2 flex flex-wrap items-center justify-center gap-3 text-center">
          <span>
            Modo Pré-visualização Administrativa · Visitantes aguardam o lançamento automático.
          </span>
          <button
            type="button"
            onClick={() => setAdminPreviewSite(false)}
            className="underline hover:text-slate-100 cursor-pointer"
          >
            Voltar ao Pré-Lançamento
          </button>
        </div>
      )}

      <Header primaryChannel={primaryChannel} />

      <main className="flex-1">
        <Hero />
        <Services onSelectServiceForQuote={handleSelectServiceForQuote} />
        <Portfolio
          projects={projects}
          onOpenLightbox={(project) => setLightboxProject(project)}
        />
        <Partners partners={partners} primaryChannel={primaryChannel} />
        <QuoteForm
          channels={channels}
          preselectedProjectType={selectedQuoteType}
          onAddLead={handleAddLead}
        />
        <ContactChannels channels={channels} />
      </main>

      <Footer onOpenAdmin={() => setAdminOpen(true)} />

      <FloatingWhatsApp channels={channels} />

      <MediaLightbox
        project={lightboxProject}
        onClose={() => setLightboxProject(null)}
      />

      <AdminModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        channels={channels}
        projects={projects}
        partners={partners}
        launchConfig={launchConfig}
        adminPreviewSite={adminPreviewSite}
        onTogglePreviewSite={() => setAdminPreviewSite((prev) => !prev)}
      />
    </div>
  );
}
