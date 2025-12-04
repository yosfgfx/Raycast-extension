import { useState, useEffect } from "react";
import { List, ActionPanel, Action, Icon, showToast, Toast, closeMainWindow } from "@raycast/api";
import { Logo } from "@/types/logo";
import { prePopulatedLogos } from "@/data/saudi-logos";
import { LogoStorage } from "@/utils/storage";
import { pasteLogoAsFile } from "@/utils/svg-file-paste";
import { generateSvgThumbnail } from "@/utils/paste-enhancements";
import { getPreferenceValues } from "@raycast/api";

export default function QuickPasteRecent() {
  const [recentLogoIds, setRecentLogoIds] = useState<string[]>([]);
  const [userLogos, setUserLogos] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentLogos();
  }, []);

  const loadRecentLogos = async () => {
    try {
      const [recentIds, userLogosData] = await Promise.all([LogoStorage.getRecentLogos(), LogoStorage.getUserLogos()]);

      setRecentLogoIds(recentIds);
      setUserLogos(userLogosData);
    } catch (error) {
      console.error("Error loading recent logos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const allLogos = [...prePopulatedLogos, ...userLogos];
  const recentLogos = recentLogoIds
    .map((id) => allLogos.find((logo) => logo.id === id))
    .filter((logo): logo is Logo => logo !== undefined);

  const pasteLogo = async (logo: Logo) => {
    try {
      const result = await pasteLogoAsFile(logo, "original", "primary", {
        createFile: true,
        showFileLocation: false,
        deliverToActiveApp: true,
      });

      if (result.success) {
        await LogoStorage.addToRecentLogos(logo.id);
        await showToast({
          style: Toast.Style.Success,
          title: "SVG Pasted",
          message: `${logo.nameEn} pasted into active window`,
        });
        await closeMainWindow();
      } else {
        await showToast({
          style: Toast.Style.Failure,
          title: "Paste Failed",
          message: result.error || "Failed to paste SVG file",
        });
      }
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Paste Failed",
        message: "Failed to paste SVG file",
      });
    }
  };

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search recent logos...">
      {recentLogos.length === 0 ? (
        <List.EmptyView
          title="No Recent Logos"
          description="No logos have been used recently. Use the main search command to find and use logos."
          icon={Icon.Clock}
        />
      ) : (
        recentLogos.map((logo) => (
          <List.Item
            key={logo.id}
            title={logo.nameEn}
            subtitle={logo.nameAr}
            keywords={[...logo.keywords, logo.category]}
            icon={
              (function () {
                const prefs = getPreferenceValues<{ thumbnailSize?: string; thumbnailBackground?: string }>();
                const size = Number(prefs.thumbnailSize ?? "256");
                const bg = prefs.thumbnailBackground;
                const svg = logo.variants.original.primary;
                return svg
                  ? generateSvgThumbnail(svg, {
                    width: size,
                    height: size,
                    // Only pass backgroundColor if explicitly set and not "transparent"
                    backgroundColor: bg && bg !== "transparent" ? bg : undefined,
                    cardStyle: true,
                  })
                  : Icon.Image;
              })() as any
            }
            accessories={[
              {
                text: logo.category,
                icon: logo.isUserAdded ? Icon.Person : Icon.Building,
              },
            ]}
            actions={
              <ActionPanel>
                <Action title="Paste Original Primary" icon={Icon.Document} onAction={() => pasteLogo(logo)} />
                <Action
                  title="Paste Original Secondary"
                  icon={Icon.Document}
                  onAction={() => pasteLogoAsFile(logo, "original", "secondary")}
                />
                <Action
                  title="Paste Dark Primary"
                  icon={Icon.Document}
                  onAction={() => pasteLogoAsFile(logo, "dark", "primary")}
                />
                <Action
                  title="Paste Dark Secondary"
                  icon={Icon.Document}
                  onAction={() => pasteLogoAsFile(logo, "dark", "secondary")}
                />
                <Action
                  title="Paste Bright Primary"
                  icon={Icon.Document}
                  onAction={() => pasteLogoAsFile(logo, "bright", "primary")}
                />
                <Action
                  title="Paste Bright Secondary"
                  icon={Icon.Document}
                  onAction={() => pasteLogoAsFile(logo, "bright", "secondary")}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
