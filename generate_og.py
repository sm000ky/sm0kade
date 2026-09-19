import math
from PIL import Image, ImageDraw, ImageFont

# 1200x630 standard Open Graph Banner
width, height = 1200, 630
img = Image.new("RGBA", (width, height), (7, 8, 15, 255))
draw = ImageDraw.Draw(img)

# 1. Background Grid & Scanlines
grid_color = (0, 240, 255, 18)
for x in range(0, width, 40):
    draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
for y in range(0, height, 40):
    draw.line([(0, y), (width, y)], fill=grid_color, width=1)

# Subtle CRT scanlines
for y in range(0, height, 4):
    draw.line([(0, y), (width, y)], fill=(0, 0, 0, 60), width=1)

# 2. Outer Cybernetic Frame
margin = 25
draw.rectangle(
    [(margin, margin), (width - margin, height - margin)],
    outline=(0, 240, 255, 220),
    width=3
)
draw.rectangle(
    [(margin + 6, margin + 6), (width - margin - 6, height - margin - 6)],
    outline=(255, 0, 127, 180),
    width=1
)

# Corner Accent Blocks
cw = 24
draw.rectangle([(margin - 2, margin - 2), (margin + cw, margin + cw)], fill=(0, 240, 255, 255))
draw.rectangle([(width - margin - cw, margin - 2), (width - margin + 2, margin + cw)], fill=(0, 240, 255, 255))
draw.rectangle([(margin - 2, height - margin - cw), (margin + cw, height - margin + 2)], fill=(255, 0, 127, 255))
draw.rectangle([(width - margin - cw, height - margin - cw), (width - margin + 2, height - margin + 2)], fill=(255, 0, 127, 255))

# Try loading fonts or fallback to default
try:
    font_hero = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
    font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
    font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 22)
    font_tag = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 18)
    font_badge = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
except Exception:
    font_hero = ImageFont.load_default()
    font_title = font_hero
    font_sub = font_hero
    font_tag = font_hero
    font_badge = font_hero

# 3. Marquee Header
draw.rectangle([(margin + 20, margin + 20), (margin + 260, margin + 54)], fill=(255, 0, 127, 40), outline=(255, 0, 127, 180), width=1)
draw.text((margin + 32, margin + 26), "1-DAY-1-PROJECT // DAY 5", fill=(255, 0, 127, 255), font=font_badge)

draw.rectangle([(width - margin - 270, margin + 20), (width - margin - 20, margin + 54)], fill=(0, 240, 255, 30), outline=(0, 240, 255, 180), width=1)
draw.text((width - margin - 255, margin + 26), "10-IN-1 RETRO ARCADE", fill=(0, 240, 255, 255), font=font_badge)

# 4. Hero Title
draw.text((margin + 40, 120), "SM0KADE", fill=(0, 240, 255, 255), font=font_hero)
draw.text((margin + 420, 142), "v1.0", fill=(255, 0, 127, 255), font=font_title)

# Tagline
draw.text(
    (margin + 42, 215),
    "Multi-Cartridge Living Retro Arcade & Interactive Portfolio",
    fill=(255, 255, 255, 240),
    font=font_title
)

# 5. Feature Matrix Pillars
draw.text(
    (margin + 42, 280),
    "Crafted by sm000ky × Zero Two  •  Strelizia Code 002 Cockpit",
    fill=(255, 122, 163, 255),
    font=font_sub
)

# 4 Feature Pills
features = [
    ("10 Playable Games", "#00f0ff"),
    ("8 Morphing Shells", "#ff007f"),
    ("Web Audio Synth", "#ffea00"),
    ("Interactive Dossier", "#00ff66")
]

px = margin + 42
for text, color in features:
    # parse hex
    r = int(color[1:3], 16)
    g = int(color[3:5], 16)
    b = int(color[5:7], 16)
    draw.rectangle([(px, 340), (px + 240, 390)], fill=(r, g, b, 25), outline=(r, g, b, 180), width=1)
    draw.text((px + 20, 354), f"★ {text}", fill=(r, g, b, 255), font=font_sub)
    px += 265

# 6. Center Stage Pixel Mockup Art (Pac-man + Ghost + Invader + Tetris)
# Pac-man
draw.pieslice([(margin + 50, 430), (margin + 150, 530)], start=35, end=325, fill=(255, 234, 0, 255))
# Dots
for dx in range(180, 420, 50):
    draw.ellipse([(margin + dx, 470), (margin + dx + 16, 486)], fill=(255, 234, 0, 220))
# Ghost (Blinky)
gx = margin + 460
gy = 440
draw.ellipse([(gx, gy), (gx + 70, gy + 70)], fill=(255, 0, 85, 255))
draw.rectangle([(gx, gy + 35), (gx + 70, gy + 80)], fill=(255, 0, 85, 255))
# Ghost eyes
draw.ellipse([(gx + 14, gy + 20), (gx + 30, gy + 36)], fill=(255, 255, 255, 255))
draw.ellipse([(gx + 40, gy + 20), (gx + 56, gy + 36)], fill=(255, 255, 255, 255))
draw.ellipse([(gx + 16, gy + 24), (gx + 24, gy + 32)], fill=(0, 0, 180, 255))
draw.ellipse([(gx + 42, gy + 24), (gx + 50, gy + 32)], fill=(0, 0, 180, 255))

# 7. Footer Live Target
draw.rectangle([(margin + 20, height - margin - 55), (width - margin - 20, height - margin - 15)], fill=(12, 16, 32, 220), outline=(0, 240, 255, 100), width=1)
draw.text((margin + 35, height - margin - 44), "PLAY LIVE INSTANTLY AT: https://sm0kade.vercel.app", fill=(0, 240, 255, 255), font=font_sub)
draw.text((width - margin - 320, height - margin - 42), "NO INSTALL • ZERO ASSET BLOAT", fill=(160, 165, 185, 255), font=font_tag)

# Save image
img.save("/root/sm0kade/public/og-preview.png", "PNG")
print("Banner successfully generated: /root/sm0kade/public/og-preview.png")
