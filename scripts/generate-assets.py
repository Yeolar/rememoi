#!/usr/bin/env python3
"""Generate the visual assets for Rememoi.

Run with:  python3 scripts/generate-assets.py
Requires Pillow + numpy.
"""

from __future__ import annotations

import colorsys
import json
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
MEMORY_MEDIA = PUBLIC / "memory-media"

LATIN_FONT = "/System/Library/Fonts/Avenir Next.ttc"
CJK_FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc"


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def rgb_to_hex(rgb: tuple[float, float, float]) -> str:
    return "#%02x%02x%02x" % tuple(max(0, min(255, int(round(c)))) for c in rgb)


def adjust(value: str, lightness: float = 0.0, saturation: float = 0.0) -> str:
    r, g, b = (c / 255 for c in hex_to_rgb(value))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    l = max(0.0, min(1.0, l + lightness))
    s = max(0.0, min(1.0, s + saturation))
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return rgb_to_hex((r * 255, g * 255, b * 255))


def gradient_array(width: int, height: int, c1: str, c2: str, angle: float = 35.0) -> np.ndarray:
    xs = np.linspace(0, 1, width)[None, :]
    ys = np.linspace(0, 1, height)[:, None]
    theta = math.radians(angle)
    t = np.clip(0.65 * xs + 0.35 * ys + 0.08 * math.sin(theta), 0, 1)
    start = np.array(hex_to_rgb(c1), dtype=float)
    end = np.array(hex_to_rgb(c2), dtype=float)
    return start + (end - start) * t[..., None]


def add_glow(
    base: np.ndarray,
    center: tuple[float, float],
    radius: float,
    color: tuple[int, int, int],
    strength: float = 0.55,
) -> np.ndarray:
    height, width = base.shape[:2]
    ys, xs = np.mgrid[0:height, 0:width]
    cx, cy = center[0] * width, center[1] * height
    dist = np.sqrt((xs - cx) ** 2 + (ys - cy) ** 2) / (radius * min(width, height))
    falloff = np.clip(1 - dist, 0, 1) ** 2.2
    color_arr = np.array(color, dtype=float)
    return base * (1 - falloff[..., None] * strength) + color_arr * (falloff[..., None] * strength)


def grain(base: np.ndarray, amount: float = 7.0) -> np.ndarray:
    height, width = base.shape[:2]
    noise = np.random.default_rng(7).normal(0, amount, (height, width, 1))
    return np.clip(base + noise, 0, 255)


