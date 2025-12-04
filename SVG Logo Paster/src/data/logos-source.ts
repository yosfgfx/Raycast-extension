import { Logo } from "@/types/logo";
import { prePopulatedLogos } from "@/data/saudi-logos";
import { LogoStorage } from "@/utils/storage";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join, basename, dirname } from "path";
import { LocalFolderManager } from "@/utils/local-folder-manager";

type SourceMode = "bundled" | "local-folder" | "remote-json" | "remote-csv" | "mixed";

interface SourcePreferences {
  logosSource?: SourceMode;
  logosFolderPath?: string;
  logosRemoteUrl?: string;
}

export async function loadLogos(prefs: SourcePreferences): Promise<Logo[]> {
  const mode = prefs.logosSource ?? "mixed";
  const results: Logo[] = [];

  // Include cached synced logos and user-added logos
  try {
    results.push(...(await LogoStorage.getSyncedLogos()));
  } catch { }
  try {
    results.push(...(await LogoStorage.getUserLogos()));
  } catch { }

  if (mode === "bundled" || mode === "mixed") {
    results.push(...prePopulatedLogos);
  }

  if ((mode === "local-folder" || mode === "mixed") && prefs.logosFolderPath) {
    results.push(...loadFromLocalFolder(prefs.logosFolderPath));
  }

  if ((mode === "remote-json" || mode === "mixed") && prefs.logosRemoteUrl) {
    try {
      const remoteJson = await fetch(prefs.logosRemoteUrl).then((r) => r.json());
      if (Array.isArray(remoteJson)) {
        results.push(...normalizeJson(remoteJson));
      } else if (Array.isArray(remoteJson?.logos)) {
        results.push(...normalizeJson(remoteJson.logos));
      }
    } catch { }
  }

  if (mode === "remote-csv" && prefs.logosRemoteUrl) {
    try {
      const csvText = await fetch(prefs.logosRemoteUrl).then((r) => r.text());
      results.push(...parseCsv(csvText));
    } catch { }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  return results.filter((l) => {
    if (!l.id) return true;
    if (seen.has(l.id)) return false;
    seen.add(l.id);
    return true;
  });
}

export async function syncNow(prefs: SourcePreferences): Promise<{ added: number; total: number }> {
  const mode = prefs.logosSource ?? "remote-json";
  let fetched: Logo[] = [];
  if (mode === "remote-json" && prefs.logosRemoteUrl) {
    try {
      const remoteJson = await fetch(prefs.logosRemoteUrl).then((r) => r.json());
      fetched = Array.isArray(remoteJson) ? normalizeJson(remoteJson) : normalizeJson(remoteJson?.logos || []);
    } catch { }
  } else if (mode === "remote-csv" && prefs.logosRemoteUrl) {
    try {
      const csvText = await fetch(prefs.logosRemoteUrl).then((r) => r.text());
      fetched = parseCsv(csvText);
    } catch { }
  } else {
    return { added: 0, total: (await LogoStorage.getSyncedLogos()).length };
  }
  const { added, total } = await LogoStorage.mergeSyncedLogos(fetched);
  return { added, total };
}

function loadFromLocalFolder(folder: string): Logo[] {
  const manager = new LocalFolderManager(folder);
  return manager.getLogos();
}

function safeReadDir(pathStr: string): string[] {
  try {
    return readdirSync(pathStr);
  } catch {
    return [];
  }
}

function normalizeJson(items: any[]): Logo[] {
  const out: Logo[] = [];
  for (const it of items) {
    if (!it) continue;
    const logo: Logo = {
      id: it.id || `${it.category || "custom"}-${it.nameEn || it.name || Date.now()}`,
      nameEn: it.nameEn || it.name || "Unnamed",
      nameAr: it.nameAr || it.nameEn || "",
      category: (it.category as any) || "custom",
      keywords: Array.isArray(it.keywords)
        ? it.keywords
        : String(it.keywords || "")
          .split(/[,\s]+/)
          .filter(Boolean),
      variants: it.variants || {
        original: { primary: it.svg || it.original_primary },
        dark: { primary: it.dark_primary || it.svg },
        bright: { primary: it.bright_primary || it.svg },
      },
      isUserAdded: !!it.isUserAdded,
      dateAdded: it.dateAdded ? new Date(it.dateAdded) : new Date(),
      brandGuidelinesUrl: it.brandGuidelinesUrl,
      usageRestrictions: it.usageRestrictions,
      colorPalette: it.colorPalette,
    };
    out.push(logo);
  }
  return out;
}

function parseCsv(csv: string): Logo[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);
  const out: Logo[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const get = (name: string) => (idx(name) >= 0 ? cols[idx(name)] : "");
    const logo: Logo = {
      id: get("id") || `${get("category")}-${get("nameEn")}-${i}`,
      nameEn: get("nameEn") || get("name") || "Unnamed",
      nameAr: get("nameAr") || get("nameEn") || "",
      category: (get("category") as any) || "custom",
      keywords: (get("keywords") || "").split(/[,\s]+/).filter(Boolean),
      variants: {
        original: { primary: get("original_primary"), secondary: get("original_secondary") || undefined },
        dark: {
          primary: get("dark_primary") || get("original_primary"),
          secondary: get("dark_secondary") || undefined,
        },
        bright: {
          primary: get("bright_primary") || get("original_primary"),
          secondary: get("bright_secondary") || undefined,
        },
      },
      isUserAdded: false,
      dateAdded: new Date(),
    };
    out.push(logo);
  }
  return out;
}
