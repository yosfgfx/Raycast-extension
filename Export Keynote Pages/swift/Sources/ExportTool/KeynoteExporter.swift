import Foundation
#if os(macOS)
import AppKit
#endif

struct KeynoteExporter {
    
    /// Get the total number of slides in the frontmost Keynote document
    static func getSlideCount() throws -> Int {
        let script = """
        tell application "Keynote"
            if (count of documents) is 0 then
                error "No Keynote document is open"
            end if
            
            tell front document
                return count of slides
            end tell
        end tell
        """
        
        let result = try executeAppleScript(script)
        guard let count = Int(result.trimmingCharacters(in: .whitespacesAndNewlines)) else {
            throw ExportError.appleScriptFailed("Could not parse slide count")
        }
        return count
    }
    
    /// Get the name of the frontmost Keynote document
    static func getDocumentName() throws -> String {
        let script = """
        tell application "Keynote"
            if (count of documents) is 0 then
                error "No Keynote document is open"
            end if
            
            tell front document
                return name
            end tell
        end tell
        """
        
        let result = try executeAppleScript(script)
        let documentName = result.trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Remove .key extension if present
        if documentName.hasSuffix(".key") {
            return String(documentName.dropLast(4))
        }
        
        return documentName
    }
    
    /// Get the currently selected slide number
    static func getCurrentSlide() throws -> Int {
        let script = """
        tell application "Keynote"
            if (count of documents) is 0 then
                error "No Keynote document is open"
            end if
            
            tell front document
                set currentSlideObj to current slide
                set slideIndex to 1
                repeat with i from 1 to count of slides
                    if slide i is currentSlideObj then
                        set slideIndex to i
                        exit repeat
                    end if
                end repeat
                return slideIndex
            end tell
        end tell
        """
        
        let result = try executeAppleScript(script)
        guard let slideNumber = Int(result.trimmingCharacters(in: .whitespacesAndNewlines)) else {
            throw ExportError.appleScriptFailed("Could not parse current slide number")
        }
        return slideNumber
    }
    
    /// Export the entire presentation to PDF
    static func exportFullPDF(outputPath: String) throws {
        let expandedPath = expandTildePath(outputPath)
        
        let script = """
        tell application "Keynote"
            if (count of documents) is 0 then
                error "No Keynote document is open"
            end if
            
            tell front document
                export to POSIX file "\(expandedPath)" as PDF
            end tell
        end tell
        """
        
        _ = try executeAppleScript(script)
    }
    
    /// Export the entire presentation to PPTX
    static func exportFullPPTX(outputPath: String) throws {
        let expandedPath = expandTildePath(outputPath)
        
        let script = """
        tell application "Keynote"
            if (count of documents) is 0 then
                error "No Keynote document is open"
            end if
            
            tell front document
                export to POSIX file "\(expandedPath)" as Microsoft PowerPoint
            end tell
        end tell
        """
        
        _ = try executeAppleScript(script)
    }
    
    /// Export a single slide to PDF
    static func exportSingleSlide(slideNumber: Int, outputPath: String) throws {
        // Get total slide count for validation
        let totalSlides = try getSlideCount()
        
        guard slideNumber >= 1 && slideNumber <= totalSlides else {
            throw ExportError.invalidSlideRange
        }
        
        // Export full PDF to temp, then extract the specific page
        try exportSlideRange(fromSlide: slideNumber, toSlide: slideNumber, outputPath: outputPath)
    }
    
    /// Export a range of slides to PDF
    static func exportSlideRange(fromSlide: Int, toSlide: Int, outputPath: String) throws {
        // Validate range
        let totalSlides = try getSlideCount()
        
        guard fromSlide >= 1 && fromSlide <= totalSlides else {
            throw ExportError.invalidSlideRange
        }
        
        guard toSlide >= fromSlide && toSlide <= totalSlides else {
            throw ExportError.invalidSlideRange
        }
        
        // If exporting all slides, just do a direct export
        if fromSlide == 1 && toSlide == totalSlides {
            try exportFullPDF(outputPath: outputPath)
            return
        }
        
        // Export full PDF to temporary location
        let tempDir = FileManager.default.temporaryDirectory
        let tempPDFPath = tempDir.appendingPathComponent(UUID().uuidString + ".pdf")
        
        try exportFullPDF(outputPath: tempPDFPath.path)
        
        // Extract the specified pages using PDFKit
        try PDFManipulator.extractPages(
            fromPDF: tempPDFPath.path,
            outputPath: outputPath,
            fromPage: fromSlide - 1, // PDFKit uses 0-based indexing
            toPage: toSlide - 1
        )
        
        // Clean up temp file
        try? FileManager.default.removeItem(at: tempPDFPath)
    }
    
    /// Execute an AppleScript and return the result
    private static func executeAppleScript(_ script: String) throws -> String {
        var error: NSDictionary?
        
        guard let appleScript = NSAppleScript(source: script) else {
            throw ExportError.appleScriptFailed("Failed to create AppleScript")
        }
        
        let output = appleScript.executeAndReturnError(&error)
        
        if let error = error {
            let errorMessage = error["NSAppleScriptErrorMessage"] as? String ?? "Unknown error"
            throw ExportError.appleScriptFailed(errorMessage)
        }
        
        return output.stringValue ?? ""
    }
    
    /// Expand tilde in path (~/Desktop -> /Users/username/Desktop)
    private static func expandTildePath(_ path: String) -> String {
        if path.hasPrefix("~") {
            return NSString(string: path).expandingTildeInPath
        }
        return path
    }
}
