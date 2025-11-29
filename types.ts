export enum Platform {
  YouTube = 'YouTube',
  TikTok = 'TikTok',
  Instagram = 'Instagram',
  Facebook = 'Facebook'
}

export enum Resolution {
  R_1K = '1K',
  R_2K = '2K',
  R_4K = '4K'
}

export interface ThumbnailParams {
  topic: string;
  platform: Platform;
  resolution: Resolution;
  intensity: number; // 0 to 100
  faceImageBase64?: string | null; // New: Reference image for the face
}

export type PlanType = 'free' | 'starter' | 'creator' | 'agency' | 'pro';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  credits: number;
  plan: PlanType;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  recommended?: boolean;
  checkoutUrl: string;
}
