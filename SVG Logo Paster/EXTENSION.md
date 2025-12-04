# Saudi Logo Vault Extension

This directory contains the Saudi Logo Vault Raycast extension source code.

## Development

To work on this extension:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the extension in development mode:
   ```bash
   npm run dev
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Lint the code:
   ```bash
   npm run lint
   ```

## Structure

```
src/
├── types/
│   └── logo.ts          # TypeScript interfaces and types
├── utils/
│   ├── storage.ts       # Local storage utilities
│   └── svg.ts           # SVG validation and manipulation
├── data/
│   └── saudi-logos.ts   # Pre-populated Saudi logo database
├── components/
│   ├── logo-detail.tsx  # Logo detail view component
│   └── edit-logo-form.tsx # Logo editing form component
├── search-logos.tsx     # Main search command
├── add-custom-logo.tsx  # Add custom logo command
├── manage-library.tsx   # Manage library command
└── quick-paste-recent.tsx # Quick paste recent command
```

## Features

- Pre-populated Saudi logo library
- Custom logo management
- Multiple logo variants (Original, Dark, Bright)
- Smart paste behavior with keyboard shortcuts
- Clipboard options (SVG, Base64, React, Vue)
- Search and filter functionality
- Import/export capabilities

## License

MIT