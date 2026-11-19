export type ProjectCategory = 'Residencial' | 'Comercial' | 'Reformas';

export type MediaType = 'photo' | 'video';

export type QuoteProjectType =
  | 'Construção Residencial'
  | 'Reforma Geral'
  | 'Obra Comercial'
  | 'Acabamento/Outros';

export type LeadStatus = 'Novo' | 'Em Atendimento' | 'Fechado';

export interface WhatsAppChannel {
  id: string;
  sectorName: string;
  responsibleName: string;
  phoneNumber: string; // Stored digits only with country code e.g. 5511999999999
  isPrimary: boolean;
  description?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: ProjectCategory;
  location: string;
  mediaType: MediaType;
  mediaUrl: string;
  description: string;
  statusLabel: string;
  createdAt: string;
}

export interface QuoteLead {
  id: string;
  clientName: string;
  clientWhatsApp: string;
  sectorId: string;
  sectorName: string;
  sectorPhone: string;
  projectType: QuoteProjectType;
  details: string;
  status: LeadStatus;
  createdAt: string;
}

export interface PartnerBrand {
  id: string;
  brandName: string;
  segment: string;
  offerText: string;
  mediaUrl: string;
  actionUrl?: string;
  createdAt: string;
}

