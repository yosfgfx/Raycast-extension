import { showToast, Toast } from "@raycast/api";
import { existsSync, mkdirSync, writeFileSync, statSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { spawn } from "child_process";

export interface SvgFileOptions {
  directory?: string;
  filename?: string;
  createDirectory?: boolean;
  overwrite?: boolean;
  openAfterSave?: boolean;
}

export interface SvgFileResult {
  success: boolean;
  filePath?: string;
  error?: string;
  fileName?: string;
}

/**
 * Default SVG save directory
 */
export function getDefaultSvgDirectory(): string {
  const defaultDir = join(homedir(), "Documents", "Saudi Logo Vault", "SVG Files");
  return defaultDir;
}

/**
 * Generate a unique filename for SVG files
 */
export function generateSvgFilename(logoName: string, variant: string = "original", timestamp: boolean = true): string {
  const sanitizedName = logoName
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

  const timeSuffix = timestamp ? `-${Date.now()}` : "";
  const filename = `${sanitizedName}-${variant}${timeSuffix}.svg`;

  return filename;
}

/**
 * Save SVG content to a file
 */
export async function saveSvgFile(svgContent: string, options: SvgFileOptions = {}): Promise<SvgFileResult> {
  try {
    // Validate SVG content
    if (!svgContent || typeof svgContent !== "string") {
      throw new Error("Invalid SVG content");
    }

    if (!svgContent.trim().startsWith("<svg")) {
      throw new Error("Content is not valid SVG");
    }

    // Determine directory
    const directory = options.directory || getDefaultSvgDirectory();

    // Create directory if it doesn't exist
    if (options.createDirectory !== false && !existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }

    // Generate filename if not provided
    const filename = options.filename || generateSvgFilename("logo", "custom");
    const filePath = join(directory, filename);

    // Check if file exists and overwrite is not allowed
    if (existsSync(filePath) && !options.overwrite) {
      throw new Error(`File already exists: ${filename}`);
    }

    // Ensure proper SVG formatting
    const formattedSvg = formatSvgContent(svgContent);

    // Write file
    writeFileSync(filePath, formattedSvg, "utf8");

    // Show success notification
    await showToast({
      style: Toast.Style.Success,
      title: "SVG File Saved",
      message: `Saved as ${filename}`,
    });

    if (options.openAfterSave) {
      try {
        spawn("open", ["-R", filePath], { stdio: "ignore", detached: true }).unref();
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      filePath,
      fileName: filename,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await showToast({
      style: Toast.Style.Failure,
      title: "Save Failed",
      message: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Format SVG content for consistent output
 */
function formatSvgContent(content: string): string {
  // Remove extra whitespace and format consistently
  let formatted = content.trim();

  // Add XML declaration if missing
  if (!formatted.startsWith("<?xml")) {
    formatted = `<?xml version="1.0" encoding="UTF-8"?>\n${formatted}`;
  }

  // Ensure proper SVG namespace
  if (!formatted.includes('xmlns="http://www.w3.org/2000/svg"')) {
    formatted = formatted.replace(/<svg([^>]*)>/, '<svg xmlns="http://www.w3.org/2000/svg"$1>');
  }

  return formatted;
}

/**
 * Get file information for saved SVG files
 */
export function getSvgFileInfo(filePath: string): {
  exists: boolean;
  size?: number;
  modified?: Date;
} {
  try {
    const stats = statSync(filePath);
    return {
      exists: true,
      size: stats.size,
      modified: stats.mtime,
    };
  } catch {
    return { exists: false };
  }
}

/**
 * Create a batch of SVG files from logo variants
 */
export async function saveLogoVariants(
  logo: {
    name: string;
    variants: {
      original: { primary: string; secondary?: string };
      dark: { primary: string; secondary?: string };
      bright: { primary: string; secondary?: string };
    };
  },
  options: SvgFileOptions = {}
): Promise<SvgFileResult[]> {
  const results: SvgFileResult[] = [];
  const baseOptions = { ...options, createDirectory: true };

  // Create a directory for this logo
  const logoDir = join(
    options.directory || getDefaultSvgDirectory(),
    logo.name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-")
  );

  try {
    // Save original variants
    const originalPrimaryFilename = generateSvgFilename(logo.name, "original-primary", false);
    results.push(
      await saveSvgFile(logo.variants.original.primary, {
        ...baseOptions,
        directory: logoDir,
        filename: originalPrimaryFilename,
      })
    );

    if (logo.variants.original.secondary) {
      const originalSecondaryFilename = generateSvgFilename(logo.name, "original-secondary", false);
      results.push(
        await saveSvgFile(logo.variants.original.secondary, {
          ...baseOptions,
          directory: logoDir,
          filename: originalSecondaryFilename,
        })
      );
    }

    // Save dark variants
    const darkPrimaryFilename = generateSvgFilename(logo.name, "dark-primary", false);
    results.push(
      await saveSvgFile(logo.variants.dark.primary, {
        ...baseOptions,
        directory: logoDir,
        filename: darkPrimaryFilename,
      })
    );

    if (logo.variants.dark.secondary) {
      const darkSecondaryFilename = generateSvgFilename(logo.name, "dark-secondary", false);
      results.push(
        await saveSvgFile(logo.variants.dark.secondary, {
          ...baseOptions,
          directory: logoDir,
          filename: darkSecondaryFilename,
        })
      );
    }

    // Save bright variants
    const brightPrimaryFilename = generateSvgFilename(logo.name, "bright-primary", false);
    results.push(
      await saveSvgFile(logo.variants.bright.primary, {
        ...baseOptions,
        directory: logoDir,
        filename: brightPrimaryFilename,
      })
    );

    if (logo.variants.bright.secondary) {
      const brightSecondaryFilename = generateSvgFilename(logo.name, "bright-secondary", false);
      results.push(
        await saveSvgFile(logo.variants.bright.secondary, {
          ...baseOptions,
          directory: logoDir,
          filename: brightSecondaryFilename,
        })
      );
    }

    return results;
  } catch (error) {
    console.error("Error saving logo variants:", error);
    return results;
  }
}
