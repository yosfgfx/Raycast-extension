export function generateSmartKeywords(nameEn: string, nameAr: string): string[] {
    const keywords = new Set<string>();

    // Helper to clean and add words
    const addWords = (text: string) => {
        if (!text) return;
        text.split(/[\s-_]+/).forEach((word) => {
            const clean = word.replace(/[^\w\u0600-\u06FF]/g, "").trim();
            if (clean.length > 2) {
                keywords.add(clean);
            }
        });
    };

    addWords(nameEn);
    addWords(nameAr);

    // Specific logic for common prefixes/types
    const lowerEn = nameEn.toLowerCase();
    if (lowerEn.includes("ministry")) keywords.add("Ministry");
    if (lowerEn.includes("authority")) keywords.add("Authority");
    if (lowerEn.includes("commission")) keywords.add("Commission");
    if (lowerEn.includes("center")) keywords.add("Center");
    if (lowerEn.includes("bank")) keywords.add("Bank");

    // Arabic specific logic (simple inclusion for now)
    if (nameAr.includes("وزارة")) keywords.add("وزارة");
    if (nameAr.includes("هيئة")) keywords.add("هيئة");
    if (nameAr.includes("مركز")) keywords.add("مركز");
    if (nameAr.includes("بنك")) keywords.add("بنك");
    if (nameAr.includes("مصرف")) keywords.add("مصرف");
    if (nameAr.includes("شركة")) keywords.add("شركة");

    return Array.from(keywords);
}
