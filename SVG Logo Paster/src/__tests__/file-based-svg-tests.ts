import { saveSvgFile, generateSvgFilename, saveLogoVariants, getDefaultSvgDirectory } from "@/utils/svg-file-handler";
import { pasteSvgAsFile } from "@/utils/svg-file-paste";

// Test SVG content
const testSvgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="#FF0000"/>
  <text x="50" y="55" text-anchor="middle" fill="white" font-size="20">TEST</text>
</svg>`;

// Test logo data
const testLogo = {
  id: "test-logo-123",
  nameEn: "Test Logo",
  nameAr: "شعار اختبار",
  category: "technology" as const,
  keywords: ["test", "logo", "svg"],
  variants: {
    original: {
      primary: testSvgContent,
      secondary: testSvgContent.replace('fill="#FF0000"', 'fill="#00FF00"'),
    },
    dark: {
      primary: testSvgContent.replace('fill="#FF0000"', 'fill="#8B0000"'),
      secondary: testSvgContent.replace('fill="#FF0000"', 'fill="#006600"'),
    },
    bright: {
      primary: testSvgContent.replace('fill="#FF0000"', 'fill="#FFFFFF"'),
      secondary: testSvgContent.replace('fill="#FF0000"', 'fill="#CCCCCC"'),
    },
  },
  isUserAdded: true,
  dateAdded: new Date(),
  brandGuidelinesUrl: "https://example.com",
  usageRestrictions: "Test usage only",
  colorPalette: ["#FF0000", "#FFFFFF"],
};

export async function runFileBasedTests() {
  console.log("🧪 Running File-Based SVG Tests...\n");

  // Test 1: Filename Generation
  console.log("📄 Test 1: Filename Generation");
  const filename1 = generateSvgFilename("Saudi Aramco", "original-primary");
  const filename2 = generateSvgFilename("STC Telecom", "dark-secondary", false);
  console.log("Generated filenames:", filename1, filename2);

  // Test 2: Default Directory
  console.log("\n📁 Test 2: Default Directory");
  const defaultDir = getDefaultSvgDirectory();
  console.log("Default directory:", defaultDir);

  // Test 3: Single SVG File Save
  console.log("\n💾 Test 3: Single SVG File Save");
  try {
    const result = await saveSvgFile(testSvgContent, {
      filename: "test-logo.svg",
      createDirectory: true,
      overwrite: true,
    });
    console.log("Save result:", {
      success: result.success,
      filePath: result.filePath,
      error: result.error,
    });
  } catch (error) {
    console.log("Save error:", error);
  }

  // Test 4: Logo Variants Batch Save
  console.log("\n📦 Test 4: Logo Variants Batch Save");
  try {
    // Create the correct structure for saveLogoVariants
    const logoForFiles = {
      name: testLogo.nameEn,
      variants: {
        original: {
          primary: testSvgContent,
          secondary: testSvgContent.replace('fill="#FF0000"', 'fill="#00FF00"'),
        },
        dark: {
          primary: testSvgContent.replace('fill="#FF0000"', 'fill="#8B0000"'),
          secondary: testSvgContent.replace('fill="#FF0000"', 'fill="#006600"'),
        },
        bright: {
          primary: testSvgContent.replace('fill="#FF0000"', 'fill="#FFFFFF"'),
          secondary: testSvgContent.replace('fill="#FF0000"', 'fill="#CCCCCC"'),
        },
      },
    };

    const results = await saveLogoVariants(logoForFiles, {
      createDirectory: true,
      overwrite: false,
    });
    console.log("Batch save results:", {
      totalVariants: results.length,
      successful: results.filter((r: any) => r.success).length,
      failed: results.filter((r: any) => !r.success).length,
      firstFilePath: results[0]?.filePath,
    });
  } catch (error) {
    console.log("Batch save error:", error);
  }

  // Test 5: Paste as File Function
  console.log("\n🔄 Test 5: Paste as File Function");
  try {
    const pasteResult = await pasteSvgAsFile(testSvgContent, {
      createFile: true,
      showFileLocation: true,
      copyCodeAsFallback: true,
    });
    console.log("Paste result:", {
      success: pasteResult.success,
      format: pasteResult.format,
      contentPreview: pasteResult.content?.substring(0, 50),
      error: pasteResult.error,
    });
  } catch (error) {
    console.log("Paste error:", error);
  }

  // Test 6: Logo Paste as File
  console.log("\n🎨 Test 6: Logo Paste as File");
  try {
    // Use the SVG content directly for testing
    const logoResult = await pasteSvgAsFile(testLogo.variants.original.primary, {
      createFile: true,
      showFileLocation: true,
      filename: generateSvgFilename(testLogo.nameEn, "original-primary"),
    });
    console.log("Logo paste result:", {
      success: logoResult.success,
      format: logoResult.format,
      content: logoResult.content,
      error: logoResult.error,
    });
  } catch (error) {
    console.log("Logo paste error:", error);
  }

  // Test 7: Error Handling
  console.log("\n⚠️ Test 7: Error Handling");
  try {
    const invalidResult = await saveSvgFile("<div>Not SVG</div>", {
      filename: "invalid.svg",
    });
    console.log("Invalid content result:", {
      success: invalidResult.success,
      error: invalidResult.error,
    });
  } catch (error) {
    console.log("Invalid content error:", error);
  }

  // Test 8: Performance Test
  console.log("\n⚡ Test 8: Performance Test");
  const startTime = performance.now();

  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      saveSvgFile(testSvgContent, {
        filename: `performance-test-${i}.svg`,
        overwrite: true,
      })
    );
  }

  await Promise.all(promises);

  const endTime = performance.now();
  console.log("Performance (10 files):", {
    totalTime: (endTime - startTime).toFixed(2) + "ms",
    averageTime: ((endTime - startTime) / 10).toFixed(2) + "ms",
  });

  console.log("\n✅ All File-Based SVG Tests Completed!");
}

// Run tests if this file is executed
if (typeof window !== "undefined") {
  // Browser environment
  runFileBasedTests().catch(console.error);
} else if (typeof module !== "undefined" && module.exports) {
  // Node.js environment
  module.exports = { runFileBasedTests };
  runFileBasedTests().catch(console.error);
}
