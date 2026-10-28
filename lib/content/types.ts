import type { ContactItem } from "@/data/site";
import type { ProjectSize } from "@/data/projects";

export interface ProjectImageRecord {
  id: number;
  mediaId: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface ProjectRecord {
  id: number;
  slug: string;
  title: string;
  type: string;
  roles: string[];
  detailTitle: string | null;
  description: string | null;
  size: ProjectSize;
  sortOrder: number;
  images: ProjectImageRecord[];
  deletedAt: string | null;
}

export interface PersonnelRecord {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  mediaId: string | null;
  image: string | null;
  alt: string;
  sortOrder: number;
  deletedAt: string | null;
}

export interface HomepageContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText: string;
  secondaryButtonHref: string;
  heroMediaId: string | null;
  heroImage: string | null;
}

export interface FooterContent {
  contacts: {
    phone: ContactItem;
    telegram: ContactItem;
    whatsapp: ContactItem;
    email: ContactItem;
  };
  promotion: { title: string; body: string; disclaimer: string; visible: boolean };
  copyrightText: string;
}

export interface ClientRecord {
  id: number;
  name: string;
  mediaId: string;
  logo: string;
  alt: string;
  websiteUrl: string;
  sortOrder: number;
  visible: boolean;
  deletedAt: string | null;
}

export interface PublicContent {
  homepage: HomepageContent;
  footer: FooterContent;
  clients: ClientRecord[];
  projects: ProjectRecord[];
  personnel: PersonnelRecord[];
}
