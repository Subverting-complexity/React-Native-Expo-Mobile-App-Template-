"""
App Store / Google Play screenshot generator.

Composes on-brand store screenshots from raw device captures: a gradient
background in the app palette, a rounded device frame holding the real
screen, and a short two-tone marketing caption. Also renders the Google Play
feature graphic. The only dependency is Pillow (`pip install Pillow`).

Workflow:
  1. Take raw device captures (any consistent portrait size) and drop them in
     assets/store-captures/ at the repo root.
  2. Edit the CONFIG section below: palette (mirror your dark theme), the
     SLIDES list (capture filename + caption per store slide), and the
     wordmark/tagline for the feature graphic.
  3. Preview, then render everything:

         python render.py mockups     # 2 slides -> creative/_preview/ for review
         python render.py full        # full sets -> fastlane/screenshots + android images
         python render.py full B      # variant B: bigger device, softer glow

  Variants A/B differ only in device size and glow intensity — a lightweight
  way to A/B a design direction before committing to the full set.

Every output size is asserted before writing — a 1-pixel miss is an Apple
rejection, so a wrong size fails loudly here instead of at submission.
"""

from __future__ import annotations

import math
import os
import sys
from dataclasses import dataclass

from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ---------------------------------------------------------------------------
# CONFIG — edit everything in this section for your app
# ---------------------------------------------------------------------------

# Palette. Mirrors src/theme/colors.ts `darkColors` (store creative is
# rendered in the dark theme; swap to your light palette if your brand is
# light-first). This duplication is deliberate and documented: the Python
# pipeline cannot import the app's TypeScript, so keep the hexes in the
# trailing comments in sync with the theme when you re-skin.
BG = (13, 13, 13)  # colors.background   #0D0D0D
BG_DEEP = (6, 6, 6)  # darker gradient base
SURFACE = (26, 26, 26)  # colors.surface      #1A1A1A
ACCENT = (116, 143, 252)  # colors.primary      #748FFC
TEXT_PRIMARY = (241, 243, 245)  # colors.textPrimary  #F1F3F5
TEXT_SECONDARY = (173, 181, 189)  # colors.textSecondary #ADB5BD
BORDER = (58, 58, 58)  # colors.border       #3A3A3A

# Feature-graphic branding.
WORDMARK = "Your App"
TAGLINE = "One line that earns the install."

# Raw captures mapped to a stable ordering + captions. Order is the store
# slide order (slide 1 is the most-seen image — lead with the strongest
# feature). Each caption is a single centered line: `cap_lead` rendered in
# the primary text color + `cap_accent` in the accent color. Keep both short
# so the type stays large and legible at thumbnail size, and keep every
# caption honest — a claim the screenshot itself does not show is a
# rejection risk (see fastlane/PUBLISHING.md).
SLIDES = [
    {"id": "capture-01", "cap_lead": "Lead with", "cap_accent": "value"},
    {"id": "capture-02", "cap_lead": "Show the", "cap_accent": "core loop"},
    {"id": "capture-03", "cap_lead": "Prove a", "cap_accent": "feature"},
    {"id": "capture-04", "cap_lead": "Another", "cap_accent": "feature"},
    {"id": "capture-05", "cap_lead": "Close the", "cap_accent": "story"},
]

# Font files, searched in order across the platform font directories below.
# First tuple entry is the headline (bold) face, second is the tagline face.
FONT_CANDIDATES = [
    ("segoeuib.ttf", "segoeui.ttf"),  # Windows
    ("SFNS.ttf", "SFNS.ttf"),  # macOS
    ("Arial Bold.ttf", "Arial.ttf"),  # macOS fallback
    ("DejaVuSans-Bold.ttf", "DejaVuSans.ttf"),  # Linux
]
FONT_DIRS = [
    "C:/Windows/Fonts",
    "/System/Library/Fonts",
    "/Library/Fonts",
    "/usr/share/fonts/truetype/dejavu",
]

# ---------------------------------------------------------------------------
# Paths and store target sizes (do not edit — the stores define these)
# ---------------------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
RAW_DIR = os.path.join(REPO, "assets", "store-captures")

APPLE_IPHONE = (1320, 2868)  # 6.9" master — Apple derives smaller sizes
PLAY_PHONE = (1290, 2796)  # 9:16 portrait within Play limits
PLAY_FEATURE = (1024, 500)  # Play feature graphic

REF_W, REF_H = 1320, 2868  # reference design size; everything scales from it


# ---------------------------------------------------------------------------
# Fonts
# ---------------------------------------------------------------------------
def _resolve_fonts():
    for bold_name, regular_name in FONT_CANDIDATES:
        for d in FONT_DIRS:
            bold = os.path.join(d, bold_name)
            regular = os.path.join(d, regular_name)
            if os.path.isfile(bold) and os.path.isfile(regular):
                return bold, regular
    raise SystemExit(
        "No usable font found. Add a (bold, regular) pair to FONT_CANDIDATES "
        "or a directory to FONT_DIRS in render.py."
    )


