import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  AlertCircle,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardList,
  Copy,
  Eye,
  Globe,
  ImagePlus,
  Lock,
  LogOut,
  Megaphone,
  MessageCircle,
  Phone,
  Plus,
  Rocket,
  Star,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { BOOTSTRAPPED_ADMIN_EMAIL, auth } from '../firebase';
import {
  LaunchConfig,
  LaunchMode,
  LeadStatus,
  MediaType,
  PartnerBrand,
  PortfolioProject,
  ProjectCategory,
  QuoteLead,
  WhatsAppChannel,
} from '../types';
import {
  buildWhatsAppUrl,
  checkIsAuthorizedAdmin,
  compressImageToDataUrl,
  createPartnerBrand,
  createPortfolioProject,
  createWhatsAppChannel,
  formatDateTimeBR,
  formatPhoneDisplay,
  removeAdminLead,
  removePartnerBrand,
  removePortfolioProject,
  removeWhatsAppChannel,
  saveLaunchConfig,
  seedInitialChannelsIfEmpty,
  setPrimaryWhatsAppChannel,
  signInAdminWithGoogle,
  signOutAdmin,
  subscribeAdminLeads,
  updateAdminLeadStatus,
} from '../utils/storage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: WhatsAppChannel[];
  projects: PortfolioProject[];
  partners: PartnerBrand[];
  launchConfig: LaunchConfig;
  adminPreviewSite: boolean;
  onTogglePreviewSite: () => void;
}

type AdminTab = 'whatsapp' | 'portfolio' | 'partners' | 'leads' | 'launch';

