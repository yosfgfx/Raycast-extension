import { Action, ActionPanel, Grid, Icon, useNavigation } from "@raycast/api";
import { useMemo } from "react";
import { Logo, LogoVariant, LogoType } from "@/types/logo";
import { generateLocalThumbnail } from "@/utils/thumbnail-utils";
import { LogoDetail } from "./logo-detail";
import { LogoVariants } from "./logo-variants";
import { EditLogoDetails } from "./edit-logo-details";
import { pasteLogoAsFile } from "@/utils/svg-file-paste";

interface LogoThumbnailProps {
    logo: Logo;
    variant: LogoVariant;
    type: LogoType;
    onRefresh?: () => void;
}

export function LogoThumbnail({ logo, variant, type, onRefresh }: LogoThumbnailProps) {
    const { push } = useNavigation();

    const svg = (logo.variants[variant] as any)?.[type] as string | undefined;

    const label = useMemo(() => {
        const v = variant === "original" ? "Original" : variant === "dark" ? "Dark" : "Bright";
        const t = type === "primary" ? "Primary" : "Secondary";
        return `${v} ${t}`;
    }, [variant, type]);

    const thumbnail = useMemo(() => {
        if (!svg) return Icon.Image;

        // Cache key for memoization
        const cacheKey = `${logo.id}-${variant}-${type}`;

        try {
            return generateLocalThumbnail(svg);
        } catch {
            return Icon.Image;
        }
    }, [svg, logo.id, variant, type]);

    if (!svg) return null;

    const handlePaste = async () => {
        await pasteLogoAsFile(logo, variant, type);
    };

    return (
        <Grid.Item
            content={thumbnail}
            title={logo.nameAr || logo.nameEn}
            subtitle={`${logo.nameEn} • ${label}`}
            actions={
                <ActionPanel>
                    <Action
                        title={`Paste ${label}`}
                        icon={Icon.Document}
                        onAction={handlePaste}
                    />
                    <Action
                        title="Open in Editor"
                        icon={Icon.Pencil}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "e" }}
                        onAction={async () => {
                            try {
                                const fs = await import("fs/promises");
                                const os = await import("os");
                                const path = await import("path");
                                const { open, showToast, Toast } = await import("@raycast/api");

                                const tempDir = os.tmpdir();
                                const tempFile = path.join(tempDir, `${logo.nameEn.replace(/[^a-z0-9]/gi, '_')}-${variant}-${type}.svg`);
                                await fs.writeFile(tempFile, svg);
                                await open(tempFile);
                            } catch (error) {
                                const { showToast, Toast } = await import("@raycast/api");
                                await showToast({ style: Toast.Style.Failure, title: "Failed to open editor", message: String(error) });
                            }
                        }}
                    />
                    <Action.Push
                        title="View Details"
                        icon={Icon.Info}
                        target={<LogoDetail logo={logo} />}
                    />
                    <Action.Push
                        title="Variants & Preview"
                        icon={Icon.Eye}
                        target={<LogoVariants logo={logo} />}
                    />
                    {logo.isUserAdded && (
                        <Action.Push
                            title="Edit Details"
                            icon={Icon.Pencil}
                            target={<EditLogoDetails logo={logo} onLogoUpdated={onRefresh || (() => { })} />}
                            shortcut={{ modifiers: ["cmd"], key: "e" }}
                        />
                    )}
                </ActionPanel>
            }
        />
    );
}


