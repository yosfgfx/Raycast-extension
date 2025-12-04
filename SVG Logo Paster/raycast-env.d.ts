/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Logos Source - Select where to load logos from */
  "logosSource": "bundled" | "local-folder" | "remote-json" | "remote-csv" | "mixed",
  /** Local Logos Folder - Absolute path to a folder of logos: <category>/<org>/<variant>-<type>.svg */
  "logosFolderPath": string,
  /** Remote Logos URL (JSON or CSV) - HTTP(S) URL to JSON or CSV describing logos */
  "logosRemoteUrl": string,
  /** Grid Tile Size - Size of logo tiles in grid view */
  "gridTileSize": "small" | "medium" | "large",
  /** Thumbnail Size - Size of logo thumbnail rendering */
  "thumbnailSize": "64" | "128" | "256",
  /** Thumbnail Background - Background behind logo thumbnails */
  "thumbnailBackground": "transparent" | "#1e1e1e" | "#ffffff",
  /** Default Paste Variant - Default logo variant to paste */
  "defaultVariant": "original" | "dark" | "bright",
  /** Default Logo Type - Default logo type (primary/secondary) */
  "defaultLogoType": "primary" | "secondary",
  /** Show Preview Before Paste - Show logo preview before pasting */
  "showPreviewBeforePaste": boolean,
  /** Preferred Categories - Categories to show first in search results */
  "preferredCategories": "all" | "government" | "finance" | "telecom" | "energy" | "airlines" | "retail"
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `search-logos` command */
  export type SearchLogos = ExtensionPreferences & {}
  /** Preferences accessible in the `add-custom-logo` command */
  export type AddCustomLogo = ExtensionPreferences & {}
  /** Preferences accessible in the `manage-library` command */
  export type ManageLibrary = ExtensionPreferences & {}
  /** Preferences accessible in the `quick-paste-recent` command */
  export type QuickPasteRecent = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `search-logos` command */
  export type SearchLogos = {}
  /** Arguments passed to the `add-custom-logo` command */
  export type AddCustomLogo = {}
  /** Arguments passed to the `manage-library` command */
  export type ManageLibrary = {}
  /** Arguments passed to the `quick-paste-recent` command */
  export type QuickPasteRecent = {}
}