def abstract_cover(
    path: Path,
    width: int,
    height: int,
    color: str,
    variant: int = 0,
    dark: bool = False,
) -> None:
    rng = random.Random(variant * 31 + width + height)
    base_light = adjust(color, 0.12, -0.05)
    base_dark = adjust(color, -0.28, 0.03)
    background = adjust(color, 0.34 if not dark else -0.22, -0.22)
    arr = gradient_array(width, height, base_dark, background, angle=30 + variant * 17)

    # soft glows
    glow_color = hex_to_rgb(adjust(color, 0.18, 0.05))
    arr = add_glow(arr, (0.18 + rng.random() * 0.2, 0.22), 0.55, glow_color, 0.55)
    arr = add_glow(arr, (0.82, 0.78), 0.65, hex_to_rgb(base_light), 0.4)

    # vignette
    ys, xs = np.mgrid[0:height, 0:width]
    norm = np.sqrt(((xs / width) - 0.5) ** 2 + ((ys / height) - 0.5) ** 2) / 0.72
    arr *= (1 - 0.22 * np.clip(norm, 0, 1))[..., None]

    image = Image.fromarray(grain(arr, 2.6).astype(np.uint8), mode="RGB").convert("RGBA")

    # soft colour blobs for depth
    blobs = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    blob_draw = ImageDraw.Draw(blobs)
    blob_colors = [
        (*hex_to_rgb(adjust(color, 0.2, -0.04)), 55),
        (*hex_to_rgb(adjust(color, -0.12, 0.04)), 42),
        (255, 255, 255, 18),
    ]
    for index in range(3):
        radius = int(min(width, height) * (0.3 + rng.random() * 0.25))
        cx = int(width * (0.15 + rng.random() * 0.75))
        cy = int(height * (0.1 + rng.random() * 0.8))
        blob_draw.ellipse(
            (cx - radius, cy - radius, cx + radius, cy + radius),
            fill=blob_colors[index],
        )
    blobs = blobs.filter(ImageFilter.GaussianBlur(min(width, height) * 0.08))
    image = Image.alpha_composite(image, blobs)

    # broad diagonal band
    band = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    band_draw = ImageDraw.Draw(band)
    band_draw.polygon(
        [
            (0, height * 0.62),
            (width, height * 0.12),
            (width, height * 0.34),
            (0, height * 0.84),
        ],
        fill=(255, 255, 255, 9),
    )
    image = Image.alpha_composite(image, band)

    # translucent geometry
    layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for index in range(4):
        radius = int(min(width, height) * (0.18 + rng.random() * 0.28))
        cx = int(width * (0.15 + rng.random() * 0.7))
        cy = int(height * (0.15 + rng.random() * 0.7))
        alpha = 48 + int(rng.random() * 32)
        outline = (255, 255, 255, alpha) if not dark else (255, 255, 255, alpha)
        draw.ellipse(
            (cx - radius, cy - radius, cx + radius, cy + radius),
            outline=outline,
            width=max(1, int(min(width, height) * 0.0015)),
        )
    # sweeping arcs
    for index in range(3):
        start = -20 + index * 55 + variant * 8
        bbox = (
            int(-width * 0.25),
            int(height * (0.05 + index * 0.22)),
            int(width * 1.15),
            int(height * (1.2 + index * 0.3)),
        )
        draw.arc(bbox, start=start, end=start + 55, fill=(255, 255, 255, 46), width=2)

    ring = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    ring_draw = ImageDraw.Draw(ring)
    ring_draw.ellipse(
        (int(width * 0.58), int(height * 0.12), int(width * 1.16), int(height * 1.12)),
        outline=(255, 255, 255, 42),
        width=2,
    )
    ring = ring.filter(ImageFilter.GaussianBlur(0.6))
    layer = Image.alpha_composite(layer, ring)

    layer = layer.filter(ImageFilter.GaussianBlur(1.2))
    image = Image.alpha_composite(image, layer)

    # small corner mark
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(LATIN_FONT, max(14, int(width * 0.011)), index=5)
    draw.text(
        (int(width * 0.055), int(height * 0.905)),
        "— notes worth keeping",
        font=ImageFont.truetype(LATIN_FONT, max(12, int(width * 0.0085)), index=5),
        fill=(255, 255, 255, 66),
    )
    draw.text(
        (int(width * 0.055), int(height * 0.86)),
        "REMEMOI · AGENT MEMORY",
        font=font,
        fill=(255, 255, 255, 100),
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    output = path.with_suffix(".jpg") if path.suffix == ".png" else path
    image.convert("RGB").save(output, quality=86, optimize=True, progressive=True)


def make_avatar(size: int = 1024) -> Image.Image:
    arr = gradient_array(size, size, "#2F5D74", "#8FC1D4", angle=45)
    arr = add_glow(arr, (0.3, 0.25), 0.6, (255, 255, 255), 0.25)
    arr = grain(arr, 4.0)
    image = Image.fromarray(arr.astype(np.uint8), mode="RGB").convert("RGBA")

    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.ellipse(
        (int(size * 0.08), int(size * 0.08), int(size * 0.92), int(size * 0.92)),
        outline=(255, 255, 255, 38),
        width=max(2, size // 220),
    )
    draw.ellipse(
        (int(size * 0.2), int(size * 0.2), int(size * 0.8), int(size * 0.8)),
        outline=(255, 255, 255, 22),
        width=max(1, size // 320),
    )
    image = Image.alpha_composite(image, layer)

    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype(LATIN_FONT, int(size * 0.46), index=5)
    text = "r"
    bbox = draw.textbbox((0, 0), text, font=font)
    draw.text(
        ((size - (bbox[2] - bbox[0])) / 2 - bbox[0], (size - (bbox[3] - bbox[1])) / 2 - bbox[1] - size * 0.02),
        text,
        font=font,
        fill=(252, 252, 253, 240),
    )

    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * 4, size * 4), fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)
    image.putalpha(mask)
    return image


def make_social_card() -> Image.Image:
    width, height = 1200, 630
    arr = gradient_array(width, height, "#FCFCFD", "#EDF4F7", angle=15)
    arr = add_glow(arr, (0.86, 0.28), 0.55, (101, 158, 185), 0.28)
    arr = add_glow(arr, (0.98, 0.9), 0.45, (207, 226, 233), 0.4)
    arr = grain(arr, 1.5)
    image = Image.fromarray(arr.astype(np.uint8), mode="RGB").convert("RGB")
    draw = ImageDraw.Draw(image)

    # decorative rings on the right
    cx, cy = 960, 300
    for radius, alpha in ((210, 80), (160, 120), (110, 170), (62, 230)):
        draw.ellipse(
            (cx - radius, cy - radius, cx + radius, cy + radius),
            outline=(101, 158, 185, alpha),
            width=2,
        )
    draw.ellipse((cx - 34, cy - 34, cx + 34, cy + 34), fill=(101, 158, 185, 235))
    draw.ellipse((cx - 10, cy - 10, cx + 10, cy + 10), fill=(252, 252, 253, 235))

    # left content
    left = 78
    accent = (101, 158, 185)
    draw.rounded_rectangle((left, 185, left + 10, 215), radius=5, fill=accent)
    draw.text(
        (left + 30, 166),
        "REMEMOI · AGENT MEMORY",
        font=ImageFont.truetype(LATIN_FONT, 22, index=5),
        fill=(101, 158, 185),
    )
    draw.text(
        (left - 6, 232),
        "rememoi",
        font=ImageFont.truetype(LATIN_FONT, 112, index=0),
        fill=(16, 18, 22),
    )
    cjk = ImageFont.truetype(CJK_FONT, 38)
    draw.text((left, 390), "Agent 会话的长期记忆。", font=cjk, fill=(60, 66, 74))
    draw.text(
        (left, 470),
        "Recorded, organized, rediscovered · Next.js",
        font=ImageFont.truetype(LATIN_FONT, 21, index=5),
        fill=(110, 118, 126),
    )
    draw.line((left, 540, left + 470, 540), fill=(210, 216, 220), width=1)
    draw.text(
        (left, 558),
        "github.com/Yeolar/rememoi",
        font=ImageFont.truetype(LATIN_FONT, 20, index=5),
        fill=(140, 148, 156),
    )
    return image


def make_tornado_icon(size: int = 1024) -> Image.Image:
    """Lucide tornado (ISC) on the Rememoi blue tile."""
    yy, xx = np.mgrid[0:size, 0:size]
    t = (xx + yy) / (2 * (size - 1))
    start = np.array(hex_to_rgb("#659EB9"), dtype=float)
    end = np.array(hex_to_rgb("#2E6B85"), dtype=float)
    rgb = start + (end - start) * t[..., None]
    image = Image.fromarray(rgb.astype(np.uint8), "RGB").convert("RGBA")

    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, size - 1, size - 1), radius=round(size * 0.25), fill=255
    )
    image.putalpha(mask)

    draw = ImageDraw.Draw(image)
    pad = size / 8
    scale = (size - 2 * pad) / 24
    stroke = 2 * scale
    lines = [
        ((21, 4), (3, 4)),
        ((18, 8), (6, 8)),
        ((19, 12), (9, 12)),
        ((16, 16), (10, 16)),
        ((11, 20), (9, 20)),
    ]
    color = "#FCFCFD"
    for (x1, y1), (x2, y2) in lines:
        a = (pad + x1 * scale, pad + y1 * scale)
        b = (pad + x2 * scale, pad + y2 * scale)
        draw.line((a, b), fill=color, width=round(stroke))
        radius = stroke / 2
        for x, y in (a, b):
            draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)
    return image


