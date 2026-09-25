"""Convert every PNG under images/ to WebP (and delete the PNG).

The site loads .webp files only, so run this after adding new PNG art:

    python3 tools/convert_to_webp.py

Quality 95 with lossless alpha is visually identical to the PNGs for this
art while being ~85-90% smaller. The PNG's color profile (the art is
Display P3) is carried over — without it browsers assume sRGB and the
colors come out noticeably duller. Needs Pillow (pip3 install pillow).
"""

from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

from PIL import Image

QUALITY = 95
IMAGES_DIR = Path(__file__).resolve().parent.parent / "images"


def convert(png):
    webp = png.with_suffix(".webp")
    with Image.open(png) as im:
        im.save(webp, "WEBP", quality=QUALITY, method=6, alpha_quality=100,
                icc_profile=im.info.get("icc_profile"))
    before = png.stat().st_size
    png.unlink()
    return before, webp.stat().st_size


if __name__ == "__main__":
    pngs = sorted(IMAGES_DIR.rglob("*.png"))
    with ProcessPoolExecutor() as pool:
        sizes = list(pool.map(convert, pngs))
    print(f"{len(pngs)} files: {sum(b for b, _ in sizes) / 1e6:.1f}MB -> "
          f"{sum(a for _, a in sizes) / 1e6:.1f}MB")