function toLocalDateTimeInput(iso: string): string {
  const parsed = Date.parse(iso);
  if (!iso || !Number.isFinite(parsed)) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
    return tomorrow.toISOString().slice(0, 16);
  }
  const d = new Date(parsed);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function AdminModal({
  isOpen,
  onClose,
  channels,
  projects,
  partners,
  launchConfig,
  adminPreviewSite,
  onTogglePreviewSite,
}: AdminModalProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab & Leads
  const [activeTab, setActiveTab] = useState<AdminTab>('whatsapp');
  const [leads, setLeads] = useState<QuoteLead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [busyAction, setBusyAction] = useState(false);

  // WhatsApp Form State
  const [waSector, setWaSector] = useState('');
  const [waResponsible, setWaResponsible] = useState('');
  const [waPhone, setWaPhone] = useState('');
  const [waDescription, setWaDescription] = useState('');
  const [waError, setWaError] = useState('');

  // Portfolio Form State
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] =
    useState<ProjectCategory>('Residencial');
  const [projLocation, setProjLocation] = useState('');
  const [projMediaType, setProjMediaType] = useState<MediaType>('photo');
  const [projMediaUrl, setProjMediaUrl] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projError, setProjError] = useState('');
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);

  // Partner Brand Form State
  const [partnerName, setPartnerName] = useState('');
  const [partnerSegment, setPartnerSegment] = useState('Materiais de Construção');
  const [partnerOffer, setPartnerOffer] = useState('');
  const [partnerMediaUrl, setPartnerMediaUrl] = useState('');
  const [partnerActionUrl, setPartnerActionUrl] = useState('');
  const [partnerError, setPartnerError] = useState('');
  const [isProcessingPartnerImg, setIsProcessingPartnerImg] = useState(false);

  // Launch Automation Form State
  const [launchMode, setLaunchMode] = useState<LaunchMode>(launchConfig.mode);
  const [launchDateLocal, setLaunchDateLocal] = useState<string>(() =>
    toLocalDateTimeInput(launchConfig.scheduledAt)
  );
  const [launchHeadline, setLaunchHeadline] = useState(launchConfig.headline);
  const [launchSubheadline, setLaunchSubheadline] = useState(
    launchConfig.subheadline
  );
  const [launchAutoOpen, setLaunchAutoOpen] = useState(launchConfig.autoOpen);
  const [launchError, setLaunchError] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    setLaunchMode(launchConfig.mode);
    setLaunchDateLocal(toLocalDateTimeInput(launchConfig.scheduledAt));
    setLaunchHeadline(launchConfig.headline);
    setLaunchSubheadline(launchConfig.subheadline);
    setLaunchAutoOpen(launchConfig.autoOpen);
  }, [launchConfig]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setIsAuthorizedAdmin(false);
        setIsCheckingAuth(false);
        return;
      }
      setIsCheckingAuth(true);
      const allowed = await checkIsAuthorizedAdmin(user);
      setIsAuthorizedAdmin(allowed);
      if (allowed) {
        setLoginError('');
        seedInitialChannelsIfEmpty().catch((err) => {
          console.error('Erro ao inicializar setores padrão:', err);
        });
      } else {
        setLoginError(
          `A conta ${user.email || 'selecionada'} não possui permissão administrativa. Entre com ${BOOTSTRAPPED_ADMIN_EMAIL}.`
        );
      }
      setIsCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isOpen || !isAuthorizedAdmin) {
      setLeads([]);
      return;
    }
    setIsLoadingLeads(true);
    const unsubscribe = subscribeAdminLeads((data) => {
      setLeads(data);
      setIsLoadingLeads(false);
    });
    return () => unsubscribe();
  }, [isOpen, isAuthorizedAdmin]);

  useEffect(() => {
    if (!feedbackMsg) return;
    const timer = setTimeout(() => setFeedbackMsg(''), 3500);
    return () => clearTimeout(timer);
  }, [feedbackMsg]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoginError('');
    setIsLoggingIn(true);
    try {
      await signInAdminWithGoogle();
    } catch (err) {
      const rawMsg =
        err instanceof Error ? err.message : String(err ?? '');
      if (rawMsg.includes('auth/unauthorized-domain')) {
        const host =
          typeof window !== 'undefined' ? window.location.hostname : 'seu domínio';
        setLoginError(
          `Domínio "${host}" ainda não autorizado no Firebase Auth. Adicione "${host}" em Firebase Console → Authentication → Configurações → Domínios autorizados.`
        );
      } else {
        setLoginError(
          err instanceof Error
            ? err.message
            : 'Não foi possível concluir o login com o Google.'
        );
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOutAdmin();
    setLeads([]);
    setLoginError('');
  };

  // --- WhatsApp Handlers ---
  const handleAddChannel = async (e: FormEvent) => {
    e.preventDefault();
    setWaError('');
    setBusyAction(true);
    try {
      await createWhatsAppChannel(
        {
          sectorName: waSector,
          responsibleName: waResponsible,
          phoneNumber: waPhone,
          description: waDescription,
        },
        channels
      );
      setFeedbackMsg(`Setor "${waSector.trim()}" salvo no Firebase!`);
      setWaSector('');
      setWaResponsible('');
      setWaPhone('');
      setWaDescription('');
    } catch (err) {
      setWaError(
        err instanceof Error ? err.message : 'Erro ao cadastrar setor.'
      );
    } finally {
      setBusyAction(false);
    }
  };

  const handleSetPrimary = async (id: string) => {
    setWaError('');
    setBusyAction(true);
    try {
      await setPrimaryWhatsAppChannel(id, channels);
      setFeedbackMsg('WhatsApp Principal atualizado no site.');
    } catch (err) {
      setWaError(
        err instanceof Error ? err.message : 'Erro ao definir WhatsApp principal.'
      );
    } finally {
      setBusyAction(false);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    setWaError('');
    setBusyAction(true);
    try {
      await removeWhatsAppChannel(id, channels);
      setFeedbackMsg('Número removido do Firebase.');
    } catch (err) {
      setWaError(
        err instanceof Error ? err.message : 'Erro ao remover canal.'
      );
    } finally {
      setBusyAction(false);
    }
  };

  // --- Portfolio Handlers ---
  const handleProjectPhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProjError('');
    setIsProcessingMedia(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file);
      setProjMediaUrl(compressedDataUrl);
      setProjMediaType('photo');
      setFeedbackMsg('Foto otimizada e pronta para publicar no Firebase.');
    } catch (err) {
      setProjError(
        err instanceof Error ? err.message : 'Erro ao processar imagem.'
      );
    } finally {
      setIsProcessingMedia(false);
    }
  };

  const handleAddProject = async (e: FormEvent) => {
    e.preventDefault();
    setProjError('');
    setBusyAction(true);
    try {
      await createPortfolioProject({
        title: projTitle,
        category: projCategory,
        location: projLocation,
        mediaType: projMediaType,
        mediaUrl: projMediaUrl,
        description: projDescription,
      });
      setFeedbackMsg(`Obra "${projTitle.trim()}" publicada no Firebase!`);
      setProjTitle('');
      setProjLocation('');
      setProjMediaUrl('');
      setProjDescription('');
    } catch (err) {
      setProjError(
        err instanceof Error ? err.message : 'Erro ao publicar obra.'
      );
    } finally {
      setBusyAction(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setProjError('');
    setBusyAction(true);
    try {
      await removePortfolioProject(id);
      setFeedbackMsg('Obra removida do portfólio.');
    } catch (err) {
      setProjError(
        err instanceof Error ? err.message : 'Erro ao remover obra.'
      );
    } finally {
      setBusyAction(false);
    }
  };

  // --- Partner Brands Handlers ---
  const handlePartnerImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPartnerError('');
    setIsProcessingPartnerImg(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file);
      setPartnerMediaUrl(compressedDataUrl);
      setFeedbackMsg('Banner da marca otimizado e pronto para publicação.');
    } catch (err) {
      setPartnerError(
        err instanceof Error ? err.message : 'Erro ao processar imagem da marca.'
      );
    } finally {
      setIsProcessingPartnerImg(false);
    }
  };

  const handleAddPartner = async (e: FormEvent) => {
    e.preventDefault();
    setPartnerError('');
    setBusyAction(true);
    try {
      await createPartnerBrand({
        brandName: partnerName,
        segment: partnerSegment,
        offerText: partnerOffer,
        mediaUrl: partnerMediaUrl,
        actionUrl: partnerActionUrl,
      });
      setFeedbackMsg(`Anúncio de "${partnerName.trim()}" publicado no Firebase!`);
      setPartnerName('');
      setPartnerOffer('');
      setPartnerMediaUrl('');
      setPartnerActionUrl('');
    } catch (err) {
      setPartnerError(
        err instanceof Error ? err.message : 'Erro ao publicar anúncio.'
      );
    } finally {
      setBusyAction(false);
    }
  };

  const handleDeletePartner = async (id: string) => {
    setPartnerError('');
    setBusyAction(true);
    try {
      await removePartnerBrand(id);
      setFeedbackMsg('Parceiro removido da vitrine.');
    } catch (err) {
      setPartnerError(
        err instanceof Error ? err.message : 'Erro ao remover parceiro.'
      );
    } finally {
      setBusyAction(false);
    }
  };

  // --- Leads Handlers ---
  const handleLeadStatusChange = async (id: string, status: LeadStatus) => {
    setBusyAction(true);
    try {
      await updateAdminLeadStatus(id, status);
      setFeedbackMsg('Status do orçamento atualizado.');
    } finally {
      setBusyAction(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    setBusyAction(true);
    try {
      await removeAdminLead(id);
      setFeedbackMsg('Registro de orçamento excluído.');
    } finally {
      setBusyAction(false);
    }
  };

  // --- Launch Handlers ---
  const handleSaveLaunchSettings = async (e: FormEvent) => {
    e.preventDefault();
    setLaunchError('');
    setBusyAction(true);
    try {
      const scheduledIso =
        launchMode === 'scheduled' && launchDateLocal
          ? new Date(launchDateLocal).toISOString()
          : '';
      await saveLaunchConfig({
        mode: launchMode,
        scheduledAt: scheduledIso,
        headline: launchHeadline,
        subheadline: launchSubheadline,
        autoOpen: launchAutoOpen,
      });
      setFeedbackMsg(
        launchMode === 'live'
          ? 'Site lançado ao vivo para todos os visitantes!'
          : 'Lançamento automático agendado e salvo no Firebase!'
      );
    } catch (err) {
      setLaunchError(
        err instanceof Error
          ? err.message
          : 'Erro ao salvar configuração de lançamento.'
      );
    } finally {
      setBusyAction(false);
    }
  };

  const handleInstantLaunch = async () => {
    setLaunchError('');
    setBusyAction(true);
    try {
      await saveLaunchConfig({
        mode: 'live',
        scheduledAt: '',
        headline: launchHeadline,
        subheadline: launchSubheadline,
        autoOpen: true,
      });
      setLaunchMode('live');
      setFeedbackMsg('Site colocado NO AR imediatamente para o público!');
    } catch (err) {
      setLaunchError(
        err instanceof Error ? err.message : 'Erro ao lançar o site.'
      );
    } finally {
      setBusyAction(false);
    }
  };

  const publicSiteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : '';

  const handleCopySiteUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicSiteUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      setFeedbackMsg(`Link do site: ${publicSiteUrl}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#ea580c] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2
                id="admin-modal-title"
                className="font-display text-base sm:text-lg font-bold truncate"
              >
                Área Administrativa · JM Construções
              </h2>
              <p className="text-xs text-slate-300 font-mono tabular-nums">
                Firebase Cloud · CNPJ 59.784.297/0001-76
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentUser && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sair / Logout</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar painel administrativo"
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {isCheckingAuth ? (
          <div className="p-12 bg-[#f8fafc] flex-1 flex items-center justify-center text-sm text-slate-600">
            Verificando autenticação no Firebase...
          </div>
        ) : !isAuthorizedAdmin ? (
          <div className="p-6 sm:p-10 bg-[#f8fafc] flex-1 flex items-center justify-center">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-7 shadow-sm space-y-5">
              <div>
                <h3 className="font-display text-xl font-bold text-[#0f172a]">
                  Acesso Administrativo Seguro
                </h3>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                  Entre com a conta Google autorizada no Firebase (<span className="font-mono text-xs text-[#0f172a]">{BOOTSTRAPPED_ADMIN_EMAIL}</span>) para gerenciar WhatsApps, obras, parceiros e orçamentos em tempo real.
                </p>
              </div>

              {loginError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 text-sm font-semibold text-white bg-[#0f172a] hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2.5"
              >
                <Lock className="w-4 h-4 text-[#ea580c]" aria-hidden="true" />
                <span>
                  {isLoggingIn
                    ? 'Conectando com Google...'
                    : 'Entrar com Google (Painel Admin)'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
            {/* Tabs + Feedback */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
              <div
                role="tablist"
                aria-label="Módulos administrativos"
                className="flex flex-wrap items-center gap-2"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'whatsapp'}
                  onClick={() => setActiveTab('whatsapp')}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'whatsapp'
                      ? 'bg-[#0f172a] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f172a]'
                  }`}
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>WhatsApps ({channels.length})</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'portfolio'}
                  onClick={() => setActiveTab('portfolio')}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'portfolio'
                      ? 'bg-[#0f172a] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f172a]'
                  }`}
                >
                  <Building2 className="w-4 h-4" aria-hidden="true" />
                  <span>Obras ({projects.length})</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'partners'}
                  onClick={() => setActiveTab('partners')}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'partners'
                      ? 'bg-[#0f172a] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f172a]'
                  }`}
                >
                  <Megaphone className="w-4 h-4" aria-hidden="true" />
                  <span>Parceiros ({partners.length})</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'leads'}
                  onClick={() => setActiveTab('leads')}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'leads'
                      ? 'bg-[#0f172a] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f172a]'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" aria-hidden="true" />
                  <span>Orçamentos ({leads.length})</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'launch'}
                  onClick={() => setActiveTab('launch')}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'launch'
                      ? 'bg-[#0f172a] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#0f172a]'
                  }`}
                >
                  <Rocket className="w-4 h-4" aria-hidden="true" />
                  <span>Lançamento</span>
                </button>
              </div>

              {feedbackMsg && (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{feedbackMsg}</span>
                </div>
              )}
            </div>

            {/* Scrollable Workspace */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: WHATSAPP MANAGER */}
              {activeTab === 'whatsapp' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <form
                    onSubmit={handleAddChannel}
                    className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4 self-start"
                  >
                    <h3 className="font-display text-lg font-bold text-[#0f172a]">
                      Cadastrar Novo Número
                    </h3>

                    {waError && (
                      <div
                        role="alert"
                        className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg"
                      >
                        {waError}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="wa-sector"
                        className="block text-xs font-semibold text-[#0f172a] mb-1"
                      >
                        Nome do Setor *
                      </label>
                      <input
                        id="wa-sector"
                        type="text"
                        value={waSector}
                        onChange={(e) => setWaSector(e.target.value)}
                        placeholder="Ex: Comercial / Reformas"
                        className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="wa-resp"
                        className="block text-xs font-semibold text-[#0f172a] mb-1"
                      >
                        Responsável
                      </label>
                      <input
                        id="wa-resp"
                        type="text"
                        value={waResponsible}
                        onChange={(e) => setWaResponsible(e.target.value)}
                        placeholder="Ex: Eng. João Marcos"
                        className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="wa-phone"
                        className="block text-xs font-semibold text-[#0f172a] mb-1"
                      >
                        Número com DDI/DDD *
                      </label>
                      <input
                        id="wa-phone"
                        type="text"
                        value={waPhone}
                        onChange={(e) => setWaPhone(e.target.value)}
                        placeholder="Ex: 5511999999999 ou (11) 99999-9999"
                        className="w-full px-3 py-2 text-sm font-mono bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="wa-desc"
                        className="block text-xs font-semibold text-[#0f172a] mb-1"
                      >
                        Descrição breve do atendimento
                      </label>
                      <input
                        id="wa-desc"
                        type="text"
                        value={waDescription}
                        onChange={(e) => setWaDescription(e.target.value)}
                        placeholder="Ex: Visitas técnicas e propostas."
                        className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={busyAction}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      <span>Adicionar WhatsApp</span>
                    </button>
                  </form>

                  <div className="lg:col-span-7 space-y-3">
                    <h3 className="font-display text-lg font-bold text-[#0f172a]">
                      Canais Salvos no Firebase
                    </h3>

                    {channels.map((ch) => (
                      <div
                        key={ch.id}
                        className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-xs font-semibold mb-1">
                            {ch.isPrimary ? (
                              <span className="text-[#ea580c]">
                                Principal (Conectado ao Topo do Site)
                              </span>
                            ) : (
                              <span className="text-slate-500">Setor Secundário</span>
                            )}
                          </div>
                          <p className="font-display text-base font-bold text-[#0f172a]">
                            {ch.sectorName}
                          </p>
                          <p className="text-xs text-slate-600">
                            Responsável: {ch.responsibleName} ·{' '}
                            <span className="font-mono tabular-nums font-semibold text-[#0f172a]">
                              {formatPhoneDisplay(ch.phoneNumber)}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {!ch.isPrimary && (
                            <button
                              type="button"
                              disabled={busyAction}
                              onClick={() => handleSetPrimary(ch.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0f172a] bg-slate-100 hover:bg-slate-200 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5 text-[#ea580c]" aria-hidden="true" />
                              <span>Definir como Principal</span>
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={busyAction}
                            onClick={() => handleDeleteChannel(ch.id)}
                            aria-label={`Excluir canal ${ch.sectorName}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: PORTFOLIO PUBLISHER */}
              {activeTab === 'portfolio' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <form
                    onSubmit={handleAddProject}
                    className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4 self-start"
                  >
                    <h3 className="font-display text-lg font-bold text-[#0f172a]">
                      Publicar Obra Realizada
                    </h3>

                    {projError && (
                      <div
                        role="alert"
                        className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg"
                      >
                        {projError}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="proj-title"
                        className="block text-xs font-semibold text-[#0f172a] mb-1"
                      >
                        Título da Obra *
                      </label>
                      <input
                        id="proj-title"
                        type="text"
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        placeholder="Ex: Casa Moderna no Condomínio Solaris"
                        className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="proj-cat"
                          className="block text-xs font-semibold text-[#0f172a] mb-1"
                        >
                          Categoria *
                        </label>
                        <select
                          id="proj-cat"
                          value={projCategory}
                          onChange={(e) =>
                            setProjCategory(e.target.value as ProjectCategory)
                          }
                          className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                        >
                          <option value="Residencial">Residencial</option>
                          <option value="Comercial">Comercial</option>
                          <option value="Reformas">Reformas</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="proj-media-type"
                          className="block text-xs font-semibold text-[#0f172a] mb-1"
                        >
                          Tipo de Mídia *
                        </label>
                        <select
                          id="proj-media-type"
                          value={projMediaType}
                          onChange={(e) =>
                            setProjMediaType(e.target.value as MediaType)
                          }
                          className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                        >
                          <option value="photo">Foto</option>
                          <option value="video">Vídeo (Link/MP4)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="proj-location"
                        className="block text-xs font-semibold text-[#0f172a] mb-1"
                      >
                        Localização / Área (opcional)
                      </label>
                      <input
                        id="proj-location"
                        type="text"
                        value={projLocation}
                        onChange={(e) => setProjLocation(e.target.value)}
                        placeholder="Ex: Bairro Centro · 310 m²"
                        className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#0f172a]">
                        Enviar Foto (Otimizada no Firebase) ou Colar URL *
                      </label>

                      <label className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-[#0f172a] bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-[#ea580c]" aria-hidden="true" />
                        <span>
                          {isProcessingMedia
                            ? 'Otimizando imagem...'
                            : 'Selecionar Foto do Celular ou PC'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isProcessingMedia}
                          onChange={handleProjectPhotoUpload}
                          className="sr-only"
                        />
                      </label>

                      <input
                        type="text"
                        value={projMediaUrl}
                        onChange={(e) => setProjMediaUrl(e.target.value)}
                        placeholder="Ou cole a URL da imagem / YouTube / Vimeo / MP4"
                        className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                      />

                      {projMediaUrl && projMediaType === 'photo' && (
                        <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-900 aspect-[16/9]">
                          <img
                            src={projMediaUrl}
                            alt="Pré-visualização da obra"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="proj-desc"
                        className="block text-xs font-semibold text-[#0f172a] mb-1"
                      >
                        Descrição da Obra *
                      </label>
                      <textarea
                        id="proj-desc"
                        rows={3}
                        value={projDescription}
                        onChange={(e) => setProjDescription(e.target.value)}
                        placeholder="Descreva os serviços executados, estrutura e acabamentos."
                        className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={busyAction || isProcessingMedia}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                    >
                      <ImagePlus className="w-4 h-4" aria-hidden="true" />
                      <span>Publicar no Firebase</span>
                    </button>
                  </form>

                  <div className="lg:col-span-7 space-y-3">
                    <h3 className="font-display text-lg font-bold text-[#0f172a]">
                      Obras Publicadas ({projects.length})
                    </h3>

                    {projects.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
                        Nenhuma obra publicada até o momento. Adicione fotos ou vídeos de suas entregas no formulário ao lado.
                      </div>
                    ) : (
                      projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-20 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                              {proj.mediaType === 'video' ? (
                                <Video className="w-6 h-6 text-[#ea580c]" aria-hidden="true" />
                              ) : (
                                <img
                                  src={proj.mediaUrl}
                                  alt={proj.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#ea580c]">
                                {proj.category} ·{' '}
                                {proj.mediaType === 'video' ? 'Vídeo' : 'Foto'}
                              </p>
                              <p className="font-display text-sm font-bold text-[#0f172a] truncate">
                                {proj.title}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {proj.location}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={busyAction}
                            onClick={() => handleDeleteProject(proj.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60 rounded-lg transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Excluir obra</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PARTNER BRANDS / ADVERTISING */}
              {activeTab === 'partners' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <form
                    onSubmit={handleAddPartner}
                    className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4 self-start"
                  >
                    <h3 className="font-display text-lg font-bold text-[#0f172a]">
                      Divulgar Marca ou Fornecedor
                    </h3>

                    {partnerError && (
                      <div
                        role="alert"
                        className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg"
                      >
                        {partnerError}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="partner-name"
                        className="block text-xs font-semibold text-[#0f172a] mb-1"
                      >
                        Nome da Marca / Loja *
                      </label>
                      <input
                        id="partner-name"
                        type="text"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="Ex: Casa Forte Materiais de Construção"
                        className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="partner-segment"
                        className="block text-xs font-semibold text-[#0f172a] mb-1"
                      >
                        Segmento *
                      </label>
                      <input
                        id="partner-segment"
                        type="text"
                        value={partnerSegment}
                        onChange={(e) => setPartnerSegment(e.target.value)}
                        placeholder="Ex: Materiais Básicos, Porcelanatos, Aço..."
                        className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#0f172a]">
                        Logo ou Banner da Marca (Opcional)
                      </label>

                      <label className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-[#0f172a] bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 text-[#ea580c]" aria-hidden="true" />
                        <span>
                          {isProcessingPartnerImg
                            ? 'Otimizando imagem...'
                            : 'Enviar Banner/Logo do Celular ou PC'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isProcessingPartnerImg}
                          onChange={handlePartnerImageUpload}
                          className="sr-only"
                        />
                      </label>

                      <input
                        type="text"
                        value={partnerMediaUrl}
                        onChange={(e) => setPartnerMediaUrl(e.target.value)}
                        placeholder="Ou cole a URL da imagem/logo"
                        className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="partner-offer"
                        className="block text-xs font-semibold text-[#0f172a] mb-1"
                      >
                        Texto de Propaganda / Diferencial *
                      </label>
                      <textarea
                        id="partner-offer"
                        rows={3}
                        value={partnerOffer}
                        onChange={(e) => setPartnerOffer(e.target.value)}
                        placeholder="Ex: Cimento, aço e acabamentos com entrega programada e condições exclusivas para clientes JM Construções."
                        className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="partner-link"
                        className="block text-xs font-semibold text-[#0f172a] mb-1"
                      >
                        Site, Instagram ou Link WhatsApp (Opcional)
                      </label>
                      <input
                        id="partner-link"
                        type="text"
                        value={partnerActionUrl}
                        onChange={(e) => setPartnerActionUrl(e.target.value)}
                        placeholder="Ex: https://instagram.com/fornecedor"
                        className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={busyAction || isProcessingPartnerImg}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                    >
                      <Megaphone className="w-4 h-4" aria-hidden="true" />
                      <span>Publicar Anúncio no Firebase</span>
                    </button>
                  </form>

                  <div className="lg:col-span-7 space-y-3">
                    <h3 className="font-display text-lg font-bold text-[#0f172a]">
                      Marcas Parceiras Publicadas ({partners.length})
                    </h3>

                    {partners.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-600">
                        Nenhuma marca parceira cadastrada ainda. Adicione lojas de materiais de construção ou fornecedores ao lado para exibi-los no site.
                      </div>
                    ) : (
                      partners.map((partner) => (
                        <div
                          key={partner.id}
                          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#ea580c]">
                              {partner.segment}
                            </p>
                            <p className="font-display text-sm font-bold text-[#0f172a] truncate">
                              {partner.brandName}
                            </p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                              {partner.offerText}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={busyAction}
                            onClick={() => handleDeletePartner(partner.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60 rounded-lg transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Remover</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: LEADS MANAGEMENT */}
              {activeTab === 'leads' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-[#0f172a]">
                      Pedidos de Orçamento Recebidos ({leads.length})
                    </h3>
                  </div>

                  {isLoadingLeads ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-600">
                      Carregando orçamentos do Firebase...
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-600">
                      Nenhum orçamento recebido até o momento.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {leads.map((lead) => {
                        const replyUrl = buildWhatsAppUrl(
                          lead.clientWhatsApp,
                          `Olá ${lead.clientName}! Aqui é da JM Construções referente ao seu orçamento de ${lead.projectType}. Como podemos ajudar?`
                        );

                        return (
                          <article
                            key={lead.id}
                            className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mb-1">
                                  <span className="font-mono tabular-nums">
                                    {formatDateTimeBR(lead.createdAt)}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-semibold text-[#ea580c]">
                                    {lead.projectType}
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span>Setor: {lead.sectorName}</span>
                                </div>
                                <h4 className="font-display text-base font-bold text-[#0f172a]">
                                  {lead.clientName}{' '}
                                  <span className="font-mono text-sm font-medium text-slate-600 tabular-nums ml-1">
                                    {lead.clientWhatsApp}
                                  </span>
                                </h4>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                <label className="sr-only" htmlFor={`status-${lead.id}`}>
                                  Status do lead {lead.clientName}
                                </label>
                                <select
                                  id={`status-${lead.id}`}
                                  value={lead.status}
                                  disabled={busyAction}
                                  onChange={(e) =>
                                    handleLeadStatusChange(
                                      lead.id,
                                      e.target.value as LeadStatus
                                    )
                                  }
                                  className="px-3 py-1.5 text-xs font-semibold text-[#0f172a] bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                                >
                                  <option value="Novo">Novo</option>
                                  <option value="Em Atendimento">
                                    Em Atendimento
                                  </option>
                                  <option value="Fechado">Fechado</option>
                                </select>

                                <a
                                  href={replyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0f172a] bg-[#25d366] hover:bg-[#20bd5a] rounded-lg transition-colors whitespace-nowrap"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Responder no WhatsApp</span>
                                </a>

                                <button
                                  type="button"
                                  disabled={busyAction}
                                  onClick={() => handleDeleteLead(lead.id)}
                                  aria-label={`Excluir orçamento de ${lead.clientName}`}
                                  className="p-1.5 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                                </button>
                              </div>
                            </div>

                            <p className="text-sm text-slate-700 leading-relaxed">
                              {lead.details}
                            </p>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: AUTOMATIC LAUNCH & PUBLISHING */}
              {activeTab === 'launch' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <form
                    onSubmit={handleSaveLaunchSettings}
                    className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4 self-start"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-lg font-bold text-[#0f172a]">
                        Lançamento Automático do Site
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                          launchConfig.mode === 'live'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {launchConfig.mode === 'live'
                          ? 'Site No Ar (Público)'
                          : 'Pré-Lançamento Agendado'}
                      </span>
                    </div>

                    {launchError && (
                      <div
                        role="alert"
                        className="p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg"
                      >
                        {launchError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setLaunchMode('live')}
                        className={`p-3.5 text-left border rounded-xl transition-colors cursor-pointer ${
                          launchMode === 'live'
                            ? 'border-[#0f172a] bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <p className="font-display text-sm font-bold text-[#0f172a] flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                          <span>Site No Ar (Imediato)</span>
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Todos os visitantes acessam o site completo da JM Construções agora.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLaunchMode('scheduled')}
                        className={`p-3.5 text-left border rounded-xl transition-colors cursor-pointer ${
                          launchMode === 'scheduled'
                            ? 'border-[#ea580c] bg-orange-50/40'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <p className="font-display text-sm font-bold text-[#0f172a] flex items-center gap-2">
                          <CalendarClock className="w-4 h-4 text-[#ea580c]" aria-hidden="true" />
                          <span>Agendar Lançamento</span>
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Exibe contagem regressiva e abre o site automaticamente na data marcada.
                        </p>
                      </button>
                    </div>

                    {launchMode === 'scheduled' && (
                      <div className="space-y-4 pt-2 border-t border-slate-100">
                        <div>
                          <label
                            htmlFor="launch-datetime"
                            className="block text-xs font-semibold text-[#0f172a] mb-1"
                          >
                            Data e Hora do Lançamento Automático *
                          </label>
                          <input
                            id="launch-datetime"
                            type="datetime-local"
                            value={launchDateLocal}
                            onChange={(e) => setLaunchDateLocal(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="launch-headline"
                            className="block text-xs font-semibold text-[#0f172a] mb-1"
                          >
                            Título da Página de Lançamento *
                          </label>
                          <input
                            id="launch-headline"
                            type="text"
                            value={launchHeadline}
                            onChange={(e) => setLaunchHeadline(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="launch-subheadline"
                            className="block text-xs font-semibold text-[#0f172a] mb-1"
                          >
                            Mensagem aos Visitantes *
                          </label>
                          <textarea
                            id="launch-subheadline"
                            rows={2}
                            value={launchSubheadline}
                            onChange={(e) => setLaunchSubheadline(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-[#f8fafc] border border-slate-300 rounded-lg focus:outline-none focus:border-[#ea580c]"
                          />
                        </div>

                        <label className="flex items-center gap-2.5 text-xs font-medium text-[#0f172a] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={launchAutoOpen}
                            onChange={(e) => setLaunchAutoOpen(e.target.checked)}
                            className="w-4 h-4 accent-[#ea580c]"
                          />
                          <span>
                            Lançar e abrir o site completo automaticamente quando o cronômetro zerar
                          </span>
                        </label>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={busyAction}
                        className="inline-flex items-center justify-center gap-2 py-2.5 px-5 text-sm font-semibold text-white bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                      >
                        <Rocket className="w-4 h-4" aria-hidden="true" />
                        <span>
                          {launchMode === 'live'
                            ? 'Salvar: Site Público No Ar'
                            : 'Salvar Agendamento Automático'}
                        </span>
                      </button>

                      {launchConfig.mode === 'scheduled' && (
                        <button
                          type="button"
                          disabled={busyAction}
                          onClick={handleInstantLaunch}
                          className="inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#0f172a] bg-[#25d366] hover:bg-[#20bd5a] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>Lançar Agora</span>
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                      <h4 className="font-display text-base font-bold text-[#0f172a]">
                        Link Oficial do Site
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Compartilhe este endereço com clientes e fornecedores. Todas as alterações salvas aqui no Firebase aparecem em tempo real.
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={publicSiteUrl}
                          aria-label="Endereço do site"
                          className="flex-1 px-3 py-2 text-xs font-mono bg-[#f8fafc] border border-slate-300 rounded-lg text-slate-700"
                        />
                        <button
                          type="button"
                          onClick={handleCopySiteUrl}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#0f172a] hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          {copiedUrl ? (
                            <Check className="w-3.5 h-3.5 text-[#25d366]" aria-hidden="true" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                          <span>{copiedUrl ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    {launchConfig.mode === 'scheduled' && (
                      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                        <h4 className="font-display text-base font-bold text-[#0f172a]">
                          Pré-visualização Administrativa
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Enquanto os visitantes veem a contagem regressiva, você pode alternar para visualizar o site completo a qualquer momento.
                        </p>
                        <button
                          type="button"
                          onClick={onTogglePreviewSite}
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-[#0f172a] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-[#ea580c]" aria-hidden="true" />
                          <span>
                            {adminPreviewSite
                              ? 'Voltar à Tela de Pré-Lançamento'
                              : 'Pré-visualizar Site Completo'}
                          </span>
                        </button>
                      </div>
                    )}

                    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
                      <h4 className="font-display text-sm font-bold text-[#0f172a]">
                        Publicação Automática (GitHub Pages + Firebase)
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Site compilado e publicado automaticamente via GitHub Pages a cada push na branch <code className="font-mono text-[#0f172a]">main</code>, com dados salvos em tempo real no Firebase Firestore.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
