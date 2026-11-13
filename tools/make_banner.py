"""Builds assets/og.png (1200x630 sharing banner). Run from site/: python tools/make_banner.py [screenshot]"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
shot_path = sys.argv[1] if len(sys.argv) > 1 else "assets/shots/nerida.jpg"

# Ocean gradient: sunlit teal at top-left to deep navy at bottom-right.
bg = Image.new("RGB", (W, H))
top, bot = (20, 120, 130), (3, 14, 30)
px = bg.load()
for y in range(H):
    for x in range(W):
        t = min(1, (y / H) * 0.75 + (x / W) * 0.35)
        px[x, y] = tuple(int(top[k] + (bot[k] - top[k]) * t) for k in range(3))

# Soft light glow behind the screenshot.
glow = Image.new("L", (W, H), 0)
ImageDraw.Draw(glow).ellipse((560, 60, 1260, 640), fill=150)
glow = glow.filter(ImageFilter.GaussianBlur(110))
bg.paste(Image.new("RGB", (W, H), (45, 212, 191)), (0, 0), glow)

# App screenshot in a window frame, bleeding off the right edge.
shot = Image.open(shot_path).convert("RGB")
fw = 720
fh = int(shot.height * fw / shot.width)
frame = Image.new("RGB", (fw, fh + 28), (10, 20, 27))
fd = ImageDraw.Draw(frame)
for i in range(3):
    fd.ellipse((14 + i * 18, 9, 24 + i * 18, 19), fill=(60, 72, 80))
frame.paste(shot.resize((fw, fh), Image.LANCZOS), (0, 28))
mask = Image.new("L", frame.size, 0)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, *frame.size), 16, fill=255)
fx, fy = 560, 130
shadow = Image.new("L", (W, H), 0)
ImageDraw.Draw(shadow).rounded_rectangle((fx + 10, fy + 30, fx + fw + 10, fy + frame.height + 40), 16, fill=170)
bg.paste((0, 0, 0), (0, 0), shadow.filter(ImageFilter.GaussianBlur(28)))
bg.paste(frame, (fx, fy), mask)
ImageDraw.Draw(bg).rounded_rectangle((fx, fy, fx + fw, fy + frame.height), 16, outline=(142, 230, 220), width=2)

# Icon, wordmark and tagline on the left.
d = ImageDraw.Draw(bg)
icon = Image.open("assets/icon.png").convert("RGBA").resize((96, 96), Image.LANCZOS)
bg.paste(icon, (64, 150), icon)
F = "C:/Windows/Fonts/"
word = ImageFont.truetype(F + "georgiai.ttf", 104)
tag = ImageFont.truetype(F + "segoeuib.ttf", 30)
small = ImageFont.truetype(F + "segoeui.ttf", 24)
d.text((60, 250), "Oceanic", font=word, fill=(234, 247, 246))
d.line((40, 372, 520, 372), fill=(234, 247, 246), width=2)
d.text((64, 400), "Your notes. Your PC.", font=tag, fill=(142, 230, 220))
d.text((64, 444), "A free, offline study workspace", font=small, fill=(200, 225, 226))
d.text((64, 476), "with a private AI. Windows, macOS, Linux.", font=small, fill=(200, 225, 226))

bg.save("assets/og.png", optimize=True)
print("wrote assets/og.png", bg.size)
