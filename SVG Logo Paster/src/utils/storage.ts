import { LocalStorage } from "@raycast/api";
import { Logo, LogoCollection } from "@/types/logo";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const STORAGE_KEYS = {
  USER_LOGOS: "user_logos_v1",
  PREFERENCES: "user_preferences_v1",
  RECENT_LOGOS: "recent_logos_v1",
  FAVORITE_LOGOS: "favorite_logos_v1",
  SYNCED_LOGOS: "synced_logos_v1",
};

function getPersistentDir(): string {
  return path.join(os.homedir(), "Documents", "Saudi Logo Vault", "User Logos");
}

function getPersistentFilePath(): string {
  return path.join(getPersistentDir(), "user_logos.json");
}

async function ensurePersistentDir() {
  const dir = getPersistentDir();
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

async function readPersistentUserLogos(): Promise<Logo[]> {
  try {
    const file = getPersistentFilePath();
    const buf = await fs.readFile(file, "utf8");
    const logos = JSON.parse(buf) as Logo[];
    return logos.map((l: any) => ({ ...l, dateAdded: new Date(l.dateAdded) }));
  } catch {
    return [];
  }
}

async function writePersistentUserLogos(logos: Logo[]): Promise<void> {
  await ensurePersistentDir();
  const file = getPersistentFilePath();
  const payload = JSON.stringify(logos, null, 2);
  await fs.writeFile(file, payload, "utf8");
}

function mergeById(a: Logo[], b: Logo[]): Logo[] {
  const map = new Map<string, Logo>();
  for (const l of [...a, ...b]) {
    if (l && l.id) {
      map.set(l.id, l);
    }
  }
  return Array.from(map.values());
}

export class LogoStorage {
  static async getUserLogos(): Promise<Logo[]> {
    try {
      const [lsStored, persistent] = await Promise.all([
        LocalStorage.getItem(STORAGE_KEYS.USER_LOGOS),
        readPersistentUserLogos(),
      ]);
      const localLogos: any[] = lsStored ? JSON.parse(lsStored as string) : [];
      const localNormalized = localLogos.map((logo: any) => ({ ...logo, dateAdded: new Date(logo.dateAdded) }));
      return mergeById(persistent, localNormalized);
    } catch (error) {
      console.error("Error loading user logos:", error);
      return [];
    }
  }

  static async saveUserLogos(logos: Logo[]): Promise<void> {
    try {
      await LocalStorage.setItem(STORAGE_KEYS.USER_LOGOS, JSON.stringify(logos));
      await writePersistentUserLogos(logos);
    } catch (error) {
      console.error("Error saving user logos:", error);
      throw error;
    }
  }

  static async addUserLogo(logo: Logo): Promise<void> {
    const userLogos = await this.getUserLogos();
    const existingIds = new Set(userLogos.map((l) => l.id));
    const updated = existingIds.has(logo.id)
      ? userLogos.map((l) => (l.id === logo.id ? logo : l))
      : [...userLogos, logo];
    await this.saveUserLogos(updated);
  }

  static async updateUserLogo(id: string, updatedLogo: Partial<Logo>): Promise<void> {
    const userLogos = await this.getUserLogos();
    const index = userLogos.findIndex((logo) => logo.id === id);

    if (index === -1) {
      throw new Error("Logo not found");
    }

    userLogos[index] = { ...userLogos[index], ...updatedLogo };
    await this.saveUserLogos(userLogos);
  }

  static async deleteUserLogo(id: string): Promise<void> {
    const userLogos = await this.getUserLogos();
    const filteredLogos = userLogos.filter((logo) => logo.id !== id);
    await this.saveUserLogos(filteredLogos);
  }

  static async getRecentLogos(): Promise<string[]> {
    try {
      const stored = await LocalStorage.getItem(STORAGE_KEYS.RECENT_LOGOS);
      return stored ? JSON.parse(stored as string) : [];
    } catch (error) {
      console.error("Error loading recent logos:", error);
      return [];
    }
  }

  static async addToRecentLogos(logoId: string): Promise<void> {
    const recent = await this.getRecentLogos();
    const updated = [logoId, ...recent.filter((id) => id !== logoId)].slice(0, 10);
    await LocalStorage.setItem(STORAGE_KEYS.RECENT_LOGOS, JSON.stringify(updated));
  }

  static async getFavoriteLogos(): Promise<string[]> {
    try {
      const stored = await LocalStorage.getItem(STORAGE_KEYS.FAVORITE_LOGOS);
      return stored ? JSON.parse(stored as string) : [];
    } catch (error) {
      console.error("Error loading favorite logos:", error);
      return [];
    }
  }

  static async toggleFavoriteLogo(logoId: string): Promise<boolean> {
    const favorites = await this.getFavoriteLogos();
    const isFavorite = favorites.includes(logoId);

    const updated = isFavorite ? favorites.filter((id) => id !== logoId) : [...favorites, logoId];

    await LocalStorage.setItem(STORAGE_KEYS.FAVORITE_LOGOS, JSON.stringify(updated));
    return !isFavorite;
  }

  static async exportCollection(name: string, description: string, logoIds: string[]): Promise<LogoCollection> {
    const userLogos = await this.getUserLogos();
    const selectedLogos = userLogos.filter((logo) => logoIds.includes(logo.id));

    const collection: LogoCollection = {
      name,
      description,
      logos: selectedLogos,
      createdAt: new Date(),
      version: "1.0.0",
    };

    return collection;
  }

  static async importCollection(collection: LogoCollection): Promise<void> {
    const userLogos = await this.getUserLogos();
    const existingIds = new Set(userLogos.map((logo) => logo.id));

    const newLogos = collection.logos
      .filter((logo) => !existingIds.has(logo.id))
      .map((logo) => ({
        ...logo,
        dateAdded: new Date(),
      }));

    await this.saveUserLogos([...userLogos, ...newLogos]);
  }

  static async getSyncedLogos(): Promise<Logo[]> {
    try {
      const stored = await LocalStorage.getItem(STORAGE_KEYS.SYNCED_LOGOS);
      if (!stored) return [];
      const logos = JSON.parse(stored as string);
      return logos.map((logo: any) => ({ ...logo, dateAdded: new Date(logo.dateAdded) }));
    } catch (error) {
      console.error("Error loading synced logos:", error);
      return [];
    }
  }

  static async saveSyncedLogos(logos: Logo[]): Promise<void> {
    try {
      await LocalStorage.setItem(STORAGE_KEYS.SYNCED_LOGOS, JSON.stringify(logos));
    } catch (error) {
      console.error("Error saving synced logos:", error);
      throw error;
    }
  }

  static async mergeSyncedLogos(newLogos: Logo[]): Promise<{ added: number; total: number }> {
    const existing = await this.getSyncedLogos();
    const existingIds = new Set(existing.map((l) => l.id));
    const toAdd = newLogos.filter((l) => !existingIds.has(l.id));
    const merged = [...existing, ...toAdd];
    await this.saveSyncedLogos(merged);
    return { added: toAdd.length, total: merged.length };
  }
}
