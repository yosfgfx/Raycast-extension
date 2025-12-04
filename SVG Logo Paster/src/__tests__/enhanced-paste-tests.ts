import { detectContentFormat, processPasteContent, generateSvgThumbnail } from "@/utils/paste-enhancements";

// Test SVG content
const testSvgContent = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="#FF0000"/>
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="20">TEST</text>
</svg>
`;

const testBase64Content =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiNGRjAwMDAiLz48L3N2Zz4=";

const testReactComponent = `
import React from 'react';

const TestLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" {...props}>
      <circle cx="50" cy="50" r="40" fill="#00FF00"/>
    </svg>
  );
};

export default TestLogo;
`;

export async function runEnhancedPasteTests() {
  console.log("🧪 Running Enhanced Paste Function Tests...\n");

  // Test 1: Content Format Detection
  console.log("📋 Test 1: Content Format Detection");
  const svgDetection = detectContentFormat(testSvgContent);
  console.log("SVG Detection:", svgDetection);

  const base64Detection = detectContentFormat(testBase64Content);
  console.log("Base64 Detection:", base64Detection);

  const reactDetection = detectContentFormat(testReactComponent);
  console.log("React Component Detection:", reactDetection);

  const invalidDetection = detectContentFormat("<div>Not SVG</div>");
  console.log("Invalid Content Detection:", invalidDetection);

  // Test 2: SVG Processing
  console.log("\n🎨 Test 2: SVG Processing");
  const svgResult = await processPasteContent(testSvgContent, {
    generateThumbnail: true,
    preferredFormat: "svg",
  });
  console.log("SVG Processing Result:", {
    success: svgResult.success,
    format: svgResult.format,
    hasThumbnail: !!svgResult.thumbnail,
    error: svgResult.error,
  });

  // Test 3: Base64 Processing
  console.log("\n🔢 Test 3: Base64 Processing");
  const base64Result = await processPasteContent(testBase64Content, {
    generateThumbnail: false,
    preferredFormat: "svg",
  });
  console.log("Base64 Processing Result:", {
    success: base64Result.success,
    format: base64Result.format,
    error: base64Result.error,
  });

  // Test 4: Format Conversion
  console.log("\n🔄 Test 4: Format Conversion");
  const convertResult = await processPasteContent(testSvgContent, {
    preferredFormat: "base64",
  });
  console.log("SVG to Base64 Conversion:", {
    success: convertResult.success,
    format: convertResult.format,
    contentPreview: convertResult.content.substring(0, 50) + "...",
  });

  // Test 5: Thumbnail Generation
  console.log("\n🖼️ Test 5: Thumbnail Generation");
  try {
    const thumbnail = await generateSvgThumbnail(testSvgContent, {
      width: 64,
      height: 64,
      backgroundColor: "white",
      scale: 0.8,
    });
    console.log("Thumbnail Generated:", {
      success: true,
      length: thumbnail.length,
      preview: thumbnail.substring(0, 100) + "...",
    });
  } catch (error) {
    console.log("Thumbnail Generation Failed:", error);
  }

  // Test 6: Error Handling
  console.log("\n⚠️ Test 6: Error Handling");
  const invalidResult = await processPasteContent("<script>alert('xss')</script>", {
    generateThumbnail: true,
  });
  console.log("Invalid Content Handling:", {
    success: invalidResult.success,
    error: invalidResult.error,
  });

  // Test 7: Performance Test
  console.log("\n⚡ Test 7: Performance Test");
  const startTime = performance.now();

  for (let i = 0; i < 10; i++) {
    await processPasteContent(testSvgContent, {
      generateThumbnail: true,
    });
  }

  const endTime = performance.now();
  console.log("Performance (10 operations):", {
    totalTime: (endTime - startTime).toFixed(2) + "ms",
    averageTime: ((endTime - startTime) / 10).toFixed(2) + "ms",
  });

  console.log("\n✅ All Enhanced Paste Tests Completed!");
}

// Run tests if this file is executed
if (typeof window !== "undefined") {
  // Browser environment
  runEnhancedPasteTests().catch(console.error);
} else if (typeof module !== "undefined" && module.exports) {
  // Node.js environment
  module.exports = { runEnhancedPasteTests };
  runEnhancedPasteTests().catch(console.error);
}
