import { useEffect, useMemo, useState } from 'react';
import { AdminModal } from './components/AdminModal';
import { ContactChannels } from './components/ContactChannels';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MediaLightbox } from './components/MediaLightbox';
import { Partners } from './components/Partners';
import { Portfolio } from './components/Portfolio';
import { QuoteForm } from './components/QuoteForm';
import { Services } from './components/Services';
import {
  PartnerBrand,
  PortfolioProject,
  QuoteLead,
  QuoteProjectType,
  WhatsAppChannel,
} from './types';
import {
  INITIAL_WHATSAPP_CHANNELS,
  submitQuoteLead,
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
    return () => {
      unsubChannels();
      unsubProjects();
      unsubPartners();
    };
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 overflow-x-clip">
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
      />
    </div>
  );
}
