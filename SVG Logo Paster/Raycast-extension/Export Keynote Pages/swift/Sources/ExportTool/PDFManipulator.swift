import Foundation
#if os(macOS)
import PDFKit
#endif

struct PDFManipulator {
    
    /// Extract specific pages from a PDF and save to a new file
    static func extractPages(fromPDF inputPath: String, outputPath: String, fromPage: Int, toPage: Int) throws {
        let expandedInputPath = expandTildePath(inputPath)
        let expandedOutputPath = expandTildePath(outputPath)
        
        let inputURL = URL(fileURLWithPath: expandedInputPath)
        let outputURL = URL(fileURLWithPath: expandedOutputPath)
        
        // Load the source PDF
        guard let sourcePDF = PDFDocument(url: inputURL) else {
            throw ExportError.pdfLoadFailed
        }
        
        // Validate page range
        let pageCount = sourcePDF.pageCount
        guard fromPage >= 0 && fromPage < pageCount else {
            throw ExportError.invalidSlideRange
        }
        guard toPage >= fromPage && toPage < pageCount else {
            throw ExportError.invalidSlideRange
        }
        
        // Create new PDF with only the specified pages
        let newPDF = PDFDocument()
        
        for pageIndex in fromPage...toPage {
            if let page = sourcePDF.page(at: pageIndex) {
                newPDF.insert(page, at: newPDF.pageCount)
            }
        }
        
        // Ensure output directory exists
        let outputDir = outputURL.deletingLastPathComponent()
        try FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)
        
        // Save the new PDF
        guard newPDF.write(to: outputURL) else {
            throw ExportError.pdfSaveFailed
        }
    }
    
    /// Expand tilde in path
    private static func expandTildePath(_ path: String) -> String {
        if path.hasPrefix("~") {
            return NSString(string: path).expandingTildeInPath
        }
        return path
    }
}
