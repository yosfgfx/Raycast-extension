import { Detail, ActionPanel, Action, Icon, Toast, showToast } from "@raycast/api";
import { Logo } from "@/types/logo";
import { svgToBase64 } from "@/utils/svg";
import { LogoStorage } from "@/utils/storage";
import { pasteLogoAsFile } from "@/utils/svg-file-paste";
// No optimization or sanitization — show raw SVG

interface LogoDetailProps {
  logo: Logo;
}

export function LogoDetail({ logo }: LogoDetailProps) {
  const b64 = (svg?: string) => (svg ? svgToBase64(svg) : "");
  const originalPrimaryImg = logo.variants.original.primary ? `![](${b64(logo.variants.original.primary)})` : "";
  const originalSecondaryImg = logo.variants.original.secondary ? `![](${b64(logo.variants.original.secondary)})` : "";
  const darkPrimaryImg = logo.variants.dark.primary ? `![](${b64(logo.variants.dark.primary)})` : "";
  const darkSecondaryImg = logo.variants.dark.secondary ? `![](${b64(logo.variants.dark.secondary)})` : "";
  const brightPrimaryImg = logo.variants.bright.primary ? `![](${b64(logo.variants.bright.primary)})` : "";
  const brightSecondaryImg = logo.variants.bright.secondary ? `![](${b64(logo.variants.bright.secondary)})` : "";

  const markdown = `
# ${logo.nameEn}

**Arabic Name:** ${logo.nameAr}

**Category:** ${logo.category}

**Keywords:** ${logo.keywords.join(", ")}

## Original
${originalPrimaryImg}
${originalSecondaryImg}

## Dark
${darkPrimaryImg}
${darkSecondaryImg}

## Bright
${brightPrimaryImg}
${brightSecondaryImg}

${logo.brandGuidelinesUrl ? `\n[Brand Guidelines](${logo.brandGuidelinesUrl})` : ""}

${logo.usageRestrictions ? `\n**Usage Restrictions:** ${logo.usageRestrictions}` : ""}
`;

  const deleteLogo = async () => {
    try {
      if (logo.isUserAdded) {
        await LogoStorage.deleteUserLogo(logo.id);
        await showToast({ style: Toast.Style.Success, title: "Logo Deleted", message: `${logo.nameEn} removed` });
      } else {
        // Try remove from synced cache if exists
        const synced = await LogoStorage.getSyncedLogos();
        if (synced.find((l) => l.id === logo.id)) {
          const updated = synced.filter((l) => l.id !== logo.id);
          await LogoStorage.saveSyncedLogos(updated);
          await showToast({
            style: Toast.Style.Success,
            title: "Logo Deleted",
            message: `${logo.nameEn} removed from synced`,
          });
        } else {
          await showToast({ style: Toast.Style.Failure, title: "Cannot Delete Bundled Logo" });
        }
      }
    } catch (e) {
      await showToast({ style: Toast.Style.Failure, title: "Delete Failed" });
    }
  };

  return (
    <Detail
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Original Variant" content={logo.variants.original.primary || ""} />
          {logo.brandGuidelinesUrl && (
            <Action.OpenInBrowser title="Open Brand Guidelines" url={logo.brandGuidelinesUrl} />
          )}
          <Action
            title="Paste Original Primary"
            icon={Icon.Document}
            onAction={async () => {
              const r = await pasteLogoAsFile(logo, "original", "primary", {
                showFileLocation: false,
                copyCodeAsFallback: true,
              });
              await showToast({
                style: r.success ? Toast.Style.Success : Toast.Style.Failure,
                title: r.success ? "SVG Pasted" : "Paste Failed",
              });
            }}
          />
          {logo.variants.original.secondary && (
            <Action
              title="Paste Original Secondary"
              icon={Icon.Document}
              onAction={async () => {
                const r = await pasteLogoAsFile(logo, "original", "secondary", {
                  showFileLocation: false,
                  copyCodeAsFallback: true,
                });
                await showToast({
                  style: r.success ? Toast.Style.Success : Toast.Style.Failure,
                  title: r.success ? "SVG Pasted" : "Paste Failed",
                });
              }}
            />
          )}
          {logo.variants.dark.primary && (
            <Action
              title="Paste Dark Primary"
              icon={Icon.Document}
              onAction={async () => {
                const r = await pasteLogoAsFile(logo, "dark", "primary", {
                  showFileLocation: false,
                  copyCodeAsFallback: true,
                });
                await showToast({
                  style: r.success ? Toast.Style.Success : Toast.Style.Failure,
                  title: r.success ? "SVG Pasted" : "Paste Failed",
                });
              }}
            />
          )}
          {logo.variants.dark.secondary && (
            <Action
              title="Paste Dark Secondary"
              icon={Icon.Document}
              onAction={async () => {
                const r = await pasteLogoAsFile(logo, "dark", "secondary", {
                  showFileLocation: false,
                  copyCodeAsFallback: true,
                });
                await showToast({
                  style: r.success ? Toast.Style.Success : Toast.Style.Failure,
                  title: r.success ? "SVG Pasted" : "Paste Failed",
                });
              }}
            />
          )}
          {logo.variants.bright.primary && (
            <Action
              title="Paste Bright Primary"
              icon={Icon.Document}
              onAction={async () => {
                const r = await pasteLogoAsFile(logo, "bright", "primary", {
                  showFileLocation: false,
                  copyCodeAsFallback: true,
                });
                await showToast({
                  style: r.success ? Toast.Style.Success : Toast.Style.Failure,
                  title: r.success ? "SVG Pasted" : "Paste Failed",
                });
              }}
            />
          )}
          {logo.variants.bright.secondary && (
            <Action
              title="Paste Bright Secondary"
              icon={Icon.Document}
              onAction={async () => {
                const r = await pasteLogoAsFile(logo, "bright", "secondary", {
                  showFileLocation: false,
                  copyCodeAsFallback: true,
                });
                await showToast({
                  style: r.success ? Toast.Style.Success : Toast.Style.Failure,
                  title: r.success ? "SVG Pasted" : "Paste Failed",
                });
              }}
            />
          )}
          <Action title="Delete Logo" icon={Icon.Trash} onAction={deleteLogo} />
        </ActionPanel>
      }
    />
  );
}
