import { ConversionOptions } from "../types";
import path from "path";
import os from "os";
import fs from "fs-extra";
import { execa } from "execa";

export async function buildFfmpegCommand(options: ConversionOptions, outputPath: string): Promise<string[]> {
    const args: string[] = ["-i", options.inputPath];

    // Video Codec
    if (!options.isAudioOnly) {
        if (options.videoCodec !== "auto") {
            args.push("-c:v", options.videoCodec);
        } else {
            // Default defaults based on format
            if (options.format === "webm") args.push("-c:v", "libvpx-vp9");
            else if (options.format === "gif") args.push("-vf", "fps=15,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse");
            else args.push("-c:v", "libx264");
        }

        // CRF / Quality (only if not copy/prores)
        if (options.videoCodec !== "copy" && options.videoCodec !== "prores_ks" && options.format !== "gif") {
            args.push("-crf", options.crf.toString());
            args.push("-preset", options.preset);
        }

        // Resolution
        if (options.resolution !== "original" && options.format !== "gif") {
            args.push("-vf", `scale=${options.resolution}`);
        }

        // FPS
        if (options.fps && options.format !== "gif") {
            args.push("-r", options.fps.toString());
        }

        // Web Optimization
        if (options.format === "mp4") {
            args.push("-movflags", "+faststart");
        }
    } else {
        // Audio Only
        args.push("-vn"); // No video
    }

    // Audio Codec
    if (options.audioCodec === "none") {
        args.push("-an");
    } else if (options.audioCodec !== "auto") {
        args.push("-c:a", options.audioCodec);
    }

    // Custom Args
    if (options.customArgs) {
        const custom = options.customArgs.split(" ");
        args.push(...custom);
    }

    args.push("-y", outputPath);

    return args;
}

export async function getBinaryPath(binary: string): Promise<string> {
    const commonPaths = [
        `/opt/homebrew/bin/${binary}`,
        `/usr/local/bin/${binary}`,
        `/usr/bin/${binary}`,
        `/bin/${binary}`
    ];

    for (const p of commonPaths) {
        if (await fs.pathExists(p)) {
            return p;
        }
    }

    try {
        const { stdout } = await execa("which", [binary]);
        return stdout.trim();
    } catch {
        return binary;
    }
}

export interface VideoInfo {
    url: string;
    title: string;
    thumbnail: string;
}

export async function getVideoInfo(url: string): Promise<VideoInfo | null> {
    try {
        const ytDlpPath = await getBinaryPath("yt-dlp");

        // Get title
        const { stdout: title } = await execa(ytDlpPath, ["--get-title", url]);

        // Get thumbnail
        const { stdout: thumbnail } = await execa(ytDlpPath, ["--get-thumbnail", url]);

        return {
            url,
            title: title.trim(),
            thumbnail: thumbnail.trim()
        };
    } catch (error) {
        console.error("Failed to get video info:", error);
        return null;
    }
}

export function isVideoUrl(text: string): boolean {
    if (!text) return false;

    // Check if it's a valid URL
    try {
        const url = new URL(text);
        // Check for common video hosting domains
        const videoHosts = [
            "youtube.com",
            "youtu.be",
            "facebook.com",
            "fb.watch",
            "instagram.com",
            "twitter.com",
            "x.com",
            "tiktok.com",
            "vimeo.com",
            "dailymotion.com",
            "twitch.tv"
        ];

        return videoHosts.some(host => url.hostname.includes(host));
    } catch {
        return false;
    }
}

