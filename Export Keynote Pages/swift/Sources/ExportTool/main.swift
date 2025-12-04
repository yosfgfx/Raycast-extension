import Foundation
#if os(macOS)
import AppKit
import PDFKit
#endif

struct ExportTool {
    static func main() {
        let arguments = CommandLine.arguments
        
        guard arguments.count >= 2 else {
            printUsage()
            exit(1)
        }
        
        let app = arguments[1].lowercased()
        
        guard app == "keynote" || app == "pages" else {
            print("Error: Application must be 'keynote' or 'pages'")
            printUsage()
            exit(1)
        }
        
        guard arguments.count >= 3 else {
            print("Error: Command required")
            printUsage()
            exit(1)
        }
        
        let command = arguments[2].lowercased()
        
        do {
            if app == "keynote" {
                try handleKeynoteCommand(command: command, arguments: Array(arguments.dropFirst(3)))
            } else {
                try handlePagesCommand(command: command, arguments: Array(arguments.dropFirst(3)))
            }
        } catch {
            print("Error: \(error.localizedDescription)")
            exit(1)
        }
    }
    
    static func handleKeynoteCommand(command: String, arguments: [String]) throws {
        switch command {
        case "count":
            let count = try KeynoteExporter.getSlideCount()
            print(count)
            
        case "current-slide":
            let slideNumber = try KeynoteExporter.getCurrentSlide()
            print(slideNumber)
            
        case "document-name":
            let documentName = try KeynoteExporter.getDocumentName()
            print(documentName)
            
        case "export-pdf":
            guard arguments.count >= 1 else {
                throw ExportError.missingArgument("output path")
            }
            try KeynoteExporter.exportFullPDF(outputPath: arguments[0])
            print("Success: PDF exported")
            
        case "export-pptx":
            guard arguments.count >= 1 else {
                throw ExportError.missingArgument("output path")
            }
            try KeynoteExporter.exportFullPPTX(outputPath: arguments[0])
            print("Success: PPTX exported")
            
        case "export-slide":
            guard arguments.count >= 2 else {
                throw ExportError.missingArgument("slide number and output path")
            }
            guard let slideNumber = Int(arguments[0]) else {
                throw ExportError.invalidArgument("slide number must be an integer")
            }
            try KeynoteExporter.exportSingleSlide(slideNumber: slideNumber, outputPath: arguments[1])
            print("Success: Slide exported")
            
        case "export-range":
            guard arguments.count >= 3 else {
                throw ExportError.missingArgument("from, to, and output path")
            }
            guard let fromSlide = Int(arguments[0]), let toSlide = Int(arguments[1]) else {
                throw ExportError.invalidArgument("slide numbers must be integers")
            }
            try KeynoteExporter.exportSlideRange(fromSlide: fromSlide, toSlide: toSlide, outputPath: arguments[2])
            print("Success: Range exported")
            
        default:
            throw ExportError.unknownCommand(command)
        }
    }
    
    static func handlePagesCommand(command: String, arguments: [String]) throws {
        switch command {
        case "count":
            let count = try PagesExporter.getPageCount()
            print(count)
            
        case "document-name":
            let documentName = try PagesExporter.getDocumentName()
            print(documentName)
            
        case "export-pdf":
            guard arguments.count >= 1 else {
                throw ExportError.missingArgument("output path")
            }
            try PagesExporter.exportFullPDF(outputPath: arguments[0])
            print("Success: PDF exported")
            
        case "export-docx":
            guard arguments.count >= 1 else {
                throw ExportError.missingArgument("output path")
            }
            try PagesExporter.exportDOCX(outputPath: arguments[0])
            print("Success: DOCX exported")
            
        default:
            throw ExportError.unknownCommand(command)
        }
    }
    
    static func printUsage() {
        print("""
        Export Tool - Keynote & Pages Export Utility
        
        Usage:
          export-tool <app> <command> [arguments]
        
        Applications:
          keynote    Control Keynote
          pages      Control Pages
        
        Keynote Commands:
          count                           Get total slide count
          current-slide                   Get current slide number
          export-pdf <output>            Export full presentation to PDF
          export-pptx <output>           Export full presentation to PPTX
          export-slide <num> <output>    Export single slide to PDF
          export-range <from> <to> <out> Export slide range to PDF
        
        Pages Commands:
          count                           Get total page count
          export-pdf <output>            Export to PDF
          export-docx <output>           Export to DOCX
        
        Examples:
          export-tool keynote count
          export-tool keynote export-pdf ~/Desktop/output.pdf
          export-tool keynote export-range 5 10 ~/Desktop/slides.pdf
        """)
    }
}

enum ExportError: LocalizedError {
    case missingArgument(String)
    case invalidArgument(String)
    case unknownCommand(String)
    case noDocumentOpen
    case appleScriptFailed(String)
    case pdfLoadFailed
    case pdfSaveFailed
    case invalidSlideRange
    
    var errorDescription: String? {
        switch self {
        case .missingArgument(let arg):
            return "Missing required argument: \(arg)"
        case .invalidArgument(let msg):
            return "Invalid argument: \(msg)"
        case .unknownCommand(let cmd):
            return "Unknown command: \(cmd)"
        case .noDocumentOpen:
            return "No document is currently open"
        case .appleScriptFailed(let msg):
            return "AppleScript error: \(msg)"
        case .pdfLoadFailed:
            return "Failed to load PDF document"
        case .pdfSaveFailed:
            return "Failed to save PDF document"
        case .invalidSlideRange:
            return "Invalid slide range"
        }
    }
}

// Execute the CLI tool
ExportTool.main()
