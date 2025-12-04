// Enhanced paste functionality for SVG content processing
import { svgToBase64, createReactComponent, createVueComponent, resizeSvg } from "@/utils/svg";

export interface PasteResult {
  success: boolean;
  content: string;
  format: "svg" | "base64" | "react" | "vue" | "file" | "unknown";
  error?: string;
  thumbnail?: string;
}

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  scale?: number;
  label?: string;
  badgePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  cardStyle?: boolean;
}

/**
 * Detects the format of clipboard content and determines if it's SVG
 */
export function detectContentFormat(content: string): {
  format: "svg" | "base64" | "react" | "vue" | "unknown";
  isValid: boolean;
} {
  if (!content || typeof content !== "string") {
    return { format: "unknown", isValid: false };
  }

  const trimmed = content.trim();

  // Check for SVG content
  if (trimmed.startsWith("<svg") || trimmed.startsWith('<?xml version="1.0"')) {
    return { format: "svg", isValid: true };
  }

  // Check for Base64 image data
  if (trimmed.startsWith("data:image/svg+xml;base64,")) {
    return { format: "base64", isValid: true };
  }

  // Check for React component
  if (trimmed.includes("import React") && trimmed.includes("SVGProps")) {
    return { format: "react", isValid: true };
  }

  // Check for Vue component
  if (trimmed.includes("<template>") && trimmed.includes("<svg")) {
    return { format: "vue", isValid: true };
  }

  // Check if it contains SVG-like content
  if (trimmed.includes("<svg") && trimmed.includes("</svg>")) {
    return { format: "svg", isValid: true };
  }

  return { format: "unknown", isValid: false };
}

/**
 * Enhanced paste function that detects format and processes SVG content
 */
export async function processPasteContent(
  content: string,
  options: {
    preferredFormat?: "svg" | "base64" | "react" | "vue";
    generateThumbnail?: boolean;
    thumbnailOptions?: ThumbnailOptions;
  } = {}
): Promise<PasteResult> {
  try {
    const { format, isValid } = detectContentFormat(content);

    if (!isValid) {
      return {
        success: false,
        content: content,
        format: "unknown",
        error: "Invalid or unrecognized content format",
      };
    }

    let processedContent = content;
    let thumbnail: string | undefined;

    // Process based on detected format
    switch (format) {
      case "svg": {
        if (options.generateThumbnail) {
          thumbnail = await generateSvgThumbnail(processedContent, options.thumbnailOptions);
        }
        break;
      }

      case "base64":
        // Validate base64 format
        if (!isValidBase64Image(processedContent)) {
          return {
            success: false,
            content: content,
            format: "base64",
            error: "Invalid base64 image format",
          };
        }
        break;

      case "react":
      case "vue":
        // These are already processed formats
        break;
    }

    // Convert to preferred format if specified
    if (options.preferredFormat && options.preferredFormat !== format) {
      processedContent = await convertToFormat(processedContent, format, options.preferredFormat);
    }

    return {
      success: true,
      content: processedContent,
      format: options.preferredFormat || format,
      thumbnail,
    };
  } catch (error) {
    return {
      success: false,
      content: content,
      format: "unknown",
      error: error instanceof Error ? error.message : "Unknown processing error",
    };
  }
}


/**
 * Generates a thumbnail preview for SVG content
 */
