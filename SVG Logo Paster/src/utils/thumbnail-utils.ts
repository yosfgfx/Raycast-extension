import { svgToBase64, generateSvgThumbnail } from "./paste-enhancements";

/**
 * Generates a thumbnail for a logo with smart background detection.
 * This is a wrapper around generateSvgThumbnail for local logos.
 */
export function generateLocalThumbnail(svgContent: string): string {
    return generateSvgThumbnail(svgContent, {
        width: 256,
        height: 256,
        // Don't pass backgroundColor - let it auto-detect
        cardStyle: true
    });
}