BOLD_FONT, REGULAR_FONT = None, None


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


# ---------------------------------------------------------------------------
# Drawing helpers
# ---------------------------------------------------------------------------
def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def vertical_gradient(size, top, bottom):
    w, h = size
    base = Image.new("RGB", (1, h))
    px = base.load()
    for y in range(h):
        px[0, y] = lerp(top, bottom, y / max(1, h - 1))
    return base.resize((w, h))


def radial_glow(size, center, radius, color, max_alpha):
    """Soft radial glow as an RGBA layer."""
    w, h = size
    glow = Image.new("L", (w, h), 0)
    gpx = glow.load()
    cx, cy = center
    r2 = radius * radius
    for y in range(h):
        dy2 = (y - cy) ** 2
        for x in range(w):
            d2 = (x - cx) ** 2 + dy2
            if d2 < r2:
                t = 1 - (d2 / r2)
                gpx[x, y] = int(max_alpha * (t**1.6))
    color_layer = Image.new("RGBA", (w, h), color + (0,))
    color_layer.putalpha(glow)
    return color_layer


def rounded_mask(size, radius, ss=4):
    """Anti-aliased rounded-rectangle mask via 4x supersampling."""
    w, h = size
    big = Image.new("L", (w * ss, h * ss), 0)
    d = ImageDraw.Draw(big)
    d.rounded_rectangle([0, 0, w * ss - 1, h * ss - 1], radius=radius * ss, fill=255)
    return big.resize((w, h), Image.LANCZOS)


def measure(draw, text, fnt):
    b = draw.textbbox((0, 0), text, font=fnt)
    return b[2] - b[0], b[3] - b[1]


# ---------------------------------------------------------------------------
# Composition
# ---------------------------------------------------------------------------
@dataclass
class Layout:
    w: int
    h: int
    scale: float  # relative to the REF_W x REF_H reference


def load_screen(slide_id: str) -> Image.Image:
    path = os.path.join(RAW_DIR, slide_id + ".png")
    if not os.path.isfile(path):
        raise SystemExit(
            f"Missing capture: {path}\n"
            "Drop raw device captures in assets/store-captures/ and map them "
            "in the SLIDES list at the top of render.py."
        )
    return Image.open(path).convert("RGB")


def compose(slide, size, variant="A") -> Image.Image:
    w, h = size
    s = w / REF_W  # uniform scale from the reference design

    # --- background gradient ---
    img = vertical_gradient((w, h), BG_DEEP, BG).convert("RGBA")

    # --- ambient accent texture along the lower third ---
    # A deterministic pseudo-random bar field; reads as texture at thumbnail
    # size without competing with the device frame.
    wave = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wave)
    baseline = int(h * (0.80 if variant == "A" else 0.86))
    bar_w = max(2, int(4 * s))
    gap = max(3, int(7 * s))
    x = int(-10 * s)
    i = 0
    while x < w:
        amp = 0.5 + 0.5 * math.sin(i * 0.20) * math.sin(i * 0.057 + 1.3)
        bar_h = int((30 + amp * 190) * s)
        wd.rounded_rectangle(
            [x, baseline - bar_h // 2, x + bar_w, baseline + bar_h // 2],
            radius=bar_w // 2,
            fill=ACCENT + (26,),
        )
        x += bar_w + gap
        i += 1
    img = Image.alpha_composite(img, wave)

    # --- accent radial glow behind the device ---
    glow = radial_glow(
        (w, h),
        center=(int(w * 0.5), int(h * (0.58 if variant == "A" else 0.62))),
        radius=int(w * 0.85),
        color=ACCENT,
        max_alpha=60 if variant == "A" else 46,
    )
    img = Image.alpha_composite(img, glow)

    draw = ImageDraw.Draw(img)

    # --- caption: one big centered line, lead (primary) + accent tail ---
    lead_size = int(124 * s)
    f_lead = font(BOLD_FONT, lead_size)

    top_pad = int(250 * s)
    cx = w // 2

    lead = slide["cap_lead"]
    accent = slide["cap_accent"]
    space = " "
    lw, lh = measure(draw, lead + space, f_lead)
    aw, ah = measure(draw, accent, f_lead)
    total_w = lw + aw
    line_h = max(lh, ah)

    # small accent underline flourish above the headline
    ul_w = int(110 * s)
    ul_y = top_pad - int(60 * s)
    draw.rounded_rectangle(
        [cx - ul_w // 2, ul_y, cx + ul_w // 2, ul_y + int(9 * s)],
        radius=int(4 * s),
        fill=ACCENT + (255,),
    )

    x0 = cx - total_w / 2
    y = top_pad
    draw.text((x0, y), lead + space, font=f_lead, fill=TEXT_PRIMARY)
    draw.text((x0 + lw, y), accent, font=f_lead, fill=ACCENT)
    y += line_h + int(90 * s)

    # --- device frame with the real screen ---
    screen = load_screen(slide["id"])
    src_ratio = screen.width / screen.height

    # device width ~62% of canvas for variant A, a touch larger for B
    dev_w = int(w * (0.62 if variant == "A" else 0.66))
    dev_h = int(dev_w / src_ratio)

    dev_x = (w - dev_w) // 2
    dev_y = int(y + int(30 * s))
    max_bottom = h - int(150 * s)  # keep a bottom margin
    if dev_y + dev_h > max_bottom:
        dev_y = max_bottom - dev_h

    corner = int(70 * s)

    # drop shadow
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    pad = int(30 * s)
    sd.rounded_rectangle(
        [
            dev_x - pad,
            dev_y - pad + int(30 * s),
            dev_x + dev_w + pad,
            dev_y + dev_h + pad + int(40 * s),
        ],
        radius=corner + pad,
        fill=(0, 0, 0, 150),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(38 * s)))
    img = Image.alpha_composite(img, shadow)

    # screen scaled to device inner size
    screen_scaled = screen.resize((dev_w, dev_h), Image.LANCZOS).convert("RGBA")
    mask = rounded_mask((dev_w, dev_h), corner)
    device = Image.new("RGBA", (dev_w, dev_h), (0, 0, 0, 0))
    device.paste(screen_scaled, (0, 0), mask)

    img.paste(device, (dev_x, dev_y), device)

    # crisp border around the device
    bdraw = ImageDraw.Draw(img)
    bw = max(2, int(4 * s))
    bdraw.rounded_rectangle(
        [dev_x, dev_y, dev_x + dev_w - 1, dev_y + dev_h - 1],
        radius=corner,
        outline=BORDER + (255,),
        width=bw,
    )

    return img.convert("RGB")


def save_exact(img, path, expected):
    assert img.size == expected, f"size {img.size} != expected {expected} for {path}"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "PNG")
    print(f"  wrote {os.path.relpath(path, REPO)}  {img.size[0]}x{img.size[1]}")


