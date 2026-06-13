from PIL import Image
import os

# Load the full asset sheet
asset_path = os.path.join(os.path.dirname(__file__), 'assets', 'full asset.jpg')
img = Image.open(asset_path)

print(f"Image size: {img.size}")
width, height = img.size

# Based on the layout, we have 5 columns and 6 rows
# Column indices: 0=Base, 1=Horizontal, 2=Vertical, 3=T/L Shape, 4=Dream Core
# Rows: 0=Headphones, 1=Energy, 2=Cube, 3=Star, 4=Heart, 5=Paw

cols = 5
rows = 6

cell_width = width // cols
cell_height = height // rows

print(f"Estimated cell size: {cell_width}x{cell_height}")

# Gem names
gem_names = ['headphones', 'energy', 'cube', 'star', 'heart', 'paw']

# Extract horizontal (column 1) and vertical (column 2) for each gem
for row_idx, gem_name in enumerate(gem_names):
    # Horizontal image (column 1)
    left = cell_width * 1
    top = cell_height * row_idx
    right = cell_width * 2
    bottom = cell_height * (row_idx + 1)
    
    horizontal = img.crop((left, top, right, bottom))
    h_path = os.path.join(os.path.dirname(__file__), 'assets', f'{gem_name}-horizontal.png')
    horizontal.save(h_path)
    print(f"Saved: {gem_name}-horizontal.png")
    
    # Vertical image (column 2)
    left = cell_width * 2
    top = cell_height * row_idx
    right = cell_width * 3
    bottom = cell_height * (row_idx + 1)
    
    vertical = img.crop((left, top, right, bottom))
    v_path = os.path.join(os.path.dirname(__file__), 'assets', f'{gem_name}-vertical.png')
    vertical.save(v_path)
    print(f"Saved: {gem_name}-vertical.png")

print("\nExtraction complete! Created:")
for gem_name in gem_names:
    print(f"  - {gem_name}-horizontal.png")
    print(f"  - {gem_name}-vertical.png")