def make_favicons() -> None:
    favicon_dir = PUBLIC / "favicon"
    favicon_dir.mkdir(parents=True, exist_ok=True)
    icon = make_tornado_icon()
    sizes = {
        "android-chrome-512x512.png": 512,
        "android-chrome-192x192.png": 192,
        "apple-touch-icon.png": 180,
        "favicon-32x32.png": 32,
        "favicon-16x16.png": 16,
    }
    for name, size in sizes.items():
        icon.resize((size, size), Image.LANCZOS).save(favicon_dir / name)

    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    icon.resize((256, 256), Image.LANCZOS).save(favicon_dir / "favicon.ico", sizes=ico_sizes)
    # Next.js serves this one from /favicon.ico
    icon.resize((256, 256), Image.LANCZOS).save(PUBLIC / "favicon.ico", sizes=ico_sizes)
    manifest = {
        "name": "Rememoi",
        "short_name": "Rememoi",
        "icons": [
            {"src": "/favicon/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/favicon/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png"},
        ],
        "theme_color": "#659EB9",
        "background_color": "#FCFCFD",
        "display": "standalone",
    }
    (favicon_dir / "site.webmanifest").write_text(json.dumps(manifest, indent=2) + "\n")

COVERS = {
    "hello-rememoi": ("#659EB9", 1, False),
    "building-rememoi-with-nextjs": ("#6C8EA8", 2, False),
    "markdown-syntax": ("#B4C6DA", 3, False),
    "markdown-syntax-zh": ("#C3B2C8", 4, False),
    "design-notes-typography": ("#C08A7A", 5, False),
    "small-tools-long-memory": ("#B79A76", 9, False),
    "draft-notes": ("#9A9AB5", 7, True),
}


def main() -> None:
    images_dir = PUBLIC / "images"
    avatar = make_avatar(512)
    avatar.resize((256, 256), Image.LANCZOS).save(images_dir / "avatar.png", optimize=True)
    make_social_card().save(images_dir / "social-card.jpg", quality=90, optimize=True, progressive=True)
    make_favicons()

    for slug, (color, variant, dark) in COVERS.items():
        abstract_cover(MEMORY_MEDIA / slug / "cover.png", 1600, 1000, color, variant, dark)

    # inline article figures
    abstract_cover(MEMORY_MEDIA / "markdown-syntax" / "figure.png", 1600, 900, "#8FA9C4", 11)
    abstract_cover(MEMORY_MEDIA / "markdown-syntax-zh" / "figure.png", 1600, 900, "#C3B2C8", 14)
    abstract_cover(MEMORY_MEDIA / "design-notes-typography" / "figure.png", 1600, 900, "#D2A08F", 12)
    abstract_cover(MEMORY_MEDIA / "building-rememoi-with-nextjs" / "figure.png", 1600, 900, "#7C9BB5", 13)

    project_palettes = [("#659EB9", 21), ("#8E8AB8", 22), ("#6BA58F", 23), ("#C08A7A", 24)]
    for index, (color, variant) in enumerate(project_palettes, start=1):
        abstract_cover(images_dir / "projects" / f"{index}.png", 1200, 800, color, variant)

    print("assets generated")


if __name__ == "__main__":
    main()