def make_feature_graphic():
    w, h = PLAY_FEATURE
    img = vertical_gradient((w, h), BG_DEEP, BG).convert("RGBA")
    glow = radial_glow((w, h), (int(w * 0.72), int(h * 0.5)), int(w * 0.5), ACCENT, 70)
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)
    # accent bar strip as a texture band
    baseline = int(h * 0.5)
    x = 40
    i = 0
    while x < w - 40:
        amp = 0.5 + 0.5 * math.sin(i * 0.25) * math.sin(i * 0.06 + 1.0)
        bar_h = int(20 + amp * 150)
        col = ACCENT if 6 < i < 22 else BORDER
        d.rounded_rectangle(
            [x, baseline - bar_h // 2, x + 5, baseline + bar_h // 2],
            radius=2,
            fill=col + (200,),
        )
        x += 12
        i += 1
    # wordmark + tagline
    f_name = font(BOLD_FONT, 118)
    f_tag = font(REGULAR_FONT, 40)
    d.text((70, 150), WORDMARK, font=f_name, fill=TEXT_PRIMARY)
    d.text((74, 300), TAGLINE, font=f_tag, fill=ACCENT)
    out = os.path.join(
        REPO, "fastlane", "metadata", "android", "en-US", "images", "featureGraphic"
    )
    os.makedirs(out, exist_ok=True)
    p = os.path.join(out, "featureGraphic.png")
    img.convert("RGB").save(p, "PNG")
    print(f"  wrote {os.path.relpath(p, REPO)}  {w}x{h}")


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------
def cmd_mockups():
    out = os.path.join(HERE, "_preview")
    os.makedirs(out, exist_ok=True)
    # Preview two slides so the captions and treatment can be reviewed before
    # the full run.
    count = min(2, len(SLIDES))
    for idx in range(count):
        img = compose(SLIDES[idx], APPLE_IPHONE, variant="B")
        save_exact(img, os.path.join(out, f"preview_{idx + 1:02d}.png"), APPLE_IPHONE)


def cmd_full(variant="A"):
    ios_dir = os.path.join(REPO, "fastlane", "screenshots", "en-US")
    play_dir = os.path.join(
        REPO, "fastlane", "metadata", "android", "en-US", "images", "phoneScreenshots"
    )
    for idx, slide in enumerate(SLIDES, start=1):
        ios = compose(slide, APPLE_IPHONE, variant=variant)
        save_exact(ios, os.path.join(ios_dir, f"{idx:02d}_iphone69.png"), APPLE_IPHONE)
        play = compose(slide, PLAY_PHONE, variant=variant)
        save_exact(play, os.path.join(play_dir, f"{idx:02d}.png"), PLAY_PHONE)
    make_feature_graphic()


if __name__ == "__main__":
    BOLD_FONT, REGULAR_FONT = _resolve_fonts()
    cmd = sys.argv[1] if len(sys.argv) > 1 else "mockups"
    if cmd == "mockups":
        cmd_mockups()
    elif cmd == "full":
        cmd_full(sys.argv[2] if len(sys.argv) > 2 else "A")
    else:
        print("usage: render.py [mockups|full [A|B]]")
