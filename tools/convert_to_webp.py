"""Convert every PNG under images/ to WebP (and delete the PNG).

The site loads .webp files only, so run this after adding new PNG art:

    python3 tools/convert_to_webp.py

Quality 95 with lossless alpha is visually identical to the PNGs for this
art while being ~85-90% smaller. Needs Pillow (pip3 install pillow).
"""

from pathlib import Path

from PIL import Image

QUALITY = 95
IMAGES_DIR = Path(__file__).resolve().parent.parent / "images"

before = after = 0
for png in sorted(IMAGES_DIR.rglob("*.png")):
    webp = png.with_suffix(".webp")
    with Image.open(png) as im:
        im.save(webp, "WEBP", quality=QUALITY, method=6, alpha_quality=100)
    before += png.stat().st_size
    after += webp.stat().st_size
    png.unlink()
    print(f"{png.relative_to(IMAGES_DIR)} -> .webp")

print(f"{before / 1e6:.1f}MB -> {after / 1e6:.1f}MB")
