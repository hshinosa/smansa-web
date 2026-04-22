#!/bin/bash
set -e

echo "🔧 Replacing console.log with logger utility..."

FILES=(
    "resources/js/Pages/Admin/Extracurriculars/Index.jsx"
    "resources/js/Pages/Admin/Faqs/Index.jsx"
    "resources/js/Pages/Admin/InstagramSettings/Index.jsx"
    "resources/js/Pages/Admin/Posts/Index.jsx"
    "resources/js/Pages/Admin/SchoolProfile/Index.jsx"
    "resources/js/Pages/Admin/SiteSettings/Index.jsx"
    "resources/js/Pages/Admin/AcademicCalendarContentPage.jsx"
    "resources/js/Pages/Admin/DashboardPage.jsx"
    "resources/js/Pages/AlumniPage.jsx"
    "resources/js/Pages/GaleriPage.jsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  Processing: $file"
        
        if ! grep -q "import { logger } from '@/Utils/logger';" "$file"; then
            sed -i "/^import.*from/a import { logger } from '@/Utils/logger';" "$file"
        fi
        
        sed -i "s/console\.log(/logger.log(/g" "$file"
        sed -i "s/console\.error(/logger.error(/g" "$file"
        sed -i "s/console\.warn(/logger.warn(/g" "$file"
        sed -i "s/console\.debug(/logger.debug(/g" "$file"
        
        echo "    ✅ Updated"
    else
        echo "    ⚠️  File not found: $file"
    fi
done

echo ""
echo "✅ All files processed!"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Test build: npm run build"
echo "  3. Verify no console.log in production"