export function generateSvgThumbnail(svgContent: string, options: ThumbnailOptions = {}): string {
  const {
    width = 256,
    height = 256,
    scale = 1,
    label,
    badgePosition = "bottom-right",
    cardStyle = true,
  } = options;

  // Smart background detection
  let backgroundColor = options.backgroundColor;
  if (!backgroundColor) {
    const brightness = detectSvgBrightness(svgContent);
    backgroundColor = brightness === "light" ? "#1F1F1F" : "#FFFFFF";
  }

  try {
    // Clean the input SVG
    let svgStr = svgContent.trim();

    // Remove XML declaration if present
    svgStr = svgStr.replace(/<\?xml[^>]*\?>/gi, "");

    // Extract viewBox or construct one from width/height
    let viewBox = [0, 0, 100, 100]; // Default fallback [minX, minY, width, height]

    const viewBoxMatch = svgStr.match(/viewBox\s*=\s*["']([^"']+)["']/i);
    if (viewBoxMatch) {
      const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(parseFloat);
      if (parts.length === 4 && parts.every(n => !isNaN(n))) {
        viewBox = parts;
      }
    } else {
      // Try to extract width and height to construct viewBox
      const widthMatch = svgStr.match(/(?:^|[^-])width\s*=\s*["']?([0-9.]+)/i);
      const heightMatch = svgStr.match(/(?:^|[^-])height\s*=\s*["']?([0-9.]+)/i);

      if (widthMatch && heightMatch) {
        const w = parseFloat(widthMatch[1]);
        const h = parseFloat(heightMatch[1]);
        if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
          viewBox = [0, 0, w, h];
        }
      }
    }

    // Extract the inner content of the SVG
    const svgTagRegex = /<svg[^>]*>([\s\S]*?)<\/svg>/i;
    const match = svgStr.match(svgTagRegex);

    let innerContent = "";
    if (match && match[1]) {
      innerContent = match[1].trim();
    } else {
      innerContent = svgStr.replace(/<\/?svg[^>]*>/gi, "").trim();
    }

    // If inner content is empty, return a placeholder
    if (!innerContent || innerContent.length === 0) {
      console.warn("Empty SVG content detected");
      const fallbackSvg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="16" fill="#F3F4F6" stroke="#E5E7EB" stroke-width="2"/>
  <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-family="system-ui" font-size="14" fill="#9CA3AF">No Logo</text>
</svg>`;
      return svgToBase64(fallbackSvg);
    }

    // Card dimensions
    const cardWidth = width;
    const cardHeight = height;
    const padding = cardWidth * 0.10; // 10% padding - smaller for better logo visibility

    // Available space for the logo
    const availableWidth = cardWidth - (padding * 2);
    const availableHeight = cardHeight - (padding * 2);

    // Original logo dimensions from viewBox
    const [vbMinX, vbMinY, vbWidth, vbHeight] = viewBox;

    // Calculate scale to fit logo in available space while maintaining aspect ratio
    const scaleX = availableWidth / vbWidth;
    const scaleY = availableHeight / vbHeight;
    const logoScale = Math.min(scaleX, scaleY) * 0.8; // Scale to 80% of max size for safety margin

    // Calculate scaled dimensions
    const scaledWidth = vbWidth * logoScale;
    const scaledHeight = vbHeight * logoScale;

    // Calculate translation to center the logo
    const translateX = padding + (availableWidth - scaledWidth) / 2 - (vbMinX * logoScale);
    const translateY = padding + (availableHeight - scaledHeight) / 2 - (vbMinY * logoScale);

    // Build the wrapper SVG with transform-based scaling
    const wrapperSvg = `<svg width="${cardWidth}" height="${cardHeight}" viewBox="0 0 ${cardWidth} ${cardHeight}" xmlns="http://www.w3.org/2000/svg">
  <!-- Card Background -->
  <rect x="2" y="2" width="${cardWidth - 4}" height="${cardHeight - 4}" rx="16" ry="16" fill="${backgroundColor}" stroke="#E5E7EB" stroke-width="2"/>
  
  <!-- Logo Content with Transform -->
  <g transform="translate(${translateX}, ${translateY}) scale(${logoScale})">
${innerContent}
  </g>
</svg>`;

    return svgToBase64(wrapperSvg);
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    // Return a simple fallback thumbnail
    const fallbackSvg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="16" fill="#F3F4F6" stroke="#E5E7EB" stroke-width="2"/>
  <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-family="system-ui" font-size="14" fill="#9CA3AF">Error</text>
</svg>`;
    return svgToBase64(fallbackSvg);
  }
}

/**
 * Analyzes SVG content to determine if it's mostly light or dark.
 * Returns 'light' if the logo is mostly bright colors (needs dark BG),
 * 'dark' otherwise (needs white BG).
 */
function detectSvgBrightness(svg: string): "light" | "dark" {
  try {
    const lowerSvg = svg.toLowerCase();
    let totalLuminance = 0;
    let colorCount = 0;

    // 1. Extract Hex Colors
    const hexMatches = svg.match(/#[0-9A-Fa-f]{3,6}/g) || [];
    for (const hex of hexMatches) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      let lum;
      if (isNaN(r)) { // 3-digit hex
        const r3 = parseInt(hex[1] + hex[1], 16);
        const g3 = parseInt(hex[2] + hex[2], 16);
        const b3 = parseInt(hex[3] + hex[3], 16);
        lum = (0.299 * r3 + 0.587 * g3 + 0.114 * b3);
      } else {
        lum = (0.299 * r + 0.587 * g + 0.114 * b);
      }
      totalLuminance += lum;
      colorCount++;
    }

    // 2. Extract RGB Colors
    const rgbMatches = svg.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi) || [];
    for (const rgb of rgbMatches) {
      const parts = rgb.match(/\d+/g);
      if (parts && parts.length === 3) {
        const r = parseInt(parts[0]);
        const g = parseInt(parts[1]);
        const b = parseInt(parts[2]);
        const lum = (0.299 * r + 0.587 * g + 0.114 * b);
        totalLuminance += lum;
        colorCount++;
      }
    }

    // 3. Extract Named Colors (Basic Set)
    // We only check for 'white' and 'black' as they are most common for logos
    const whiteMatches = (lowerSvg.match(/["':\s]white["';\s]/g) || []).length + (lowerSvg.match(/["':\s]#fff["';\s]/g) || []).length;
    const blackMatches = (lowerSvg.match(/["':\s]black["';\s]/g) || []).length + (lowerSvg.match(/["':\s]#000["';\s]/g) || []).length;

    if (whiteMatches > 0) {
      totalLuminance += (255 * whiteMatches);
      colorCount += whiteMatches;
    }
    if (blackMatches > 0) {
      totalLuminance += (0 * blackMatches);
      colorCount += blackMatches;
    }

    // Decision Logic
    if (colorCount === 0) {
      // No colors found. 
      // If it contains "white" anywhere (even if regex missed), assume light.
      if (lowerSvg.includes("white") || lowerSvg.includes("#fff")) return "light";
      // Default to dark (needs white BG)
      return "dark";
    }

    const avgLuminance = totalLuminance / colorCount;

    // Threshold: 180 (out of 255). 
    // If > 180, it's mostly light -> Needs Dark BG.
    // If <= 180, it's mostly dark/colored -> Needs White BG.
    return avgLuminance > 180 ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/**
 * Converts content between different formats
 */
async function convertToFormat(content: string, fromFormat: string, toFormat: string): Promise<string> {
  switch (toFormat) {
    case "svg":
      if (fromFormat === "base64") {
        return base64ToSvg(content);
      }
      return content;

    case "base64":
      if (fromFormat === "svg") {
        return svgToBase64(content);
      }
      return content;

    case "react":
      if (fromFormat === "svg") {
        return createReactComponent(content, "PastedLogo");
      }
      return content;

    case "vue":
      if (fromFormat === "svg") {
        return createVueComponent(content, "PastedLogo");
      }
      return content;

    default:
      return content;
  }
}

/**
 * Validates base64 image format
 */
function isValidBase64Image(base64String: string): boolean {
  try {
    // Check if it's a data URL format
    if (!base64String.startsWith("data:image/")) {
      return false;
    }

    // Extract the base64 part
    const base64Part = base64String.split(",")[1];
    if (!base64Part) return false;

    // Try to decode it
    atob(base64Part);
    return true;
  } catch {
    return false;
  }
}

/**
 * Converts base64 data URL back to SVG
 */
function base64ToSvg(base64String: string): string {
  try {
    const base64Part = base64String.split(",")[1];
    if (!base64Part) return base64String;

    return decodeURIComponent(atob(base64Part));
  } catch {
    return base64String;
  }
}

// Re-export existing functions for convenience
export { svgToBase64, createReactComponent, createVueComponent, resizeSvg };
