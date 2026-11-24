import os
import re

MAPPINGS = {
    # Legacy Blues & Teals -> Red Palette
    "#086A92": "#990000",
    "#086a92": "#990000",
    "#008C91": "#C00000",
    "#008c91": "#C00000",
    "#065A7D": "#800000",
    "#065a7d": "#800000",
    "#07597B": "#800000",
    "#07597b": "#800000",
    "#065575": "#800000",
    "#043A52": "#171717",
    "#043a52": "#171717",
    
    # Text Dark Teal -> Near-black
    "#17313A": "#171717",
    "#17313a": "#171717",
    "#4A5D65": "#525252",
    "#4a5d65": "#525252",
    "#6B7C83": "#737373",
    "#6b7c83": "#737373",
    
    # Backgrounds & Light Teals -> Red-50 / Light Grey / White
    "#EAF5F8": "#FEF2F2",
    "#eaf5f8": "#FEF2F2",
    "#E0F5F5": "#FEF2F2",
    "#e0f5f5": "#FEF2F2",
    "#F7FAFA": "#F5F5F5",
    "#f7fafa": "#F5F5F5",
    
    # Borders -> Subtle Grey / Red-200
    "#E4EAEC": "#E5E5E5",
    "#e4eaec": "#E5E5E5",
    "#cbd7da": "#E5E5E5",
    "#CBD7DA": "#E5E5E5",
    "#c0e3ed": "#FECACA",
    "#C0E3ED": "#FECACA",
    "#A2E2F8": "#FFFFFF",
    "#a2e2f8": "#FFFFFF",
}

def migrate_directory(dir_path):
    total_files = 0
    modified_files = 0
    total_replacements = 0

    for root, _, files in os.walk(dir_path):
        for f in files:
            if not (f.endswith('.tsx') or f.endswith('.ts') or f.endswith('.css')):
                continue
            
            file_path = os.path.join(root, f)
            total_files += 1
            
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            original = content
            file_replacements = 0
            
            for old_val, new_val in MAPPINGS.items():
                if old_val in content:
                    count = content.count(old_val)
                    content = content.replace(old_val, new_val)
                    file_replacements += count
            
            if content != original:
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(content)
                modified_files += 1
                total_replacements += file_replacements
                print(f"Updated {f}: {file_replacements} replacements")

    print(f"\nMigration Complete:")
    print(f"Scanned {total_files} files.")
    print(f"Modified {modified_files} files with {total_replacements} total replacements.")

if __name__ == "__main__":
    src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src'))
    migrate_directory(src_dir)
