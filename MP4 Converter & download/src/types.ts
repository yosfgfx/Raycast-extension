export type Format = "mp4" | "mov" | "mkv" | "webm" | "avi" | "gif" | "mp3" | "wav" | "m4a" | "flac";

export type VideoCodec = "libx264" | "libx265" | "prores_ks" | "libvpx-vp9" | "copy" | "auto";
export type AudioCodec = "aac" | "libmp3lame" | "pcm_s16le" | "libopus" | "copy" | "none" | "auto";

export interface ConversionOptions {
    inputPath: string;
    format: Format;
    videoCodec: VideoCodec;
    audioCodec: AudioCodec;
    resolution: string; // "original", "1080p", "720p", etc.
    crf: number; // 0-51
    preset: string; // ultrafast, superfast, ..., placebo
    fps?: number;
    customArgs?: string;
    isAudioOnly: boolean;
}

export interface Preset {
    id: string;
    name: string;
    description: string;
    icon: string;
    options: Partial<ConversionOptions>;
}

export const RESOLUTIONS = [
    { label: "Original", value: "original" },
    { label: "4K (2160p)", value: "3840:-2" },
    { label: "2K (1440p)", value: "2560:-2" },
    { label: "Full HD (1080p)", value: "1920:-2" },
    { label: "HD (720p)", value: "1280:-2" },
    { label: "SD (480p)", value: "854:-2" },
    { label: "Mobile (360p)", value: "640:-2" },
];

export const VIDEO_CODECS = [
    { label: "Auto", value: "auto" },
    { label: "H.264 (Most Compatible)", value: "libx264" },
    { label: "H.265 (High Efficiency)", value: "libx265" },
    { label: "ProRes (Editing)", value: "prores_ks" },
    { label: "VP9 (Web)", value: "libvpx-vp9" },
    { label: "Copy (No Re-encode)", value: "copy" },
];

export const AUDIO_CODECS = [
    { label: "Auto", value: "auto" },
    { label: "AAC (Standard)", value: "aac" },
    { label: "MP3", value: "libmp3lame" },
    { label: "WAV (Uncompressed)", value: "pcm_s16le" },
    { label: "Opus (High Quality)", value: "libopus" },
    { label: "No Audio", value: "none" },
    { label: "Copy", value: "copy" },
];
