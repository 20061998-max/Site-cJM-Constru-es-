import { User, signInWithPopup, signOut } from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
} from '../firebase';
import {
  LaunchConfig,
  LaunchMode,
  LeadStatus,
  MediaType,
  PartnerBrand,
  PortfolioProject,
  ProjectCategory,
  QuoteLead,
  QuoteProjectType,
  WhatsAppChannel,
} from '../types';

export const INITIAL_WHATSAPP_CHANNELS: WhatsAppChannel[] = [
  {
    id: 'wa-orcamentos',
    sectorName: 'Orçamentos e Novos Projetos',
    responsibleName: 'Equipe Comercial',
    phoneNumber: '5511987654321',
    isPrimary: true,
    description:
      'Levantamento de custos, visitas técnicas e propostas personalizadas.',
  },
  {
    id: 'wa-engenharia',
    sectorName: 'Engenharia e Acompanhamento',
    responsibleName: 'Diretoria Técnica',
    phoneNumber: '5511976543210',
    isPrimary: false,
    description:
      'Cronogramas, especificações estruturais, ART e suporte de canteiro.',
  },
];

export const DEFAULT_LAUNCH_CONFIG: LaunchConfig = {
  mode: 'live',
  scheduledAt: '',
  headline: 'Inauguração Oficial do Novo Portal JM Construções',
  subheadline:
    'Estamos finalizando os últimos ajustes para apresentar nossas obras, marcas parceiras e central de orçamentos 100% digital.',
  autoOpen: true,
};

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function makeSafeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
}

