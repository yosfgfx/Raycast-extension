import { Action, ActionPanel, Form, Icon, showToast, Toast, useNavigation, LocalStorage } from "@raycast/api";
import { useState, useEffect } from "react";
import { execa } from "execa";
import path from "path";
import os from "os";
import fs from "fs-extra";
import { ConversionOptions, Format, VIDEO_CODECS, AUDIO_CODECS, RESOLUTIONS } from "../types";
import { buildFfmpegCommand, getBinaryPath } from "../utils/ffmpeg";

interface ConvertFormProps {
    initialOptions?: Partial<ConversionOptions>;
    mode: "quick" | "advanced";
}

export default function ConvertForm({ initialOptions, mode }: ConvertFormProps) {
    const { pop } = useNavigation();
    const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [progress, setProgress] = useState("");

    // Form State
    const [input, setInput] = useState(initialOptions?.inputPath || "");
    const [format, setFormat] = useState<Format>(initialOptions?.format || "mp4");
    const [videoCodec, setVideoCodec] = useState(initialOptions?.videoCodec || "auto");
    const [audioCodec, setAudioCodec] = useState(initialOptions?.audioCodec || "auto");
    const [resolution, setResolution] = useState(initialOptions?.resolution || "original");
    const [crf, setCrf] = useState(initialOptions?.crf?.toString() || "23");
    const [preset, setPreset] = useState(initialOptions?.preset || "medium");
    const [fps, setFps] = useState("");
    const [customArgs, setCustomArgs] = useState("");

    const isAudioOnly = ["mp3", "wav", "m4a", "flac"].includes(format);

    // Wrapper functions for dropdown onChange handlers
    const handleVideoCodecChange = (newValue: string) => {
        setVideoCodec(newValue as any);
    };

    const handleAudioCodecChange = (newValue: string) => {
        setAudioCodec(newValue as any);
    };

    const handleResolutionChange = (newValue: string) => {
        setResolution(newValue);
    };

    const handlePresetChange = (newValue: string) => {
        setPreset(newValue);
    };

    const handleCrfChange = (newValue: string) => {
        const num = parseInt(newValue);
        if (!isNaN(num) && num >= 0 && num <= 51) {
            setCrf(newValue);
        } else if (newValue === "") {
            setCrf("23");
        }
    };

    async function handleSubmit() {
        if (!input) {
            showToast({ style: Toast.Style.Failure, title: "الرجاء اختيار ملف" });
            return;
        }

        setStatus("processing");
        showToast({ style: Toast.Style.Animated, title: "جاري التحضير..." });

        try {
            // 1. Handle Input (URL or File)
            let sourceFile = input;
            let tempDir = "";

            const isUrl = input.startsWith("http");
            if (isUrl) {
                setProgress("جاري تحميل الفيديو...");
                tempDir = path.join(os.tmpdir(), "raycast-video-converter", Date.now().toString());
                await fs.ensureDir(tempDir);

                const ytDlpPath = await getBinaryPath("yt-dlp");

                // استخدام yt-dlp لجميع الروابط (YouTube, Facebook, Instagram, وغيرها)
                // %(ext)s سيتم استبداله تلقائياً بامتداد الملف الصحيح
                const downloadPath = path.join(tempDir, "download.%(ext)s");

                setProgress("جاري تحميل الفيديو من الرابط...");
                await execa(ytDlpPath, [
                    "-f", "best",           // أفضل جودة
                    "-o", downloadPath,     // مسار الإخراج
                    "--no-playlist",        // تنزيل فيديو واحد فقط
                    "--no-warnings",        // إخفاء التحذيرات
                    input
                ]);

                // العثور على الملف المُنزل (قد يكون mp4, webm, أو أي صيغة أخرى)
                const files = await fs.readdir(tempDir);
                if (files.length === 0) {
                    throw new Error("فشل تنزيل الفيديو");
                }
                sourceFile = path.join(tempDir, files[0]);
            }

            // 2. Prepare Output
            const downloadsDir = path.join(os.homedir(), "Downloads");
            const originalName = path.parse(sourceFile).name;
            let outputName = `${originalName}_converted.${format}`;
            let outputPath = path.join(downloadsDir, outputName);

            let counter = 1;
            while (await fs.pathExists(outputPath)) {
                outputName = `${originalName}_converted_${counter}.${format}`;
                outputPath = path.join(downloadsDir, outputName);
                counter++;
            }

            // 3. Build Command
            const options: ConversionOptions = {
                inputPath: sourceFile,
                format,
                videoCodec: videoCodec as any,
                audioCodec: audioCodec as any,
                resolution,
                crf: parseInt(crf),
                preset,
                fps: fps ? parseInt(fps) : undefined,
                customArgs,
                isAudioOnly
            };

            const args = await buildFfmpegCommand(options, outputPath);
            const ffmpegPath = await getBinaryPath("ffmpeg");

            setProgress("جاري التحويل...");
            await execa(ffmpegPath, args);

            // 4. Cleanup & Finish
            if (tempDir) await fs.remove(tempDir);

            setStatus("success");
            showToast({ style: Toast.Style.Success, title: "تم التحويل بنجاح", message: outputName });
            await execa("open", ["-R", outputPath]);
            pop();

        } catch (error) {
            console.error("Conversion error:", error);
            setStatus("error");

            // رسائل خطأ أكثر وضوحاً
            let errorMessage = "حدث خطأ غير متوقع";

            if (error instanceof Error) {
                if (error.message.includes("yt-dlp")) {
                    errorMessage = "فشل تنزيل الفيديو. تأكد من صحة الرابط.";
                } else if (error.message.includes("ffmpeg")) {
                    errorMessage = "فشل تحويل الفيديو. قد يكون الملف تالفاً.";
                } else if (error.message.includes("ENOENT")) {
                    errorMessage = "الأداة المطلوبة غير متوفرة. تأكد من تثبيت ffmpeg و yt-dlp.";
                } else {
                    errorMessage = error.message;
                }
            }

            showToast({
                style: Toast.Style.Failure,
                title: "فشل التحويل",
                message: errorMessage
            });
        }
    }

    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="بدء التحويل" onSubmit={handleSubmit} icon={Icon.Check} />
                </ActionPanel>
            }
            isLoading={status === "processing"}
            navigationTitle={mode === "quick" ? "تحويل سريع" : "تحويل متقدم"}
        >
            <Form.Description text={status === "processing" ? progress : "قم بإعداد خيارات التحويل"} />

            <Form.TextField
                id="input"
                title="الملف"
                placeholder="مسار الملف أو رابط URL"
                value={input}
                onChange={setInput}
            />
            <Form.FilePicker
                id="filePicker"
                title=""
                allowMultipleSelection={false}
                onChange={(files) => files.length && setInput(files[0])}
            />

            <Form.Separator />

            <Form.Dropdown id="format" title="الصيغة" value={format} onChange={(v) => setFormat(v as Format)}>
                <Form.Dropdown.Section title="Video">
                    <Form.Dropdown.Item value="mp4" title="MP4" icon={Icon.Video} />
                    <Form.Dropdown.Item value="mov" title="MOV" icon={Icon.Video} />
                    <Form.Dropdown.Item value="mkv" title="MKV" icon={Icon.Video} />
                    <Form.Dropdown.Item value="webm" title="WebM" icon={Icon.Globe} />
                    <Form.Dropdown.Item value="avi" title="AVI" icon={Icon.Video} />
                    <Form.Dropdown.Item value="gif" title="GIF" icon={Icon.Image} />
                </Form.Dropdown.Section>
                <Form.Dropdown.Section title="Audio">
                    <Form.Dropdown.Item value="mp3" title="MP3" icon={Icon.Music} />
                    <Form.Dropdown.Item value="wav" title="WAV" icon={Icon.Music} />
                    <Form.Dropdown.Item value="m4a" title="M4A" icon={Icon.Music} />
                </Form.Dropdown.Section>
            </Form.Dropdown>

            {!isAudioOnly && (
                <>
                    <Form.Dropdown id="videoCodec" title="ترميز الفيديو" value={videoCodec} onChange={handleVideoCodecChange}>
                        {VIDEO_CODECS.map(c => <Form.Dropdown.Item key={c.value} value={c.value} title={c.label} />)}
                    </Form.Dropdown>

                    <Form.Dropdown id="resolution" title="الأبعاد" value={resolution} onChange={handleResolutionChange}>
                        {RESOLUTIONS.map(r => <Form.Dropdown.Item key={r.value} value={r.value} title={r.label} />)}
                    </Form.Dropdown>

                    {mode === "advanced" && (
                        <>
                            <Form.TextField id="fps" title="الإطارات (FPS)" placeholder="مثال: 60 (اتركه فارغاً للأصلي)" value={fps} onChange={setFps} />

                            <Form.Dropdown id="preset" title="سرعة التحويل" value={preset} onChange={handlePresetChange}>
                                <Form.Dropdown.Item value="ultrafast" title="Ultrafast (أقل ضغط)" />
                                <Form.Dropdown.Item value="superfast" title="Superfast" />
                                <Form.Dropdown.Item value="veryfast" title="Veryfast" />
                                <Form.Dropdown.Item value="faster" title="Faster" />
                                <Form.Dropdown.Item value="fast" title="Fast" />
                                <Form.Dropdown.Item value="medium" title="Medium (متوازن)" />
                                <Form.Dropdown.Item value="slow" title="Slow (أفضل ضغط)" />
                                <Form.Dropdown.Item value="slower" title="Slower" />
                            </Form.Dropdown>

                            <Form.Description text={`الجودة (CRF): ${crf} (أقل = جودة أعلى، النطاق: 0-51)`} />
                            <Form.TextField
                                id="crf"
                                title="قيمة CRF"
                                placeholder="23 (الافتراضي)"
                                value={crf}
                                onChange={handleCrfChange}
                                info="القيمة بين 0-51. أقل = جودة أعلى وحجم أكبر. الافتراضي: 23"
                            />
                        </>
                    )}
                </>
            )}

            <Form.Dropdown id="audioCodec" title="ترميز الصوت" value={audioCodec} onChange={handleAudioCodecChange}>
                {AUDIO_CODECS.map(c => <Form.Dropdown.Item key={c.value} value={c.value} title={c.label} />)}
            </Form.Dropdown>

            {mode === "advanced" && (
                <>
                    <Form.Separator />
                    <Form.TextField id="customArgs" title="أوامر مخصصة" placeholder="-vf transpose=1 ..." value={customArgs} onChange={setCustomArgs} />
                </>
            )}

        </Form>
    );
}
