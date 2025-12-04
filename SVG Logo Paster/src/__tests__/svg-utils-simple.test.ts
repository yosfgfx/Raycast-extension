// Simple test utilities for validation
export function runTests() {
  console.log("Running Saudi Logo Vault Extension Tests...");

  // Test SVG validation
  testValidateSvg();
  testOptimizeSvg();
  testExtractSvgColors();
  testSvgToBase64();

  console.log("All tests completed!");
}

function testValidateSvg() {
  console.log("Testing SVG validation...");

  // Test valid SVG
  const validSvg = '<svg width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>';
  console.log("Valid SVG test:", validateSvg(validSvg));

  // Test invalid SVG
  const invalidSvg = "<div>Not an SVG</div>";
  console.log("Invalid SVG test:", validateSvg(invalidSvg));

  // Test malicious SVG
  const maliciousSvg = '<svg><script>alert("xss")</script></svg>';
  console.log("Malicious SVG test:", validateSvg(maliciousSvg));
}

function testOptimizeSvg() {
  console.log("Testing SVG optimization...");

  const svg = '<svg   width="100"   height="100"   ></svg>';
  const optimized = optimizeSvg(svg);
  console.log("Optimized SVG:", optimized);
}

function testExtractSvgColors() {
  console.log("Testing color extraction...");

  const svg = '<svg><circle fill="#FF0000"/><rect fill="#00FF00"/></svg>';
  const colors = extractSvgColors(svg);
  console.log("Extracted colors:", colors);
}

function testSvgToBase64() {
  console.log("Testing Base64 conversion...");

  const svg = '<svg width="100" height="100"></svg>';
  const base64 = svgToBase64(svg);
  console.log("Base64 result:", base64);
}

// Inline the SVG utilities for testing
function validateSvg(svgString: string): { isValid: boolean; error?: string } {
  try {
    if (!svgString || typeof svgString !== "string") {
      return { isValid: false, error: "SVG must be a non-empty string" };
    }

    const trimmed = svgString.trim();
    if (!trimmed.startsWith("<svg") || !trimmed.endsWith("</svg>")) {
      return { isValid: false, error: "SVG must start with <svg> and end with </svg>" };
    }

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

function optimizeSvg(svgString: string): string {
  try {
    let optimized = svgString.replace(/\s+/g, " ");
    optimized = optimized.replace(/\s+=""/g, "");
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, "");
    optimized = optimized.replace(/xmlns:xlink="[^"]*"/g, "");
    return optimized.trim();
  } catch (error) {
    return svgString;
  }
}

function extractSvgColors(svgString: string): string[] {
  const colors = new Set<string>();
  const colorRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|rgb\([^)]+\)|rgba\([^)]+\)/g;

  const matches = svgString.match(colorRegex);
  if (matches) {
    matches.forEach((color) => colors.add(color));
  }

  return Array.from(colors);
}

function svgToBase64(svgString: string): string {
  try {
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    throw new Error("Failed to convert SVG to base64");
  }
}

// Run tests if this file is executed directly
if (typeof module !== "undefined" && module.exports) {
  module.exports = { runTests };
} else {
  // Run tests in browser/Node environment
  runTests();
}