export async function signInAdminWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export async function checkIsAuthorizedAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  if (user.email === BOOTSTRAPPED_ADMIN_EMAIL) return true;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function seedInitialChannelsIfEmpty(): Promise<void> {
  const path = 'channels';
  try {
    const snap = await getDocs(collection(db, path));
    if (!snap.empty) return;
    const batch = writeBatch(db);
    for (const ch of INITIAL_WHATSAPP_CHANNELS) {
      const payload: Record<string, unknown> = {
        sectorName: ch.sectorName,
        responsibleName: ch.responsibleName,
        phoneNumber: ch.phoneNumber,
        isPrimary: ch.isPrimary,
        createdAt: serverTimestamp(),
      };
      if (ch.description) {
        payload.description = ch.description;
      }
      batch.set(doc(db, path, ch.id), payload);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribePublicChannels(
  onData: (channels: WhatsAppChannel[]) => void
): () => void {
  const path = 'channels';
  const q = query(collection(db, path), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(INITIAL_WHATSAPP_CHANNELS);
        return;
      }
      const list: WhatsAppChannel[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          sectorName: String(data.sectorName ?? ''),
          responsibleName: String(data.responsibleName ?? ''),
          phoneNumber: String(data.phoneNumber ?? ''),
          isPrimary: Boolean(data.isPrimary),
          description:
            typeof data.description === 'string' ? data.description : undefined,
        };
      });
      if (list.length > 0 && !list.some((c) => c.isPrimary)) {
        list[0].isPrimary = true;
      }
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribePublicProjects(
  onData: (projects: PortfolioProject[]) => void
): () => void {
  const path = 'projects';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: PortfolioProject[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: String(data.title ?? ''),
          category: (data.category as ProjectCategory) ?? 'Residencial',
          location: String(data.location ?? ''),
          mediaType: (data.mediaType as MediaType) ?? 'photo',
          mediaUrl: String(data.mediaUrl ?? ''),
          description: String(data.description ?? ''),
          statusLabel: String(data.statusLabel ?? 'Obra Entregue'),
          createdAt: timestampToIso(data.createdAt),
        };
      });
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribePublicPartners(
  onData: (partners: PartnerBrand[]) => void
): () => void {
  const path = 'partners';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: PartnerBrand[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          brandName: String(data.brandName ?? ''),
          segment: String(data.segment ?? ''),
          offerText: String(data.offerText ?? ''),
          mediaUrl: String(data.mediaUrl ?? ''),
          actionUrl:
            typeof data.actionUrl === 'string' ? data.actionUrl : undefined,
          createdAt: timestampToIso(data.createdAt),
        };
      });
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeAdminLeads(
  onData: (leads: QuoteLead[]) => void
): () => void {
  const path = 'leads';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: QuoteLead[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          clientName: String(data.clientName ?? ''),
          clientWhatsApp: String(data.clientWhatsApp ?? ''),
          sectorId: String(data.sectorId ?? ''),
          sectorName: String(data.sectorName ?? ''),
          sectorPhone: String(data.sectorPhone ?? ''),
          projectType: (data.projectType as QuoteProjectType) ?? 'Construção Residencial',
          details: String(data.details ?? ''),
          status: (data.status as LeadStatus) ?? 'Novo',
          createdAt: timestampToIso(data.createdAt),
        };
      });
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function submitQuoteLead(payload: {
  clientName: string;
  clientWhatsApp: string;
  sectorId: string;
  sectorName: string;
  sectorPhone: string;
  projectType: QuoteProjectType;
  details: string;
}): Promise<QuoteLead> {
  const id = makeSafeId('lead');
  const path = `leads/${id}`;
  const cleanName = payload.clientName.trim().slice(0, 120);
  const cleanPhone = payload.clientWhatsApp.trim().slice(0, 25);
  const cleanSectorId = payload.sectorId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
  const cleanSectorName = payload.sectorName.trim().slice(0, 100);
  const cleanSectorPhone = sanitizePhoneDigits(payload.sectorPhone).slice(0, 20);
  const cleanDetails = (payload.details.trim() || 'A detalhar durante o atendimento técnico.').slice(0, 2000);

  try {
    await setDoc(doc(db, 'leads', id), {
      clientName: cleanName,
      clientWhatsApp: cleanPhone,
      sectorId: cleanSectorId,
      sectorName: cleanSectorName,
      sectorPhone: cleanSectorPhone,
      projectType: payload.projectType,
      details: cleanDetails,
      status: 'Novo',
      createdAt: serverTimestamp(),
    });

    return {
      id,
      clientName: cleanName,
      clientWhatsApp: cleanPhone,
      sectorId: cleanSectorId,
      sectorName: cleanSectorName,
      sectorPhone: cleanSectorPhone,
      projectType: payload.projectType,
      details: cleanDetails,
      status: 'Novo',
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function createWhatsAppChannel(
  payload: {
    sectorName: string;
    responsibleName: string;
    phoneNumber: string;
    description?: string;
  },
  existingChannels: WhatsAppChannel[]
): Promise<void> {
  await seedInitialChannelsIfEmpty();
  const sectorName = payload.sectorName.trim().slice(0, 100);
  const responsibleName = (payload.responsibleName.trim() || 'Atendimento JM').slice(0, 100);
  const phoneDigits = sanitizePhoneDigits(payload.phoneNumber).slice(0, 20);
  const description = payload.description?.trim().slice(0, 300);

  if (sectorName.length < 2) {
    throw new Error('Informe o nome do setor (mínimo 2 caracteres).');
  }
  if (responsibleName.length < 2) {
    throw new Error('Informe o nome do responsável (mínimo 2 caracteres).');
  }
  if (!/^[0-9]{10,20}$/.test(phoneDigits)) {
    throw new Error('Informe um número válido com DDD (apenas dígitos, ex: 11999999999).');
  }

  const id = makeSafeId('wa');
  const path = `channels/${id}`;
  const docBody: Record<string, unknown> = {
    sectorName,
    responsibleName,
    phoneNumber: phoneDigits,
    isPrimary: existingChannels.length === 0,
    createdAt: serverTimestamp(),
  };
  if (description) {
    docBody.description = description;
  }

  try {
    await setDoc(doc(db, 'channels', id), docBody);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function setPrimaryWhatsAppChannel(
  targetId: string,
  allChannels: WhatsAppChannel[]
): Promise<void> {
  await seedInitialChannelsIfEmpty();
  const path = 'channels';
  try {
    const snap = await getDocs(collection(db, path));
    const ids = snap.empty ? allChannels.map((c) => c.id) : snap.docs.map((d) => d.id);
    const batch = writeBatch(db);
    for (const id of ids) {
      batch.update(doc(db, path, id), {
        isPrimary: id === targetId,
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${targetId}`);
  }
}

export async function removeWhatsAppChannel(
  targetId: string,
  allChannels: WhatsAppChannel[]
): Promise<void> {
  if (allChannels.length <= 1) {
    throw new Error('É necessário manter pelo menos 1 número de WhatsApp cadastrado para o site.');
  }
  await seedInitialChannelsIfEmpty();
  const target = allChannels.find((c) => c.id === targetId);
  const remaining = allChannels.filter((c) => c.id !== targetId);

  try {
    await deleteDoc(doc(db, 'channels', targetId));
    if (target?.isPrimary && remaining.length > 0) {
      await updateDoc(doc(db, 'channels', remaining[0].id), {
        isPrimary: true,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `channels/${targetId}`);
  }
}

export async function createPortfolioProject(payload: {
  title: string;
  category: ProjectCategory;
  location: string;
  mediaType: MediaType;
  mediaUrl: string;
  description: string;
}): Promise<void> {
  const title = payload.title.trim().slice(0, 140);
  const location = (payload.location.trim() || 'Obra Executada JM Construções').slice(0, 120);
  const mediaUrl = payload.mediaUrl.trim();
  const description = payload.description.trim().slice(0, 1500);

  if (title.length < 3) {
    throw new Error('Informe o título da obra (mínimo 3 caracteres).');
  }
  if (location.length < 2) {
    throw new Error('Informe a localização da obra (mínimo 2 caracteres).');
  }
  if (mediaUrl.length < 5) {
    throw new Error('Envie uma foto ou informe a URL da mídia.');
  }
  if (mediaUrl.length > 750000) {
    throw new Error('A mídia excede o limite de armazenamento em nuvem. Use uma imagem menor ou cole a URL externa.');
  }
  if (description.length < 5) {
    throw new Error('Informe uma descrição da obra (mínimo 5 caracteres).');
  }

  const id = makeSafeId('obra');
  try {
    await setDoc(doc(db, 'projects', id), {
      title,
      category: payload.category,
      location,
      mediaType: payload.mediaType,
      mediaUrl,
      description,
      statusLabel: 'Obra Entregue',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `projects/${id}`);
  }
}

export async function removePortfolioProject(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
  }
}

export async function createPartnerBrand(payload: {
  brandName: string;
  segment: string;
  offerText: string;
  mediaUrl: string;
  actionUrl?: string;
}): Promise<void> {
  const brandName = payload.brandName.trim().slice(0, 120);
  const segment = (payload.segment.trim() || 'Materiais de Construção').slice(0, 80);
  const offerText = payload.offerText.trim().slice(0, 600);
  const mediaUrl = payload.mediaUrl.trim();
  const rawAction = payload.actionUrl?.trim() || '';

  if (brandName.length < 2) {
    throw new Error('Informe o nome da marca ou loja parceira.');
  }
  if (segment.length < 2) {
    throw new Error('Informe o segmento do fornecedor (mínimo 2 caracteres).');
  }
  if (offerText.length < 5) {
    throw new Error('Informe o texto de propaganda da marca (mínimo 5 caracteres).');
  }
  if (mediaUrl.length > 750000) {
    throw new Error('A imagem excede o limite de tamanho para o banco de dados.');
  }

  const id = makeSafeId('partner');
  const docBody: Record<string, unknown> = {
    brandName,
    segment,
    offerText,
    mediaUrl,
    createdAt: serverTimestamp(),
  };

  if (rawAction) {
    const normalized = /^https?:\/\//i.test(rawAction)
      ? rawAction
      : `https://${rawAction}`;
    docBody.actionUrl = normalized.slice(0, 500);
  }

  try {
    await setDoc(doc(db, 'partners', id), docBody);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `partners/${id}`);
  }
}

export async function removePartnerBrand(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'partners', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `partners/${id}`);
  }
}

export async function updateAdminLeadStatus(
  id: string,
  status: LeadStatus
): Promise<void> {
  try {
    await updateDoc(doc(db, 'leads', id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `leads/${id}`);
  }
}

export async function removeAdminLead(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'leads', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
  }
}

export function subscribeLaunchConfig(
  onData: (config: LaunchConfig) => void
): () => void {
  const path = 'site_settings/launch';
  return onSnapshot(
    doc(db, 'site_settings', 'launch'),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(DEFAULT_LAUNCH_CONFIG);
        return;
      }
      const data = snapshot.data();
      onData({
        mode: (data.mode as LaunchMode) === 'scheduled' ? 'scheduled' : 'live',
        scheduledAt: String(data.scheduledAt ?? ''),
        headline: String(data.headline ?? DEFAULT_LAUNCH_CONFIG.headline),
        subheadline: String(
          data.subheadline ?? DEFAULT_LAUNCH_CONFIG.subheadline
        ),
        autoOpen:
          typeof data.autoOpen === 'boolean'
            ? data.autoOpen
            : DEFAULT_LAUNCH_CONFIG.autoOpen,
      });
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function saveLaunchConfig(payload: LaunchConfig): Promise<void> {
  const path = 'site_settings/launch';
  const headline = (
    payload.headline.trim() || DEFAULT_LAUNCH_CONFIG.headline
  ).slice(0, 140);
  const subheadline = (
    payload.subheadline.trim() || DEFAULT_LAUNCH_CONFIG.subheadline
  ).slice(0, 400);
  const mode: LaunchMode = payload.mode === 'scheduled' ? 'scheduled' : 'live';
  const scheduledAt =
    mode === 'scheduled' ? payload.scheduledAt.trim().slice(0, 40) : '';

  if (headline.length < 3) {
    throw new Error('Informe o título do lançamento (mínimo 3 caracteres).');
  }
  if (subheadline.length < 5) {
    throw new Error('Informe a descrição do lançamento (mínimo 5 caracteres).');
  }
  if (mode === 'scheduled') {
    const parsed = Date.parse(scheduledAt);
    if (!scheduledAt || !Number.isFinite(parsed)) {
      throw new Error('Informe uma data e hora válidas para o lançamento automático.');
    }
  }

  try {
    const ref = doc(db, 'site_settings', 'launch');
    const existingSnap = await getDoc(ref);
    if (existingSnap.exists()) {
      await updateDoc(ref, {
        mode,
        scheduledAt,
        headline,
        subheadline,
        autoOpen: Boolean(payload.autoOpen),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        mode,
        scheduledAt,
        headline,
        subheadline,
        autoOpen: Boolean(payload.autoOpen),
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selecione um arquivo de imagem válido (JPG, PNG ou WEBP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler a imagem selecionada.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagem inválido.'));
      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 900;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem no navegador.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.8;
        let result = canvas.toDataURL('image/jpeg', quality);
        while (result.length > 680000 && quality > 0.35) {
          quality -= 0.12;
          result = canvas.toDataURL('image/jpeg', quality);
        }

        if (result.length > 740000) {
          reject(new Error('A imagem é muito pesada mesmo após otimização. Utilize uma URL externa.'));
          return;
        }

        resolve(result);
      };
      img.src = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);
  });
}

export function sanitizePhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('55') && digits.length >= 12) {
    return digits;
  }
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const local =
    digits.startsWith('55') && digits.length >= 12 ? digits.slice(2) : digits;
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return raw;
}

export function formatBrazilianInputPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  const clean = sanitizePhoneDigits(phoneDigits);
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function formatDateTimeBR(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
