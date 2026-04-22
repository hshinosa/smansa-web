#!/usr/bin/env python3

import os
from pathlib import Path
from PIL import Image

SOURCE_DIR = Path("/home/hshi/smansa-web/data_smansa")
QUALITY = 90

def get_image_files():
    extensions = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.JPG', '.JPEG', '.PNG', '.WEBP', '.BMP'}
    image_files = []
    
    for root, dirs, files in os.walk(SOURCE_DIR):
        for file in files:
            if Path(file).suffix.upper() in {ext.upper() for ext in extensions}:
                image_files.append(Path(root) / file)
    
    return image_files

def convert_to_jpg(image_path):
    try:
        img = Image.open(image_path)
        
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        output_path = image_path.with_suffix('.jpg')
        
        img.save(
            output_path,
            'JPEG',
            quality=QUALITY,
            optimize=True,
            progressive=True
        )
        
        original_size = image_path.stat().st_size
        new_size = output_path.stat().st_size
        reduction = ((original_size - new_size) / original_size * 100) if original_size > new_size else 0
        
        if str(image_path) != str(output_path):
            image_path.unlink()
        
        return True, f"✓ {image_path.name} ({original_size/1024:.1f}KB → {new_size/1024:.1f}KB, -{reduction:.1f}%)"
    
    except Exception as e:
        return False, f"✗ {image_path.name}: {str(e)}"

def main():
    print(f"🔍 Scanning {SOURCE_DIR} for images...")
    image_files = get_image_files()
    
    if not image_files:
        print("❌ No images found!")
        return
    
    print(f"📊 Found {len(image_files)} images")
    print(f"⚙️  Converting to JPG (quality={QUALITY}%)...\n")
    
    success = 0
    failed = 0
    total_saved = 0
    
    for i, image_path in enumerate(image_files, 1):
        print(f"[{i}/{len(image_files)}] Processing {image_path.relative_to(SOURCE_DIR)}")
        
        original_size = image_path.stat().st_size
        result, message = convert_to_jpg(image_path)
        
        if result:
            success += 1
            new_size = image_path.with_suffix('.jpg').stat().st_size
            total_saved += (original_size - new_size)
            print(f"  {message}")
        else:
            failed += 1
            print(f"  {message}")
    
    print(f"\n{'='*60}")
    print(f"✅ COMPLETED")
    print(f"{'='*60}")
    print(f"Success: {success}/{len(image_files)}")
    print(f"Failed:  {failed}/{len(image_files)}")
    print(f"Total saved: {total_saved/1024/1024:.2f} MB ({total_saved/1024:.1f} KB)")
    if success > 0:
        print(f"Avg saved per image: {total_saved/success/1024:.1f} KB")

if __name__ == "__main__":
    main()
