import { existsSync, readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join, basename, extname } from "path";
import { Logo, LogoVariant, LogoType } from "@/types/logo";

const METADATA_FILENAME = "logos.json";

interface LocalLogoMetadata {
  id: string;
  nameEn: string;
  nameAr?: string;
  keywords: string[];
  category?: string;
  isUserAdded?: boolean;
  dateAdded?: string;
}

export class LocalFolderManager {
  private folderPath: string;

  constructor(folderPath: string) {
    this.folderPath = folderPath;
  }

  public getLogos(): Logo[] {
    if (!existsSync(this.folderPath)) {
      return [];
    }

    const metadataMap = this.loadMetadata();
    const files = this.scanFiles(this.folderPath);
    const groupedFiles = this.groupFiles(files);

    const logos: Logo[] = [];

    for (const [baseId, variants] of Object.entries(groupedFiles)) {
      const metadata = metadataMap.get(baseId);

      // Determine name from metadata or filename
      const nameEn = metadata?.nameEn || this.formatName(baseId);

      const logo: Logo = {
        id: metadata?.id || baseId,
        nameEn: nameEn,
        nameAr: metadata?.nameAr || nameEn,
        category: (metadata?.category as any) || "custom",
        keywords: metadata?.keywords || [nameEn],
        variants: variants,
        isUserAdded: true,
        dateAdded: metadata?.dateAdded ? new Date(metadata.dateAdded) : new Date(),
      };

      logos.push(logo);
    }

    // If we found new logos that weren't in metadata, update the metadata file
    if (logos.length > metadataMap.size) {
      this.saveMetadata(logos);
    }

    return logos;
  }

  public updateLogoMetadata(logoId: string, updates: Partial<LocalLogoMetadata>) {
    const logos = this.getLogos();
    const index = logos.findIndex(l => l.id === logoId);
    if (index !== -1) {
      const logo = logos[index];
      if (updates.nameEn) logo.nameEn = updates.nameEn;
      if (updates.nameAr) logo.nameAr = updates.nameAr;
      if (updates.keywords) logo.keywords = updates.keywords;
      if (updates.category) logo.category = updates.category as any;

      this.saveMetadata(logos);
    }
  }

  private scanFiles(dir: string, depth: number = 0): string[] {
    // Safety limits to prevent memory issues
    const MAX_DEPTH = 3; // Reduced from 5
    const MAX_FILES = 1000; // Reduced from 10000 for better performance
    const BLACKLIST = ['node_modules', '.git', 'dist', 'build', '.next', 'Library', 'Applications', 'System'];

    if (depth > MAX_DEPTH) {
      return [];
    }

    let results: string[] = [];

    try {
      const list = readdirSync(dir);

      for (const file of list) {
        // Stop early if we've collected enough files
        if (results.length >= MAX_FILES) {
          break;
        }

        // Skip blacklisted directories
        if (BLACKLIST.includes(file)) {
          continue;
        }

        const filePath = join(dir, file);
        let stat;

        try {
          stat = statSync(filePath);
        } catch {
          // Skip files we can't stat (permissions, broken symlinks, etc.)
          continue;
        }

        if (stat && stat.isDirectory()) {
          results = results.concat(this.scanFiles(filePath, depth + 1));
        } else {
          if (extname(file).toLowerCase() === ".svg") {
            results.push(filePath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
      console.error(`Failed to scan directory: ${dir}`, error);
    }

    return results;
  }

  private groupFiles(filePaths: string[]): Record<string, any> {
    const groups: Record<string, any> = {};

    for (const filePath of filePaths) {
      const filename = basename(filePath, ".svg");
      // Expected format: name-variant-type.svg OR name.svg
      // Examples: 
      // aramco.svg -> original/primary
      // aramco-dark.svg -> dark/primary
      // aramco-dark-secondary.svg -> dark/secondary

      const parts = filename.split("-");
      let baseName = parts[0];
      let variant: LogoVariant = "original";
      let type: LogoType = "primary";

      // Simple heuristic for parsing
      // This can be improved but fits the "name-variant-type" pattern
      if (parts.length > 1) {
        const last = parts[parts.length - 1].toLowerCase();
        const secondLast = parts.length > 2 ? parts[parts.length - 2].toLowerCase() : null;

        if (last === "dark" || last === "bright" || last === "original") {
          variant = last as LogoVariant;
          baseName = parts.slice(0, parts.length - 1).join("-");
        } else if (last === "primary" || last === "secondary") {
          type = last as LogoType;
          if (secondLast && (secondLast === "dark" || secondLast === "bright" || secondLast === "original")) {
            variant = secondLast as LogoVariant;
            baseName = parts.slice(0, parts.length - 2).join("-");
          } else {
            baseName = parts.slice(0, parts.length - 1).join("-");
          }
        } else {
          // Just part of the name
          baseName = filename;
        }
      } else {
        baseName = filename;
      }

      if (!groups[baseName]) {
        groups[baseName] = {
          original: {},
          dark: {},
          bright: {}
        };
      }

      const content = readFileSync(filePath, "utf-8");

      // Ensure the variant object exists (it should from init above)
      if (!groups[baseName][variant]) {
        groups[baseName][variant] = {};
      }

      groups[baseName][variant][type] = content;
    }

    return groups;
  }

  private loadMetadata(): Map<string, LocalLogoMetadata> {
    const map = new Map<string, LocalLogoMetadata>();
    const metadataPath = join(this.folderPath, METADATA_FILENAME);

    if (existsSync(metadataPath)) {
      try {
        const content = readFileSync(metadataPath, "utf-8");
        const data = JSON.parse(content) as LocalLogoMetadata[];
        for (const item of data) {
          map.set(item.id, item);
        }
      } catch (e) {
        console.error("Failed to load metadata", e);
      }
    }

    return map;
  }

  private saveMetadata(logos: Logo[]) {
    const metadataPath = join(this.folderPath, METADATA_FILENAME);
    const metadata: LocalLogoMetadata[] = logos.map(l => ({
      id: l.id,
      nameEn: l.nameEn,
      nameAr: l.nameAr,
      keywords: l.keywords,
      category: l.category,
      isUserAdded: true,
      dateAdded: l.dateAdded.toISOString()
    }));

    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");
  }

  private formatName(id: string): string {
    return id
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}
