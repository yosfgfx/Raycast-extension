import Foundation
#if os(macOS)
import AppKit
#endif

struct PagesExporter {
    
    /// Get the total number of pages in the frontmost Pages document
    static func getPageCount() throws -> Int {
        let script = """
        tell application "Pages"
            if (count of documents) is 0 then
                error "No Pages document is open"
            end if
            
            tell front document
                return count of pages
            end tell
        end tell
        """
        
        let result = try executeAppleScript(script)
        guard let count = Int(result.trimmingCharacters(in: .whitespacesAndNewlines)) else {
            throw ExportError.appleScriptFailed("Could not parse page count")
        }
        return count
    }
    
    /// Get the name of the frontmost Pages document
    static func getDocumentName() throws -> String {
        let script = """
        tell application "Pages"
            if (count of documents) is 0 then
                error "No Pages document is open"
            end if
            
            tell front document
                return name
            end tell
        end tell
        """
        
        let result = try executeAppleScript(script)
        let documentName = result.trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Remove .pages extension if present
        if documentName.hasSuffix(".pages") {
            return String(documentName.dropLast(6))
        }
        
        return documentName
    }
    
    /// Export the entire document to PDF
    static func exportFullPDF(outputPath: String) throws {
        let expandedPath = expandTildePath(outputPath)
        
        let script = """
        tell application "Pages"
            if (count of documents) is 0 then
                error "No Pages document is open"
            end if
            
            tell front document
                export to POSIX file "\(expandedPath)" as PDF
            end tell
        end tell
        """
        
        _ = try executeAppleScript(script)
    }
    
    /// Export the entire document to DOCX
    static func exportDOCX(outputPath: String) throws {
        let expandedPath = expandTildePath(outputPath)
        
        let script = """
        tell application "Pages"
            if (count of documents) is 0 then
                error "No Pages document is open"
            end if
            
            tell front document
                export to POSIX file "\(expandedPath)" as Microsoft Word
            end tell
        end tell
        """
        
        _ = try executeAppleScript(script)
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
    
    /// Expand tilde in path
    private static func expandTildePath(_ path: String) -> String {
        if path.hasPrefix("~") {
            return NSString(string: path).expandingTildeInPath
        }
        return path
    }
}
