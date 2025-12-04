import { Grid, ActionPanel, Action, Icon, getPreferenceValues } from "@raycast/api";
import { Logo } from "@/types/logo";
import { pasteLogoAsFile } from "@/utils/svg-file-paste";
import { generateSvgThumbnail } from "@/utils/paste-enhancements";

interface Props {
  logo: Logo;
}

function hasVariant(logo: Logo, variant: keyof Logo["variants"], type: "primary" | "secondary") {
  const v = logo.variants[variant] as any;
  return Boolean(v?.[type]);
}

export function LogoVariants({ logo }: Props) {
  const tileSize = (getPreferenceValues<{ gridTileSize?: string }>().gridTileSize ??
    "medium") as unknown as Grid.ItemSize;
  const prefs = getPreferenceValues<{ thumbnailSize?: string; thumbnailBackground?: string }>();
  const size = Number(prefs.thumbnailSize ?? "128");
  const bg = (prefs.thumbnailBackground ?? "transparent") as string;

  const entries: { variant: keyof Logo["variants"]; type: "primary" | "secondary" }[] = [
    { variant: "original", type: "primary" },
    { variant: "original", type: "secondary" },
    { variant: "dark", type: "primary" },
    { variant: "dark", type: "secondary" },
    { variant: "bright", type: "primary" },
    { variant: "bright", type: "secondary" },
  ];

  const labelFor = (variant: keyof Logo["variants"], type: "primary" | "secondary") => {
    const v = variant === "original" ? "Original" : variant === "dark" ? "Dark" : "Bright";
    const t = type === "primary" ? "Primary" : "Secondary";
    return `${v} ${t}`;
  };

  return (
    <Grid itemSize={tileSize} searchBarPlaceholder={`${logo.nameEn} / ${logo.nameAr}`}>
      <Grid.Section title={logo.nameEn} subtitle={logo.nameAr}>
        {entries
          .filter((e) => hasVariant(logo, e.variant, e.type))
          .map((e) => {
            const svg = (logo.variants[e.variant] as any)[e.type] as string;
            const label = labelFor(e.variant, e.type);
            const thumb = svg
              ? generateSvgThumbnail(svg, {
                width: size,
                height: size,
                backgroundColor: bg,
                label,
                cardStyle: true,
              })
              : Icon.Image;
            return (
              <Grid.Item
                key={`${logo.id}-${String(e.variant)}-${e.type}`}
                content={thumb as any}
                title={label}
                subtitle={logo.nameAr}
                actions={
                  <ActionPanel>
                    <Action
                      title={`Paste ${label}`}
                      icon={Icon.Document}
                      onAction={() => pasteLogoAsFile(logo, String(e.variant), e.type)}
                    />
                  </ActionPanel>
                }
              />
            );
          })}
      </Grid.Section>
    </Grid>
  );
}
