from PIL import Image, ImageDraw, ImageFont

width, height = 1200, 630
img = Image.new("RGBA", (width, height), (9, 10, 16, 255))
draw = ImageDraw.Draw(img)

# Radial gradient glow in the center
center_x, center_y = width // 2, height // 2
for r in range(400, 0, -8):
    alpha = int(22 * (1 - r / 400))
    draw.ellipse(
        [(center_x - r, center_y - r * 0.7), (center_x + r, center_y + r * 0.7)],
        fill=(0, 240, 255, alpha)
    )

# Subtle outer border
draw.rectangle(
    [(30, 30), (width - 30, height - 30)],
    outline=(35, 40, 65, 255),
    width=2
)

# Inner corner neon brackets
bracket_len = 30
# Top-Left
draw.line([(30, 30), (30 + bracket_len, 30)], fill=(0, 240, 255, 255), width=3)
draw.line([(30, 30), (30, 30 + bracket_len)], fill=(0, 240, 255, 255), width=3)
# Top-Right
draw.line([(width - 30, 30), (width - 30 - bracket_len, 30)], fill=(0, 240, 255, 255), width=3)
draw.line([(width - 30, 30), (width - 30, 30 + bracket_len)], fill=(0, 240, 255, 255), width=3)
# Bottom-Left
draw.line([(30, height - 30), (30 + bracket_len, height - 30)], fill=(255, 0, 127, 255), width=3)
draw.line([(30, height - 30), (30, height - 30 - bracket_len)], fill=(255, 0, 127, 255), width=3)
# Bottom-Right
draw.line([(width - 30, height - 30), (width - 30 - bracket_len, height - 30)], fill=(255, 0, 127, 255), width=3)
draw.line([(width - 30, height - 30), (width - 30, height - 30 - bracket_len)], fill=(255, 0, 127, 255), width=3)

# Fonts
font_title = ImageFont.truetype("/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Bold.ttf", 96)
font_sub = ImageFont.truetype("/usr/share/fonts/truetype/roboto/unhinted/RobotoTTF/Roboto-Bold.ttf", 32)
font_tag = ImageFont.truetype("/usr/share/fonts/truetype/freefont/FreeMonoBold.ttf", 20)
font_credit = ImageFont.truetype("/usr/share/fonts/truetype/freefont/FreeMonoBold.ttf", 22)

# 1. Top Badge: [ 1-DAY-1-PROJECT // DAY 5 ]
badge_text = "1-DAY-1-PROJECT // DAY 5"
draw.text((center_x, 120), badge_text, fill=(0, 240, 255, 255), font=font_tag, anchor="mm")

# 2. Hero Title: SM0KADE
title_text = "SM0KADE"
# Subtle text glow/shadow
draw.text((center_x + 3, 233), title_text, fill=(0, 240, 255, 120), font=font_title, anchor="mm")
draw.text((center_x, 230), title_text, fill=(255, 255, 255, 255), font=font_title, anchor="mm")

# 3. Subtitle: RETRO ARCADE & SOFTWARE PORTFOLIO
sub_text = "RETRO ARCADE & LIVING PORTFOLIO"
draw.text((center_x, 325), sub_text, fill=(200, 210, 235, 255), font=font_sub, anchor="mm")

# 4. Attribution: Crafted by sm000ky × Zero Two
credit_text = "Crafted by sm000ky × Zero Two"
draw.text((center_x, 395), credit_text, fill=(255, 122, 163, 255), font=font_credit, anchor="mm")

# Divider line
draw.line([(center_x - 140, 445), (center_x + 140, 445)], fill=(45, 52, 80, 255), width=2)

# 5. Bottom Link: sm0kade.vercel.app
link_text = "sm0kade.vercel.app"
draw.text((center_x, 490), link_text, fill=(0, 240, 255, 220), font=font_tag, anchor="mm")

img.save("/root/sm0kade/public/og-preview.png", "PNG")
print("Clean banner successfully created at /root/sm0kade/public/og-preview.png")
