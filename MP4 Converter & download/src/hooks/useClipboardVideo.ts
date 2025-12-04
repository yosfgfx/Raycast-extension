import { Clipboard } from "@raycast/api";
import { useEffect, useState } from "react";
import { getVideoInfo, isVideoUrl, VideoInfo } from "../utils/ffmpeg";

export function useClipboardVideo() {
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkClipboard() {
            try {
                const text = await Clipboard.readText();

                if (text && isVideoUrl(text)) {
                    const info = await getVideoInfo(text);
                    if (info) {
                        setVideoInfo(info);
                    }
                }
            } catch (error) {
                console.error("Clipboard error:", error);
            } finally {
                setLoading(false);
            }
        }

        checkClipboard();
    }, []);

    return { videoInfo, loading };
}
