#!/bin/bash
# Fix JSX files damaged by bash script
# This script uses git diff to restore only the damaged parts

set -e

echo "🔧 Fixing damaged JSX files..."

# List of all damaged files
FILES=(
    "resources/js/Components/Admin/ContentEditorSidebar.jsx"
    "resources/js/Components/Admin/ContentManagementPage.jsx"
    "resources/js/Components/Admin/FileUploadField.jsx"
    "resources/js/Components/Admin/IconPicker.jsx"
    "resources/js/Components/Admin/ImageUploadCard.jsx"
    "resources/js/Components/Admin/MapsPicker.jsx"
    "resources/js/Pages/AcademicCalendarPage.jsx"
    "resources/js/Pages/Admin/AcademicCalendarContentPage.jsx"
    "resources/js/Pages/Admin/DashboardPage.jsx"
    "resources/js/Pages/Admin/Extracurriculars/Index.jsx"
    "resources/js/Pages/Admin/Faqs/Index.jsx"
    "resources/js/Pages/Admin/InstagramSettings/Index.jsx"
    "resources/js/Pages/Admin/LandingPageContentPage.jsx"
    "resources/js/Pages/Admin/Posts/Index.jsx"
    "resources/js/Pages/Admin/SchoolProfile/Index.jsx"
    "resources/js/Pages/Admin/SeragamPage.jsx"
    "resources/js/Pages/Admin/SiteSettings/Index.jsx"
    "resources/js/Pages/Admin/SpmbContentPage.jsx"
    "resources/js/Pages/AlumniPage.jsx"
    "resources/js/Pages/BeritaDetailPage.jsx"
    "resources/js/Pages/BeritaPengumumanPage.jsx"
    "resources/js/Pages/DataSerapanPTNPage.jsx"
    "resources/js/Pages/EkstrakurikulerPage.jsx"
    "resources/js/Pages/GaleriPage.jsx"
    "resources/js/Pages/GuruStaffPage.jsx"
    "resources/js/Pages/HasilTkaPage.jsx"
    "resources/js/Pages/InformasiSpmbPage.jsx"
    "resources/js/Pages/KontakPage.jsx"
    "resources/js/Pages/KurikulumPage.jsx"
    "resources/js/Pages/LandingPage.jsx"
    "resources/js/Pages/PrestasiAkademikPage.jsx"
    "resources/js/Pages/ProfilSekolahPage.jsx"
    "resources/js/Pages/ProgramBahasaPage.jsx"
    "resources/js/Pages/ProgramIpsPage.jsx"
    "resources/js/Pages/ProgramMipaPage.jsx"
    "resources/js/Pages/ProgramSekolahPage.jsx"
    "resources/js/Pages/SeragamPage.jsx"
    "resources/js/Pages/StrukturOrganisasiPage.jsx"
    "resources/js/Pages/VisiMisiPage.jsx"
)

FIXED=0
FAILED=0

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  Processing: $file"
        
        git checkout HEAD -- "$file" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            if grep -q "logger\." "$file"; then
                if ! grep -q "import { logger } from '@/Utils/logger';" "$file"; then
                    sed -i "1a import { logger } from '@/Utils/logger';" "$file"
                fi
            fi
            
            echo "    ✅ Fixed"
            ((FIXED++))
        else
            echo "    ❌ Failed"
            ((FAILED++))
        fi
    else
        echo "    ⚠️  File not found: $file"
    fi
done

echo ""
echo "✅ Fixed: $FIXED files"
echo "❌ Failed: $FAILED files"
echo ""
echo "Next: npm run lint"
