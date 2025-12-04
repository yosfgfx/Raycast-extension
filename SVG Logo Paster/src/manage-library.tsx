import { useState, useEffect } from "react";
import { Grid, ActionPanel, Action, Icon, showToast, Toast, confirmAlert, Alert } from "@raycast/api";
import { Logo } from "@/types/logo";
import { LogoStorage } from "@/utils/storage";
import { EditLogoForm } from "@/components/edit-logo-form";
import { pasteLogoAsFile } from "@/utils/svg-file-paste";
import { generateLocalThumbnail } from "@/utils/thumbnail-utils";

export default function ManageLibrary() {
  const [userLogos, setUserLogos] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserLogos();
  }, []);

  const loadUserLogos = async () => {
    try {
      const logos = await LogoStorage.getUserLogos();
      setUserLogos(logos);
    } catch (error) {
      console.error("Error loading user logos:", error);
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to load user logos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLogo = async (logo: Logo) => {
    try {
      const confirmed = await confirmAlert({
        title: "Delete Logo",
        message: `Are you sure you want to delete "${logo.nameEn}"? This action cannot be undone.`,
        icon: Icon.Trash,
        primaryAction: {
          title: "Delete",
          style: Alert.ActionStyle.Destructive,
        },
      });

      if (confirmed) {
        await LogoStorage.deleteUserLogo(logo.id);
        await loadUserLogos();

        await showToast({
          style: Toast.Style.Success,
          title: "Logo Deleted",
          message: `"${logo.nameEn}" has been deleted`,
        });
      }
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to delete logo",
      });
    }
  };

  const toggleFavorite = async (logo: Logo) => {
    try {
      const isFavorite = await LogoStorage.toggleFavoriteLogo(logo.id);
      await showToast({
        style: Toast.Style.Success,
        title: isFavorite ? "Added to Favorites" : "Removed from Favorites",
        message: `"${logo.nameEn}" ${isFavorite ? "added to" : "removed from"} favorites`,
      });
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "Failed to update favorites",
      });
    }
  };

  return (
    <Grid
      isLoading={isLoading}
      searchBarPlaceholder="Search your logos..."
      itemSize={Grid.ItemSize.Small}
    >
      {userLogos.length === 0 ? (
        <Grid.EmptyView
          title="No Custom Logos"
          description="You haven't added any custom logos yet. Use the 'Add Custom Logo' command to get started."
          icon={Icon.Plus}
        />
      ) : (
        userLogos.map((logo) => (
          <Grid.Item
            key={logo.id}
            content={{
              value: {
                source: (function () {
                  const svg = logo.variants.original.primary;
                  return svg
                    ? generateLocalThumbnail(svg)
                    : Icon.Image;
                })() as any,
              },
              tooltip: `${logo.nameEn}\n${logo.nameAr}`,
            }}
            title={logo.nameEn}
            subtitle={logo.nameAr}
            keywords={[...logo.keywords, logo.category]}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action.Push
                    title="Edit Logo"
                    icon={Icon.Pencil}
                    target={<EditLogoForm logo={logo} onSave={loadUserLogos} />}
                  />
                  <Action
                    title="Delete Logo"
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                    onAction={() => deleteLogo(logo)}
                  />
                  <Action
                    title="Open in Editor"
                    icon={Icon.Pencil}
                    shortcut={{ modifiers: ["cmd"], key: "e" }}
                    onAction={async () => {
                      try {
                        const fs = await import("fs/promises");
                        const os = await import("os");
                        const path = await import("path");
                        const { open } = await import("@raycast/api");

                        const tempDir = os.tmpdir();
                        const tempFile = path.join(tempDir, `${logo.nameEn.replace(/[^a-z0-9]/gi, '_')}.svg`);
                        await fs.writeFile(tempFile, logo.variants.original.primary);
                        await open(tempFile);
                      } catch (error) {
                        await showToast({ style: Toast.Style.Failure, title: "Failed to open editor", message: String(error) });
                      }
                    }}
                  />
                </ActionPanel.Section>

                <ActionPanel.Section title="Paste Variants">
                  <Action
                    title="Paste Original Primary"
                    icon={Icon.Document}
                    onAction={() => pasteLogoAsFile(logo, "original", "primary")}
                  />
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
                </ActionPanel.Section>

                <ActionPanel.Section>
                  <Action title="Toggle Favorite" icon={Icon.Star} onAction={() => toggleFavorite(logo)} />
                  <Action.CopyToClipboard title="Copy Original SVG" content={logo.variants.original.primary} />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))
      )}
    </Grid>
  );
}
