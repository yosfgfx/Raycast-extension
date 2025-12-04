# Saudi Logo Vault - Raycast Extension

A comprehensive SVG logo library and paste tool specifically designed for Saudi government entities, companies, and custom user-stored logos. Perfect for designers, developers, and professionals who frequently work with Saudi brands.

## Features

### 🏛️ Pre-populated Saudi Logo Library
- **Government Entities**: Saudi Vision 2030, NEOM, various ministries
- **Financial Sector**: SAMA, SNB, Al Rajhi Bank, Riyad Bank
- **Energy Sector**: Saudi Aramco, ACWA Power, SEC
- **Telecommunications**: STC, Mobily, Zain
- **Airlines**: Saudia, Flynas, Riyadh Air
- **Retail**: Almarai, Jarir, Extra

### 🎨 Multiple Logo Variants
Each logo includes three standard variants:
- **Original**: Default brand colors
- **Dark**: Dark mode optimized version
- **Bright/White**: Single color white version for dark backgrounds

### ⚡ Smart Paste Behavior
- **Enter**: Paste original/default variant
- **Cmd+Enter**: Paste white/bright variant (optimized for dark backgrounds)
- **Option+Enter**: Show variant selector before pasting
- Support for both primary and secondary logo versions

### 🛠️ Clipboard Options
- **SVG Code**: Copy as optimized SVG
- **Base64**: Copy as base64 encoded image
- **React Component**: Copy as React component
- **Vue Component**: Copy as Vue component
- **Size Presets**: Small (24px), Medium (48px), Large (96px), Original size

### 📚 Custom Logo Management
- Add custom SVG logos with full metadata
- Edit existing logos with validation
- Delete unwanted logos
- Import/export logo collections
- Favorite logos for quick access

## Installation

1. **Install Raycast**: Download and install Raycast from [raycast.com](https://raycast.com)
2. **Install Extension**: Search for "Saudi Logo Vault" in the Raycast Store
3. **Set Hotkey**: Configure a global hotkey for quick access

## Usage

### Search Logos
1. Open Raycast and type "Search Logos"
2. Type to search (e.g., "STC", "Aramco", "Ministry")
3. Browse results with logo previews
4. Press Enter to paste, or use keyboard shortcuts for variants

### Add Custom Logo
1. Open Raycast and type "Add Custom Logo"
2. Fill in the form with logo details
3. Paste SVG code for each variant
4. Add keywords and category
5. Save to your library

### Manage Library
1. Open Raycast and type "Manage Library"
2. View all your custom logos
3. Edit logos by clicking on them
4. Delete logos you no longer need
5. Toggle favorites for quick access

### Quick Paste Recent
1. Open Raycast and type "Quick Paste Recent"
2. See your recently used logos
3. Press Enter to paste instantly

## Preferences

Configure the extension through Raycast preferences:

- **Default Paste Variant**: Choose between Original, Dark, or Bright
- **Default Logo Type**: Primary or Secondary logo version
- **Show Preview Before Paste**: Toggle preview display
- **Preferred Categories**: Categories to show first in search results

## Keyboard Shortcuts

| Shortcut | Action |
|----------|---------|
| Enter | Paste default variant |
| Cmd+Enter | Paste white/bright variant |
| Option+Enter | Show variant selector |
| Cmd+C | Copy SVG code |
| Cmd+Shift+C | Copy as React component |
| Cmd+Alt+C | Copy as Vue component |

## Logo Categories

- **Government Entities**: Saudi Vision 2030, NEOM, ministries
- **Banks & Finance**: Major Saudi banks and financial institutions
- **Telecommunications**: STC, Mobily, Zain and other telecom providers
- **Energy & Oil**: Saudi Aramco, ACWA Power, SEC
- **Airlines**: Saudia, Flynas, Riyadh Air
- **Retail**: Almarai, Jarir, Extra and other retailers
- **Technology**: Tech companies and startups
- **Healthcare**: Hospitals and healthcare providers
- **Education**: Universities and educational institutions
- **Custom**: Your personal logo collection

## SVG Validation

The extension includes robust SVG validation:
- Checks for proper SVG structure
- Validates XML syntax
- Detects potentially dangerous content
- Optimizes SVG code for better performance
- Extracts color palettes automatically

## Privacy & Security

- **Local Storage**: All logos are stored locally on your device
- **No External Requests**: No data is sent to external servers
- **SVG Validation**: Malicious SVG content is blocked
- **Safe Defaults**: Conservative security settings out of the box

## Brand Guidelines

Many logos include links to official brand guidelines:
- Usage restrictions and requirements
- Color specifications
- Typography guidelines
- Minimum size requirements
- Clear space requirements

## Performance Features

- **Lazy Loading**: Logo previews load on demand
- **Caching**: Frequently used logos are cached for faster access
- **Optimized Search**: Fast keyword search with debouncing
- **SVG Optimization**: Automatic cleanup of unnecessary attributes

## Error Handling

- Clear error messages for malformed SVG input
- Fallback to original variant if selected variant is missing
- Validation feedback during logo creation
- Graceful handling of missing resources

## Contributing

To add new logos to the pre-populated library:
1. Ensure you have the right to distribute the logo
2. Create SVG variants (original, dark, bright)
3. Include proper metadata and keywords
4. Test across different backgrounds
5. Submit a pull request

## Troubleshooting

### Common Issues

**Logo not pasting correctly:**
- Check that the SVG code is valid
- Try different size presets
- Ensure the target application supports SVG

**Search not finding logos:**
- Try different keywords
- Check the category filters
- Verify the logo was added successfully

**Extension not loading:**
- Restart Raycast
- Check for extension updates
- Verify Raycast permissions

### Support

For issues, feature requests, or contributions:
- Create an issue on GitHub
- Submit a pull request
- Contact the extension author

## License

MIT License - See LICENSE file for details

## Changelog

### Version 1.0.0
- Initial release
- Pre-populated Saudi logo library
- Custom logo management
- Multiple variants and clipboard options
- Search and filter functionality
- Import/export capabilities

---

**Saudi Logo Vault** - Your comprehensive Saudi brand logo library for Raycast. Made with ❤️ for the Saudi design and development community.