import { useState } from "react";
import { Form, ActionPanel, Action, showToast, Toast, popToRoot, Icon } from "@raycast/api";
import { Logo, LogoCategory } from "@/types/logo";
import { LogoStorage } from "@/utils/storage";
import { generateSmartKeywords } from "@/utils/keyword-generator";

interface EditLogoFormProps {
  logo: Logo;
  onSave: () => void;
}

export function EditLogoForm({ logo, onSave }: EditLogoFormProps) {
  const [nameEn, setNameEn] = useState(logo.nameEn);
  const [nameAr, setNameAr] = useState(logo.nameAr);
  const [category, setCategory] = useState<LogoCategory>(logo.category);
  const [keywords, setKeywords] = useState(logo.keywords.join(", "));
  const [originalPrimary, setOriginalPrimary] = useState(logo.variants.original.primary);
  const [originalSecondary, setOriginalSecondary] = useState(logo.variants.original.secondary || "");
  const [darkPrimary, setDarkPrimary] = useState(logo.variants.dark.primary);
  const [darkSecondary, setDarkSecondary] = useState(logo.variants.dark.secondary || "");
  const [brightPrimary, setBrightPrimary] = useState(logo.variants.bright.primary);
  const [brightSecondary, setBrightSecondary] = useState(logo.variants.bright.secondary || "");
  const [brandGuidelinesUrl, setBrandGuidelinesUrl] = useState(logo.brandGuidelinesUrl || "");
  const [usageRestrictions, setUsageRestrictions] = useState(logo.usageRestrictions || "");

  const validateAndSave = async () => {
    try {
      // Validate required fields
      if (!nameEn.trim()) {
        throw new Error("English name is required");
      }

      if (!originalPrimary.trim()) {
        throw new Error("Original primary variant is required");
      }

      // No validation or sanitization — store raw SVG as provided

      // Create updated logo object
      const updatedLogo: Logo = {
        ...logo,
        nameEn: nameEn.trim(),
        nameAr: nameAr.trim() || nameEn.trim(),
        category,
        keywords: keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k.length > 0),
        variants: {
          original: {
            primary: originalPrimary,
            secondary: originalSecondary || undefined,
          },
          dark: {
            primary: darkPrimary || originalPrimary,
            secondary: darkSecondary || undefined,
          },
          bright: {
            primary: brightPrimary || originalPrimary,
            secondary: brightSecondary || undefined,
          },
        },
        brandGuidelinesUrl: brandGuidelinesUrl.trim() || undefined,
        usageRestrictions: usageRestrictions.trim() || undefined,
      };

      await LogoStorage.updateUserLogo(logo.id, updatedLogo);

      await showToast({
        style: Toast.Style.Success,
        title: "Logo Updated",
        message: `"${nameEn}" has been updated`,
      });

      onSave();
      await popToRoot();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Validation Error",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Update Logo" icon={Icon.Pencil} onSubmit={validateAndSave} />
          <Action
            title="Auto-generate Keywords"
            icon={Icon.Wand}
            onAction={() => {
              const newKeywords = generateSmartKeywords(nameEn, nameAr);
              const current = keywords
                .split(",")
                .map((k) => k.trim())
                .filter((k) => k.length > 0);
              const merged = Array.from(new Set([...current, ...newKeywords])).join(", ");
              setKeywords(merged);
              showToast({ title: "Keywords Generated", message: `Added ${newKeywords.length} keywords` });
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="nameEn"
        title="English Name"
        placeholder="Enter logo name in English"
        value={nameEn}
        onChange={setNameEn}
        autoFocus
      />

      <Form.TextField
        id="nameAr"
        title="Arabic Name"
        placeholder="Enter logo name in Arabic (optional)"
        value={nameAr}
        onChange={setNameAr}
      />

      <Form.Dropdown
        id="category"
        title="Category"
        value={category}
        onChange={(value) => setCategory(value as LogoCategory)}
      >
        <Form.Dropdown.Item value="government" title="Government Entities" />
        <Form.Dropdown.Item value="finance" title="Banks & Finance" />
        <Form.Dropdown.Item value="telecom" title="Telecommunications" />
        <Form.Dropdown.Item value="energy" title="Energy & Oil" />
        <Form.Dropdown.Item value="airlines" title="Airlines" />
        <Form.Dropdown.Item value="retail" title="Retail" />
        <Form.Dropdown.Item value="technology" title="Technology" />
        <Form.Dropdown.Item value="healthcare" title="Healthcare" />
        <Form.Dropdown.Item value="education" title="Education" />
        <Form.Dropdown.Item value="custom" title="Custom" />
      </Form.Dropdown>

      <Form.TextField
        id="keywords"
        title="Keywords"
        placeholder="Enter keywords separated by commas"
        value={keywords}
        onChange={setKeywords}
        info="Comma separated keywords for search"
      />

      <Form.Separator />

      <Form.Description text="SVG Variants" />

      <Form.TextArea
        id="originalPrimary"
        title="Original Primary Variant"
        placeholder="Paste SVG code for original primary variant"
        value={originalPrimary}
        onChange={setOriginalPrimary}
        info="Required: Paste your SVG code here"
      />

      <Form.TextArea
        id="originalSecondary"
        title="Original Secondary Variant"
        placeholder="Paste SVG code for original secondary variant (optional)"
        value={originalSecondary}
        onChange={setOriginalSecondary}
        info="Optional: Alternative version of the logo"
      />

      <Form.TextArea
        id="darkPrimary"
        title="Dark Primary Variant"
        placeholder="Paste SVG code for dark primary variant (optional)"
        value={darkPrimary}
        onChange={setDarkPrimary}
        info="Optional: Dark mode optimized version"
      />

      <Form.TextArea
        id="darkSecondary"
        title="Dark Secondary Variant"
        placeholder="Paste SVG code for dark secondary variant (optional)"
        value={darkSecondary}
        onChange={setDarkSecondary}
        info="Optional: Dark mode alternative version"
      />

      <Form.TextArea
        id="brightPrimary"
        title="Bright Primary Variant"
        placeholder="Paste SVG code for bright primary variant (optional)"
        value={brightPrimary}
        onChange={setBrightPrimary}
        info="Optional: Light/white version for dark backgrounds"
      />

      <Form.TextArea
        id="brightSecondary"
        title="Bright Secondary Variant"
        placeholder="Paste SVG code for bright secondary variant (optional)"
        value={brightSecondary}
        onChange={setBrightSecondary}
        info="Optional: Light/white alternative version"
      />

      <Form.Separator />

      <Form.TextField
        id="brandGuidelinesUrl"
        title="Brand Guidelines URL"
        placeholder="https://example.com/brand-guidelines"
        value={brandGuidelinesUrl}
        onChange={setBrandGuidelinesUrl}
      />

      <Form.TextArea
        id="usageRestrictions"
        title="Usage Restrictions"
        placeholder="Any usage restrictions or notes"
        value={usageRestrictions}
        onChange={setUsageRestrictions}
        info="Optional: Legal or usage notes"
      />
    </Form>
  );
}
