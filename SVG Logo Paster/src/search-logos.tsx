import { useEffect, useMemo, useState, useCallback } from "react";
import { Grid, ActionPanel, Action, Icon, getPreferenceValues, showToast, Toast, closeMainWindow } from "@raycast/api";
import { Logo, LogoVariant, LogoType } from "@/types/logo";
import { loadLogos, syncNow } from "@/data/logos-source";
import { LogoStorage } from "@/utils/storage";
import { generateSvgThumbnail } from "@/utils/paste-enhancements";
import { LogoDetail } from "@/components/logo-detail";
import { LogoVariants } from "@/components/logo-variants";
import { EditLogoDetails } from "@/components/edit-logo-details";
import { LogoThumbnail } from "@/components/logo-thumbnail";
import { pasteLogoAsFile } from "@/utils/svg-file-paste";

export default function SearchLogos() {
  const [searchText, setSearchText] = useState("");
  const [userLogos, setUserLogos] = useState<Logo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tileSize = (getPreferenceValues<{ gridTileSize?: string }>().gridTileSize ??
    "medium") as unknown as Grid.ItemSize;
  const thumbPrefs = getPreferenceValues<{ thumbnailSize?: string; thumbnailBackground?: string }>();
  const thumbSize = Number(thumbPrefs.thumbnailSize ?? "128");
  const thumbBg = (thumbPrefs.thumbnailBackground ?? "transparent") as string;

  const fetchLogos = useCallback(async () => {
    try {
      setIsLoading(true);
      const prefs = getPreferenceValues<{
        logosSource?: string;
        logosFolderPath?: string;
        logosRemoteUrl?: string;
      }>();
      const logos = await loadLogos({
        logosSource: (prefs.logosSource as any) || "mixed",
        logosFolderPath: prefs.logosFolderPath,
        logosRemoteUrl: prefs.logosRemoteUrl,
      });
      setUserLogos(logos);
    } catch (error) {
      console.error("Error loading logos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogos();
  }, [fetchLogos]);

  const allLogos = useMemo(() => userLogos, [userLogos]);

  const filteredLogos = useMemo(() => {
    if (!searchText.trim()) {
      return allLogos;
    }

    const searchLower = searchText.toLowerCase();
    return allLogos.filter((logo) => {
      const matchesName = logo.nameEn.toLowerCase().includes(searchLower) || logo.nameAr.includes(searchText);
      const matchesKeywords = logo.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower));
      return matchesName || matchesKeywords;
    });
  }, [searchText, allLogos]);

  const getVariantLabel = (variant: LogoVariant, type: "primary" | "secondary") => {
    const v = variant === "original" ? "Original" : variant === "dark" ? "Dark" : "Bright";
    const t = type === "primary" ? "Primary" : "Secondary";
    return `${v} ${t}`;
  };

  const getVariantSvg = (logo: Logo, variant: LogoVariant, type: "primary" | "secondary"): string | undefined => {
    const v: any = logo.variants[variant];
    return v?.[type];
  };

  const getVariantThumb = useMemo(() => {
    const cache = new Map<string, string | Icon>();
    return (svg: string | undefined, label: string): string | Icon => {
      if (!svg) return Icon.Image;

      const cacheKey = `${svg.substring(0, 100)}-${label}`;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!;
      }

      try {
        const thumb = generateSvgThumbnail(svg, {
          width: thumbSize,
          height: thumbSize,
          backgroundColor: thumbBg,
          label,
          cardStyle: true
        });
        cache.set(cacheKey, thumb);
        return thumb;
      } catch {
        cache.set(cacheKey, Icon.Image);
        return Icon.Image;
      }
    };
  }, [thumbSize, thumbBg]);

  const saveAsFile = async (logo: Logo, variant: LogoVariant, type: LogoType) => {
    try {
      const result = await pasteLogoAsFile(logo, variant, type, {
        createFile: true,
        showFileLocation: false,
        copyCodeAsFallback: true,
      });

      if (result.success) {
        await LogoStorage.addToRecentLogos(logo.id);
        await showToast({
          style: Toast.Style.Success,
          title: "SVG Pasted",
          message: `${logo.nameEn} (${variant}) pasted into active window`,
        });
        await closeMainWindow();
      } else {
        await showToast({
          style: Toast.Style.Failure,
          title: "Save Failed",
          message: result.error || "Failed to save SVG file",
        });
      }
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Save Failed",
        message: error instanceof Error ? error.message : "Failed to save SVG file",
      });
    }
  };

  const renderVariantItems = (logo: Logo) => {
    const entries: { variant: LogoVariant; type: "primary" | "secondary" }[] = [
      { variant: "original", type: "primary" },
      { variant: "original", type: "secondary" },
      { variant: "dark", type: "primary" },
      { variant: "dark", type: "secondary" },
      { variant: "bright", type: "primary" },
      { variant: "bright", type: "secondary" },
    ];
    return entries
      .filter((e) => Boolean(getVariantSvg(logo, e.variant, e.type)))
      .map((e) => (
        <LogoThumbnail
          key={`${logo.id}-${e.variant}-${e.type}`}
          logo={logo}
          variant={e.variant}
          type={e.type}
          onRefresh={fetchLogos}
        />
      ));
  };

  return (
    <Grid
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="ابحث عن الشعارات السعودية... / Search Saudi logos..."
      itemSize={tileSize}
      throttle
    >
      {/* Actions */}
      <Grid.Section title="Actions">
        <Grid.Item
          content={Icon.Repeat}
          title="Sync Logos Now"
          subtitle="Fetch latest from remote"
          actions={
            <ActionPanel>
              <Action
                title="Sync Now"
                icon={Icon.Repeat}
                onAction={async () => {
                  try {
                    const prefs = getPreferenceValues<{
                      logosSource?: string;
                      logosRemoteUrl?: string;
                      logosFolderPath?: string;
                    }>();
                    const { added, total } = await syncNow({
                      logosSource: (prefs.logosSource as any) || "remote-json",
                      logosRemoteUrl: prefs.logosRemoteUrl,
                    });
                    await showToast({
                      style: Toast.Style.Success,
                      title: "Sync Completed",
                      message: `${added} new, total ${total}`,
                    });
                    fetchLogos();
                  } catch {
                    await showToast({ style: Toast.Style.Failure, title: "Sync Failed" });
                  }
                }}
              />
            </ActionPanel>
          }
        />
      </Grid.Section>

      {[
        "government",
        "finance",
        "telecom",
        "energy",
        "airlines",
        "retail",
        "technology",
        "healthcare",
        "education",
        "custom",
      ].map((cat) => {
        const logosInCat = filteredLogos.filter((l) => l.category === (cat as any));
        if (logosInCat.length === 0) return null;

        // Limit to first 50 logos per category to prevent OOM
        const limitedLogos = logosInCat.slice(0, 50);

        return (
          <Grid.Section key={cat} title={cat.toString()} subtitle={`${logosInCat.length} logos${logosInCat.length > 50 ? ' (showing first 50)' : ''}`}>
            {limitedLogos.flatMap((logo) => renderVariantItems(logo))}
          </Grid.Section>
        );
      })}
    </Grid>
  );
}
