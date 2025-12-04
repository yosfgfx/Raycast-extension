#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title تحويل فيديو من مسار
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 🎬
# @raycast.argument1 { "type": "text", "placeholder": "مسار ملف الفيديو" }
# @raycast.packageName Video Converter

# Documentation:
# @raycast.description تحويل الفيديو إلى MP4 عالي الجودة باستخدام FFmpeg
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

INPUT_FILE="$1"

# ==========================================
# التحقق من وجود مسار الملف
# ==========================================
if [ -z "$INPUT_FILE" ]; then
    echo "❌ خطأ: لم يتم تحديد مسار الملف"
    echo ""
    echo "💡 الاستخدام:"
    echo "   تحويل-فيديو-من-مسار <مسار الملف>"
    exit 1
fi

# ==========================================
# التحقق من وجود الملف
# ==========================================
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ خطأ: الملف غير موجود"
    echo "📁 المسار المحدد: $INPUT_FILE"
    echo ""
    echo "💡 تأكد من صحة المسار وأن الملف موجود"
    exit 1
fi

# ==========================================
# إعداد ملف الإخراج
# ==========================================
FILENAME=$(basename "$INPUT_FILE")
FILENAME_NO_EXT="${FILENAME%.*}"
DOWNLOADS_DIR="$HOME/Downloads"
OUTPUT_FILE="${DOWNLOADS_DIR}/${FILENAME_NO_EXT}_converted.mp4"

# إذا كان الملف موجوداً بالفعل، أضف رقم تسلسلي
COUNTER=1
while [ -f "$OUTPUT_FILE" ]; do
    OUTPUT_FILE="${DOWNLOADS_DIR}/${FILENAME_NO_EXT}_converted_${COUNTER}.mp4"
    ((COUNTER++))
done

# ==========================================
# عرض معلومات العملية
# ==========================================
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          🎬 محول الفيديو إلى MP4 - جودة عالية           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📥 الملف الأصلي:"
echo "   $INPUT_FILE"
echo ""
echo "📤 ملف الإخراج:"
echo "   $OUTPUT_FILE"
echo ""
echo "⚙️  إعدادات الجودة:"
echo "   • ترميز الفيديو: H.264 (libx264)"
echo "   • جودة CRF: 18 (جودة عالية جداً)"
echo "   • Preset: slow (أفضل ضغط)"
echo "   • ترميز الصوت: AAC 256kbps"
echo ""
echo "⏳ جاري التحويل..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==========================================
# تحويل الفيديو بجودة عالية
# ==========================================
ffmpeg -i "$INPUT_FILE" \
    -c:v libx264 \
    -preset slow \
    -crf 18 \
    -c:a aac \
    -b:a 256k \
    -movflags +faststart \
    -y \
    "$OUTPUT_FILE" 2>&1 | grep -E "frame=|time=|speed=|video:|audio:|Stream|Duration"

# ==========================================
# التحقق من نجاح العملية
# ==========================================
if [ ${PIPESTATUS[0]} -eq 0 ] && [ -f "$OUTPUT_FILE" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✅ تم التحويل بنجاح!"
    echo ""
    
    # عرض معلومات الملفات
    ORIGINAL_SIZE=$(du -h "$INPUT_FILE" | cut -f1)
    CONVERTED_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    
    echo "📊 معلومات الملفات:"
    echo "   • الملف الأصلي: $ORIGINAL_SIZE"
    echo "   • الملف المحول: $CONVERTED_SIZE"
    echo ""
    echo "📁 الموقع:"
    echo "   $OUTPUT_FILE"
    echo ""
    echo "╭─────────────────────────────────────────────────────────────╮"
    echo "│  💡 نصيحة: يمكنك فتح مجلد التنزيلات بالضغط على Cmd+J      │"
    echo "╰─────────────────────────────────────────────────────────────╯"
    
    # فتح مجلد التنزيلات (اختياري)
    # open "$DOWNLOADS_DIR"
    
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
