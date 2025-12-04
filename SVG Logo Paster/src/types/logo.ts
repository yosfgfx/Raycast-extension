export interface LogoVariants {
  original: {
    primary: string;
    secondary?: string;
  };
  dark: {
    primary: string;
    secondary?: string;
  };
  bright: {
    primary: string;
    secondary?: string;
  };
}

export interface Logo {
  id: string;
  nameEn: string;
  nameAr: string;
  category: LogoCategory;
  keywords: string[];
  variants: LogoVariants;
  isUserAdded: boolean;
  dateAdded: Date;
  brandGuidelinesUrl?: string;
  usageRestrictions?: string;
  colorPalette?: string[];
}

export type LogoCategory =
  | "government"
  | "finance"
  | "telecom"
  | "energy"
  | "airlines"
  | "retail"
  | "technology"
  | "healthcare"
  | "education"
  | "custom";

export type LogoVariant = "original" | "dark" | "bright";
export type LogoType = "primary" | "secondary";

export interface UserPreferences {
  defaultVariant: LogoVariant;
  defaultLogoType: LogoType;
  showPreviewBeforePaste: boolean;
  preferredCategories: LogoCategory[] | "all";
  recentLogos: string[];
  favoriteLogos: string[];
}

export interface ClipboardOptions {
  format: "svg" | "base64" | "react" | "vue";
  size: "original" | "small" | "medium" | "large";
}

export interface LogoCollection {
  name: string;
  description: string;
  logos: Logo[];
  createdAt: Date;
  version: string;
}
