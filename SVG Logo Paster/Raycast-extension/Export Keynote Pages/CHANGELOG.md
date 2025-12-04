# iWork Super Export - Changelog

## [1.0.0] - 2025-11-28

### Added 🎉

#### Core Features
- **Export Selected Slides** - Revolutionary feature to export only selected Keynote slides
  - Live slide preview with thumbnails in Raycast
  - Quality selection dropdown (High/Balanced/Compressed)
  - Automatic slide range detection and naming
  - Smart duplicate-and-delete AppleScript workflow
  
- **Export Full Presentation** - Complete Keynote presentation export
  - Form-based UI with quality options
  - Web optimization support
  - Automatic file naming with date stamps

- **Export Pages Document** - Pages document to PDF export
  - Same quality presets as Keynote
  - PDF optimization and compression
  - File size control

- **Preview Slides** - Preview selected slides before export
  - High-quality thumbnail generation
  - Detail view for each slide
  - Slide titles and numbers display

- **Custom Export** - Advanced export with full control
  - Multiple export types (Selected/Full/Range)
  - Custom DPI settings
  - Custom file naming
  - Range-based slide selection

#### PDF Optimization
- Ghostscript integration for PDF compression and optimization
- Quality presets: High (300 DPI), Balanced (150 DPI), Compressed (72 DPI)
- Web optimization (fast web view linearization)
- Automatic file size control to keep PDFs under 25MB
- Progressive compression algorithm

#### Smart Features
- Automatic file naming with customizable templates
- Template variables: {name}, {date}, {quality}, {range}
- Multi-language support (Arabic/English)
- Preference storage for default settings
- Intelligent file size estimation

#### User Experience
- Rich toast notifications with quick actions (Open/Show in Finder)
- Progress indicators during export
- Detailed error messages with solutions
- Keyboard shortcuts for common actions
- Icon-based visual hierarchy

### Technical Details

#### Dependencies
- `@raycast/api`: ^1.103.8
- `@raycast/utils`: ^1.17.0  
- `run-applescript`: ^7.0.0
- `execa`: ^8.0.1

#### Commands
1. `export-selected-slides` - Export selected Keynote slides
2. `export-full-presentation` - Export full Keynote presentation
3. `export-pages-document` - Export Pages document
4. `preview-slides` - Preview selected slides
5. `custom-export` - Advanced custom export

#### Preferences
- `defaultExportPath` - Default save location (Directory)
- `defaultQuality` - Default quality preset (Dropdown)
- `namingTemplate` - File naming template (Text Field)

### Known Limitations
- Image export (PNG/JPG) not yet implemented
- Video export (MP4) not yet implemented
- HTML presentation export not yet implemented
- Ghostscript optional but recommended for best results

### Requirements
- macOS 10.10+
- Raycast
- Keynote or Pages
- Ghostscript (optional): `brew install ghostscript`

---

## Roadmap 🗺️

### Version 1.1.0 (Planned)
- [ ] Individual slide image export (PNG/JPG)
- [ ] Custom DPI for image exports
- [ ] ZIP archiving for multi-image exports
- [ ] Batch export progress tracking

### Version 1.2.0 (Planned)
- [ ] Video export (MP4) using FFmpeg
- [ ] Slide transitions in video
- [ ] Configurable slide duration
- [ ] Resolution options (720p/1080p/4K)

### Version 1.3.0 (Planned)
- [ ] HTML presentation export
- [ ] Responsive web design
- [ ] Keyboard navigation support
- [ ] Self-contained single file output

### Version 2.0.0 (Ideas)
- [ ] Numbers support
- [ ] Cloud upload integration (Google Drive, Dropbox)
- [ ] Email sharing directly from extension
- [ ] Print layout templates
- [ ] CMYK color space for print-ready PDFs
- [ ] Accessibility improvements (narrator support)

---

**Note:** This is the initial release. Please report bugs and suggest features!