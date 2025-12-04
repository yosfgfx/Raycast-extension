import { Icon, Color, Toast } from "@raycast/api";
import { PasteResult } from "@/utils/paste-enhancements";

export interface PasteStatusIndicatorProps {
  result: PasteResult;
  showDetailed?: boolean;
  autoHide?: boolean;
  onRetry?: () => void;
}

export function PasteStatusIndicator({
  result,
  showDetailed = true,
  autoHide = false,
  onRetry,
}: PasteStatusIndicatorProps) {
  const { success, format, error } = result;

  if (success) {
    return {
      title: "Paste Successful",
      message: `Content pasted as ${format.toUpperCase()} format`,
      style: Toast.Style.Success,
      icon: Icon.CheckCircle,
      primaryAction: autoHide
        ? undefined
        : {
            title: "Copy Again",
            onAction: onRetry,
          },
    };
  }

  const errorMessage = error || "Unknown paste error";

  return {
    title: "Paste Failed",
    message: errorMessage,
    style: Toast.Style.Failure,
    icon: Icon.ExclamationMark,
    primaryAction: {
      title: "Retry",
      onAction: onRetry,
    },
    secondaryAction: showDetailed
      ? {
          title: "Details",
          onAction: () => {
            // Show detailed error information
            const detailToast: Toast.Options = {
              title: "Paste Error Details",
              message: `Format: ${format.toUpperCase()}\nError: ${errorMessage}\n\nTry copying the content again or check if the format is supported.`,
              style: Toast.Style.Failure,
            };
            return detailToast;
          },
        }
      : undefined,
  };
}

export function getPasteStatusIcon(result: PasteResult): Icon {
  if (result.success) {
    switch (result.format) {
      case "svg":
        return Icon.Image;
      case "base64":
        return Icon.Code;
      case "react":
        return Icon.CodeBlock;
      case "vue":
        return Icon.CodeBlock;
      default:
        return Icon.Clipboard;
    }
  }

  return Icon.ExclamationMark;
}

export function getPasteStatusColor(result: PasteResult): typeof Color.Green | typeof Color.Red {
  return result.success ? Color.Green : Color.Red;
}

export function formatPasteStatusMessage(result: PasteResult): string {
  if (result.success) {
    return `Pasted as ${result.format.toUpperCase()}`;
  }

  return result.error || "Paste failed";
}

/**
 * Real-time paste status hook
 */
export function usePasteStatus() {
  const [isPasting, setIsPasting] = useState(false);
  const [lastResult, setLastResult] = useState<PasteResult | null>(null);

  const updateStatus = (result: PasteResult) => {
    setLastResult(result);
    setIsPasting(false);
  };

  const startPasting = () => {
    setIsPasting(true);
    setLastResult(null);
  };

  const clearStatus = () => {
    setIsPasting(false);
    setLastResult(null);
  };

  return {
    isPasting,
    lastResult,
    updateStatus,
    startPasting,
    clearStatus,
  };
}

// Import React for the hook
import { useState } from "react";
