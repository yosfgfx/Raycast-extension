#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title تحويل فيديو من رابط
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 🌐
# @raycast.argument1 { "type": "text", "placeholder": "رابط الفيديو (URL)" }
# @raycast.packageName Video Converter

# Documentation:
# @raycast.description حمّل فيديو من URL وحوله إلى MP4 عالي الجودة
# @raycast.author yosfgfx

# ==========================================
# التحقق من وجود ffmpeg
# ==========================================
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ خطأ: ffmpeg غير مثبت"
    echo ""
    echo "📦 قم بتثبيته باستخدام Homebrew:"
    echo "   brew install ffmpeg"
    echo ""
    echo "💡 إذا لم يكن لديك Homebrew، ثبته من:"
    echo "   https://brew.sh"
    exit 1
fi

VIDEO_URL="$1"

# ==========================================
# التحقق من وجود الرابط
# ==========================================
if [ -z "$VIDEO_URL" ]; then
    echo "❌ خطأ: لم يتم تحديد رابط الفيديو"
    echo ""
    echo "💡 الاستخدام:"
    echo "   تحويل-فيديو-من-رابط <URL>"
    exit 1
fi

# ==========================================
# التحقق من صحة الرابط
# ==========================================
if [[ ! "$VIDEO_URL" =~ ^https?:// ]]; then
    echo "❌ خطأ: رابط غير صحيح"
    echo "📎 الرابط المحدد: $VIDEO_URL"
    echo ""
    echo "💡 تأكد أن الرابط يبدأ بـ http:// أو https://"
    exit 1
fi

# ==========================================
# إعداد المجلدات
# ==========================================
TEMP_DIR="$HOME/tmp/raycast-video-converter"
DOWNLOADS_DIR="$HOME/Downloads"

# إنشاء المجلد المؤقت إذا لم يكن موجوداً
mkdir -p "$TEMP_DIR"

# ==========================================
# عرض معلومات التحميل
# ==========================================
echo "╔════════════════════════════════════════════════════════════╗"
echo "║       🌐 تحميل وتحويل فيديو من URL - جودة عالية         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🔗 الرابط:"
echo "   $VIDEO_URL"
echo ""

# ==========================================
# تحديد أداة التحميل المناسبة
# ==========================================
USE_YT_DLP=false

# التحقق من وجود yt-dlp لمواقع البث
if command -v yt-dlp &> /dev/null; then
    # التحقق إذا كان الرابط من YouTube أو مواقع البث الأخرى
    if [[ "$VIDEO_URL" =~ (youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|twitch\.tv) ]]; then
        USE_YT_DLP=true
        echo "ℹ️  تم اكتشاف موقع بث، سيتم استخدام yt-dlp"
        echo ""
    fi
fi

# ==========================================
# تحميل الفيديو
# ==========================================
echo "⏬ جاري التحميل..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$USE_YT_DLP" = true ]; then
    # استخدام yt-dlp لمواقع البث
    TEMP_FILE="$TEMP_DIR/downloaded_video.%(ext)s"
    
    yt-dlp -f "best[ext=mp4]/best" \
        -o "$TEMP_DIR/downloaded_video.%(ext)s" \
        --progress \
        "$VIDEO_URL"
    
    DOWNLOAD_STATUS=$?
    
    # العثور على الملف المحمل
    DOWNLOADED_FILE=$(find "$TEMP_DIR" -name "downloaded_video.*" -type f | head -n 1)
    
else
    # استخدام curl للروابط المباشرة
    TEMP_FILE="$TEMP_DIR/downloaded_video.mp4"
    
    curl -L \
        --progress-bar \
        -o "$TEMP_FILE" \
        "$VIDEO_URL"
    
    DOWNLOAD_STATUS=$?
    DOWNLOADED_FILE="$TEMP_FILE"
fi

# ==========================================
# التحقق من نجاح التحميل
# ==========================================
if [ $DOWNLOAD_STATUS -ne 0 ] || [ ! -f "$DOWNLOADED_FILE" ]; then
    echo ""
    echo "❌ فشل تحميل الفيديو"
    echo ""
    echo "💡 الحلول المحتملة:"
    echo "   1. تحقق من صحة الرابط"
    echo "   2. تأكد من اتصالك بالإنترنت"
    
    if [[ "$VIDEO_URL" =~ (youtube\.com|youtu\.be|vimeo\.com) ]] && ! command -v yt-dlp &> /dev/null; then
        echo "   3. لتحميل من YouTube/Vimeo، ثبت yt-dlp:"
        echo "      brew install yt-dlp"
    fi
    
    echo ""
    
    # تنظيف الملفات المؤقتة
    rm -rf "$TEMP_DIR"
    
    exit 1
fi

echo ""
echo "✓ تم التحميل بنجاح"
echo ""

# ==========================================
# إعداد ملف الإخراج
# ==========================================
FILENAME=$(basename "$DOWNLOADED_FILE")
FILENAME_NO_EXT="${FILENAME%.*}"
OUTPUT_FILE="${DOWNLOADS_DIR}/${FILENAME_NO_EXT}_converted.mp4"

# إذا كان الملف موجوداً بالفعل، أضف رقم تسلسلي
COUNTER=1
while [ -f "$OUTPUT_FILE" ]; do
    OUTPUT_FILE="${DOWNLOADS_DIR}/${FILENAME_NO_EXT}_converted_${COUNTER}.mp4"
    ((COUNTER++))
done

# ==========================================
# تحويل الفيديو
# ==========================================
echo "🎬 جاري تحويل الفيديو إلى MP4 بجودة عالية..."
echo ""
echo "⚙️  إعدادات الجودة:"
echo "   • ترميز الفيديو: H.264 (libx264)"
echo "   • جودة CRF: 18 (جودة عالية جداً)"
echo "   • Preset: slow (أفضل ضغط)"
echo "   • ترميز الصوت: AAC 256kbps"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ffmpeg -i "$DOWNLOADED_FILE" \
    -c:v libx264 \
    -preset slow \
    -crf 18 \
    -c:a aac \
    -b:a 256k \
    -movflags +faststart \
    -y \
    "$OUTPUT_FILE" 2>&1 | grep -E "frame=|time=|speed=|video:|audio:|Stream|Duration"

CONVERT_STATUS=${PIPESTATUS[0]}

# ==========================================
# تنظيف الملفات المؤقتة
# ==========================================
echo ""
echo "🧹 جاري تنظيف الملفات المؤقتة..."
rm -rf "$TEMP_DIR"

# ==========================================
# التحقق من نجاح العملية
# ==========================================
if [ $CONVERT_STATUS -eq 0 ] && [ -f "$OUTPUT_FILE" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅ تم التحميل والتحويل بنجاح!"
    echo ""
    
    # عرض معلومات الملف
    CONVERTED_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    
    echo "📊 معلومات الملف:"
    echo "   • الحجم: $CONVERTED_SIZE"
    echo ""
    echo "📁 الموقع:"
    echo "   $OUTPUT_FILE"
    echo ""
    echo "╭─────────────────────────────────────────────────────────────╮"
    echo "│  💡 تم حفظ الفيديو في مجلد التنزيلات                       │"
    echo "╰─────────────────────────────────────────────────────────────╯"
    
    # فتح مجلد التنزيلات
    open -R "$OUTPUT_FILE"
    
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "❌ فشل التحويل"
    echo ""
    echo "💡 الحلول المحتملة:"
    echo "   1. تأكد من أن الملف فيديو صالح"
    echo "   2. تحقق من وجود مساحة كافية على القرص"
    echo "   3. جرب تحديث ffmpeg: brew upgrade ffmpeg"
    echo ""
    exit 1
fi
