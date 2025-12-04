export function validateSvg(svgString: string): { isValid: boolean; error?: string } {
  try {
    // Basic SVG validation
    if (!svgString || typeof svgString !== "string") {
      return { isValid: false, error: "SVG must be a non-empty string" };
    }

    // Check for basic SVG structure
    const trimmed = svgString.trim();
    if (!trimmed.startsWith("<svg") || !trimmed.endsWith("</svg>")) {
      return { isValid: false, error: "SVG must start with <svg> and end with </svg>" };
    }

    // Check for malicious content
    const dangerousPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(svgString)) {
        return { isValid: false, error: "SVG contains potentially dangerous content" };
      }
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Invalid SVG format" };
  }
}

export function optimizeSvg(svgString: string): string {
  try {
    // Remove unnecessary whitespace
    let optimized = svgString.replace(/\s+/g, " ");

    // Remove empty attributes
    optimized = optimized.replace(/\s+=""/g, "");

    // Remove comments
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, "");

    // Remove unnecessary namespace declarations
    optimized = optimized.replace(/xmlns:xlink="[^"]*"/g, "");

    return optimized.trim();
  } catch (error) {
    return svgString;
  }
}

export function extractSvgColors(svgString: string): string[] {
  const colors = new Set<string>();
  const colorRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|rgb\([^)]+\)|rgba\([^)]+\)/g;

  const matches = svgString.match(colorRegex);
  if (matches) {
    matches.forEach((color) => colors.add(color));
  }

  return Array.from(colors);
}

export function createReactComponent(svgString: string, componentName: string = "Logo"): string {
  const reactSvg = svgString
    .replace(/class=/g, "className=")
    .replace(/fill-rule=/g, "fillRule=")
    .replace(/clip-rule=/g, "clipRule=")
    .replace(/stroke-width=/g, "strokeWidth=")
    .replace(/stroke-linecap=/g, "strokeLinecap=")
    .replace(/stroke-linejoin=/g, "strokeLinejoin=");

  return `import React from 'react';

const ${componentName}: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return ${reactSvg};
};

export default ${componentName};`;
}

export function createVueComponent(svgString: string, componentName: string = "Logo"): string {
  return `<template>
  ${svgString}
</template>

<script setup lang="ts">
// Vue 3 component for ${componentName}
</script>`;
}

export function svgToBase64(svgString: string): string {
  try {
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    throw new Error("Failed to convert SVG to base64");
  }
}

export function resizeSvg(svgString: string, size: "small" | "medium" | "large" | "original"): string {
  if (size === "original") return svgString;

  const dimensions = {
    small: { width: 24, height: 24 },
    medium: { width: 48, height: 48 },
    large: { width: 96, height: 96 },
  };

  const { width, height } = dimensions[size];

  // Replace or add width and height attributes
  let resized = svgString;

  // Try to replace existing width/height
  resized = resized.replace(/width="[^"]*"/, `width="${width}"`);
  resized = resized.replace(/height="[^"]*"/, `height="${height}"`);

  // If no width/height found, add them to the svg tag
  if (!resized.includes('width="')) {
    resized = resized.replace(/<svg/, `<svg width="${width}"`);
  }
  if (!resized.includes('height="')) {
    resized = resized.replace(/<svg/, `<svg height="${height}"`);
  }

  return resized;
}
