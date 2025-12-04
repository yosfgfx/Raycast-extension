import { Clipboard, showToast, Toast } from "@raycast/api";
import { processPasteContent, PasteResult } from "@/utils/paste-enhancements";
import { SvgFileOptions } from "@/utils/svg-file-handler";
import { Logo } from "@/types/logo";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

export interface FilePasteOptions extends SvgFileOptions {
  createFile?: boolean;
  copyCodeAsFallback?: boolean;
  showFileLocation?: boolean;
  openAfterSave?: boolean;
  deliverToActiveApp?: boolean;
}

/**
 * Enhanced paste function that saves SVG content as files
 */
export async function pasteSvgAsFile(content: string, options: FilePasteOptions = {}): Promise<PasteResult> {
  const { createFile = true, copyCodeAsFallback = true, ...fileOptions } = options;

  try {
    // Process the content first
    const processedResult = await processPasteContent(content, {
      generateThumbnail: true,
      preferredFormat: "svg",
    });

    if (!processedResult.success) {
      return processedResult;
    }

    if (!createFile) {
      // Fallback to copying code if file creation is disabled
      await Clipboard.copy(processedResult.content);
      return {
        ...processedResult,
        format: "svg",
      };
    }

    // Generate temp filename
    const baseName = fileOptions.filename?.replace(/\.svg$/i, "") || "pasted-logo";
    const fileName = `${String(baseName).replace(/\s+/g, "-").toLowerCase()}.svg`;
    const filePath = path.join(os.tmpdir(), fileName);
    await fs.writeFile(filePath, String(processedResult.content), "utf8");

    // Paste the file directly into the active window via Raycast API
    try {
      await Clipboard.paste({ file: filePath });
      await showToast({
        style: Toast.Style.Success,
        title: "SVG Pasted",
        message: `Pasted ${fileName} into active window`,
      });
      return {
        success: true,
        content: filePath,
        format: "file",
        thumbnail: processedResult.thumbnail,
      };
    } catch (err) {
      if (copyCodeAsFallback) {
        try {
          await Clipboard.copy({ file: filePath } as any);
        } catch {
          void 0;
        }
        await showToast({
          style: Toast.Style.Failure,
          title: "Paste Failed",
          message: "Placed SVG file on clipboard; press Cmd+V",
        });
        return {
          success: true,
          content: filePath,
          format: "file",
          error: err instanceof Error ? err.message : "Paste failed",
        };
      }
      return {
        success: false,
        content: content,
        format: "file",
        error: err instanceof Error ? err.message : "Paste failed",
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Fallback to copying code on any error
    if (copyCodeAsFallback) {
      await Clipboard.copy(content);
      await showToast({
        style: Toast.Style.Failure,
        title: "Paste Failed",
        message: "Copied original content instead",
      });

      return {
        success: true,
        content: content,
        format: "svg",
        error: errorMessage,
      };
    }

    return {
      success: false,
      content: content,
      format: "file",
      error: errorMessage,
    };
  }
}

/**
 * Enhanced logo paste function that saves logos as SVG files
 */
export async function pasteLogoAsFile(
  logo: Logo,
  variant: string,
  type: string = "primary",
  options: FilePasteOptions = {}
): Promise<PasteResult> {
  try {
    const variantData = logo.variants[variant as keyof typeof logo.variants];
    const svgContent = variantData[type as keyof typeof variantData] || variantData.primary;

    if (!svgContent) {
      return {
        success: false,
        content: "",
        format: "file",
        error: `No ${variant} ${type} variant available for this logo`,
      };
    }

    // Generate descriptive filename
    const filename = `${logo.nameEn.replace(/\s+/g, "-").toLowerCase()}-${variant}-${type}.svg`;

    return await pasteSvgAsFile(svgContent, {
      ...options,
      filename,
      createFile: true,
      showFileLocation: false,
    });
  } catch (error) {
    return {
      success: false,
      content: "",
      format: "file",
      error: error instanceof Error ? error.message : "Failed to paste logo as file",
    };
  }
}

/**
 * Batch paste multiple logo variants as files
 */
export async function pasteLogoVariantsAsFiles(logo: Logo, options: FilePasteOptions = {}): Promise<PasteResult[]> {
  const results: PasteResult[] = [];

  try {
    // Create a directory for this logo

    // Process original variants
    if (logo.variants.original.primary) {
      const result = await pasteLogoAsFile(logo, "original", "primary", {
        ...options,
        filename: `${logo.nameEn.replace(/\s+/g, "-").toLowerCase()}-original-primary.svg`,
      });
      results.push(result);
    }

    if (logo.variants.original.secondary) {
      const result = await pasteLogoAsFile(logo, "original", "secondary", {
        ...options,
        filename: `${logo.nameEn.replace(/\s+/g, "-").toLowerCase()}-original-secondary.svg`,
      });
      results.push(result);
    }

    // Process dark variants
    if (logo.variants.dark.primary) {
      const result = await pasteLogoAsFile(logo, "dark", "primary", {
        ...options,
        filename: `${logo.nameEn.replace(/\s+/g, "-").toLowerCase()}-dark-primary.svg`,
      });
      results.push(result);
    }

    if (logo.variants.dark.secondary) {
      const result = await pasteLogoAsFile(logo, "dark", "secondary", {
        ...options,
        filename: `${logo.nameEn.replace(/\s+/g, "-").toLowerCase()}-dark-secondary.svg`,
      });
      results.push(result);
    }

    // Process bright variants
    if (logo.variants.bright.primary) {
      const result = await pasteLogoAsFile(logo, "bright", "primary", {
        ...options,
        filename: `${logo.nameEn.replace(/\s+/g, "-").toLowerCase()}-bright-primary.svg`,
      });
      results.push(result);
    }

    if (logo.variants.bright.secondary) {
      const result = await pasteLogoAsFile(logo, "bright", "secondary", {
        ...options,
        filename: `${logo.nameEn.replace(/\s+/g, "-").toLowerCase()}-bright-secondary.svg`,
      });
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error("Error pasting logo variants as files:", error);
    return results;
  }
}

/**
 * Get the default SVG directory path
 */
export function getDefaultSvgDirectory(): string {
  return path.join(os.homedir(), "Documents", "Saudi Logo Vault", "SVG Files");
}
