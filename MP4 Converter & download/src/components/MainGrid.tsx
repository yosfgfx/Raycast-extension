import { Action, ActionPanel, Grid, Icon, useNavigation } from "@raycast/api";
import ConvertForm from "./ConvertForm";
import { Format } from "../types";
import { useClipboardVideo } from "../hooks/useClipboardVideo";

export default function MainGrid() {
    const { push } = useNavigation();
    const { videoInfo, loading } = useClipboardVideo();

    const quickActions = [
        {
            title: "MP4 (H.264)",
            subtitle: "Standard",
            icon: Icon.Video,
            options: { format: "mp4" as Format, videoCodec: "libx264" as const }
        },
        {
            title: "MP4 (HEVC)",
            subtitle: "High Efficiency",
            icon: Icon.Video,
            options: { format: "mp4" as Format, videoCodec: "libx265" as const }
        },
        {
            title: "GIF Animation",
            subtitle: "Create GIF",
            icon: Icon.Image,
            options: { format: "gif" as Format }
        },
        {
            title: "Extract MP3",
            subtitle: "Audio Only",
            icon: Icon.Music,
            options: { format: "mp3" as Format, isAudioOnly: true }
        },
    ];

    const formats = [
        { title: "MOV", icon: Icon.Video, options: { format: "mov" as Format } },
        { title: "MKV", icon: Icon.Video, options: { format: "mkv" as Format } },
        { title: "WebM", icon: Icon.Globe, options: { format: "webm" as Format } },
        { title: "AVI", icon: Icon.Video, options: { format: "avi" as Format } },
        { title: "WAV", icon: Icon.Music, options: { format: "wav" as Format, isAudioOnly: true } },
    ];

    return (
        <Grid
            columns={4}
            inset={Grid.Inset.Medium}
            aspectRatio="1"
            searchBarPlaceholder="ابحث عن صيغة أو أداة..."
            isLoading={loading}
        >
            {/* قسم الحافظة - يظهر فقط إذا كان هناك رابط فيديو في الحافظة */}
            {videoInfo && (
                <Grid.Section title="🎬 من الحافظة">
                    <Grid.Item
                        title={videoInfo.title}
                        subtitle="انقر للتحويل"
                        content={videoInfo.thumbnail}
                        actions={
                            <ActionPanel>
                                <Action
                                    title="تحويل إلى MP4"
                                    icon={Icon.ArrowRight}
                                    onAction={() => push(<ConvertForm mode="quick" initialOptions={{ inputPath: videoInfo.url }} />)}
                                />
                                <Action
                                    title="تخصيص متقدم"
                                    icon={Icon.Gear}
                                    shortcut={{ modifiers: ["cmd"], key: "e" }}
                                    onAction={() => push(<ConvertForm mode="advanced" initialOptions={{ inputPath: videoInfo.url }} />)}
                                />
                            </ActionPanel>
                        }
                    />
                </Grid.Section>
            )}

            <Grid.Section title="إجراءات سريعة">
                {quickActions.map((item, index) => (
                    <Grid.Item
                        key={index}
                        title={item.title}
                        subtitle={item.subtitle}
                        content={item.icon}
                        actions={
                            <ActionPanel>
                                <Action
                                    title="تحويل"
                                    icon={Icon.ArrowRight}
                                    onAction={() => push(<ConvertForm mode="quick" initialOptions={item.options} />)}
                                />
                                <Action
                                    title="تخصيص متقدم"
                                    icon={Icon.Gear}
                                    shortcut={{ modifiers: ["cmd"], key: "e" }}
                                    onAction={() => push(<ConvertForm mode="advanced" initialOptions={item.options} />)}
                                />
                            </ActionPanel>
                        }
                    />
                ))}
            </Grid.Section>

            <Grid.Section title="الصيغ">
                {formats.map((item, index) => (
                    <Grid.Item
                        key={index}
                        title={item.title}
                        content={item.icon}
                        actions={
                            <ActionPanel>
                                <Action
                                    title="تحويل"
                                    icon={Icon.ArrowRight}
                                    onAction={() => push(<ConvertForm mode="quick" initialOptions={item.options} />)}
                                />
                                <Action
                                    title="تخصيص متقدم"
                                    icon={Icon.Gear}
                                    shortcut={{ modifiers: ["cmd"], key: "e" }}
                                    onAction={() => push(<ConvertForm mode="advanced" initialOptions={item.options} />)}
                                />
                            </ActionPanel>
                        }
                    />
                ))}
            </Grid.Section>

            <Grid.Section title="أدوات متقدمة">
                <Grid.Item
                    title="تحويل مخصص"
                    subtitle="تحكم كامل"
                    content={Icon.WrenchScrewdriver}
                    actions={
                        <ActionPanel>
                            <Action
                                title="فتح"
                                icon={Icon.ArrowRight}
                                onAction={() => push(<ConvertForm mode="advanced" />)}
                            />
                        </ActionPanel>
                    }
                />
            </Grid.Section>
        </Grid>
    );
}
