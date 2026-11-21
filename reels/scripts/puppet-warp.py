"""Animate characters in a flat illustration by smooth local warps (puppet-style).

    python3 scripts/puppet-warp.py in.png out.mp4

Each "part" moves a soft, flat-topped region of the image along a keyframed
path. The displacement fields add up and every frame is resampled from the
original, so nothing tears or leaves a hole. Built for the 940x1672 counter
scene; output is scaled to 1080x1920 at 30 fps, 8 s.
"""
import subprocess
import sys

import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates

src, out = sys.argv[1:3]
img = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = img.shape
FPS, DUR = 30, 8.0
N = int(FPS * DUR)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)


def ease(t):
    t = np.clip(t, 0, 1)
    return t * t * (3 - 2 * t)


def bump(t, a, b, c, d):
    """0 before a, rises to 1 by b, holds, falls back to 0 between c and d."""
    return ease((t - a) / (b - a)) * (1 - ease((t - c) / (d - c)))


def ramp(t, a, b):
    return ease((t - a) / (b - a))


def mask(cx, cy, sx, sy, flat=True):
    r2 = ((xx - cx) / sx) ** 2 + ((yy - cy) / sy) ** 2
    return np.exp(-(r2 ** 2)) if flat else np.exp(-r2)


# parts: (mask, function t -> (dx, dy))
parts = []


def part(cx, cy, sx, sy, fn, flat=True):
    parts.append((mask(cx, cy, sx, sy, flat), fn))


TAU = 2 * np.pi

# idle breathing of the three staff members (whole torso + head)
part(185, 760, 70, 110, lambda t: (0, 3 * np.sin(TAU * 0.7 * t)))
part(505, 745, 60, 110, lambda t: (0, 3 * np.sin(TAU * 0.7 * t + 1.5)))
part(675, 740, 60, 100, lambda t: (0, 3 * np.sin(TAU * 0.7 * t + 3.0)))

# 0-2 s  CAISSE: the first customer raises his arm toward the menu,
#        the cashier taps the register screen
part(135, 900, 38, 38, lambda t: (18 * bump(t, 0.1, 0.5, 1.6, 2.0), -55 * bump(t, 0.1, 0.5, 1.6, 2.0)), flat=False)
part(60, 830, 45, 45, lambda t: (4 * bump(t, 0.1, 0.5, 1.6, 2.0), -8 * bump(t, 0.1, 0.5, 1.6, 2.0)), flat=False)
part(228, 865, 30, 30, lambda t: (-8 * bump(t, 0.5, 0.7, 1.7, 1.9), 12 * abs(np.sin(TAU * 2.5 * t)) * bump(t, 0.5, 0.7, 1.7, 1.9)), flat=False)

# 2-4 s  GRILL: the cook lifts and turns a piece of chicken with the tongs
grill = lambda t: (12 * bump(t, 2.1, 2.5, 3.0, 3.5), -38 * bump(t, 2.1, 2.5, 3.0, 3.5))
part(450, 790, 50, 30, grill, flat=False)
part(400, 782, 30, 22, lambda t: (10 * bump(t, 2.1, 2.5, 3.0, 3.5), -34 * bump(t, 2.1, 2.5, 3.0, 3.5)), flat=False)
part(470, 760, 35, 45, lambda t: (6 * bump(t, 2.1, 2.5, 3.0, 3.5), -16 * bump(t, 2.1, 2.5, 3.0, 3.5)), flat=False)

# 4-6 s  GARNITURES: the hand dips into a bin, comes back over the bowl,
#        then pushes the bowl toward the edge of the counter
def scoop(t):
    dip = bump(t, 4.0, 4.35, 4.55, 4.9)
    push = ramp(t, 5.0, 5.7)
    return (-35 * dip + 32 * push, 45 * dip + 22 * push)


part(735, 785, 34, 30, scoop, flat=False)
part(748, 800, 38, 26, lambda t: (32 * ramp(t, 5.0, 5.7), 22 * ramp(t, 5.0, 5.7)), flat=False)

# 6-8 s  THE QUEUE MOVES: the first customer steps aside, the others step up
def step(a, b, dx, dy, hop=8):
    return lambda t: (dx * ramp(t, a, b), dy * ramp(t, a, b) - hop * abs(np.sin(TAU * 1.5 * (t - a))) * (a < t < b))


part(55, 1110, 60, 170, step(6.0, 6.8, -45, 0, 5))
part(255, 1330, 85, 220, step(6.2, 7.2, -22, -40, 6))
part(455, 1400, 90, 230, step(6.4, 7.4, -18, -34, 6))
part(655, 1460, 100, 220, step(6.6, 7.6, -15, -30, 6))

ff = subprocess.Popen(
    ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
     '-vf', 'scale=1080:1920:flags=lanczos', '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', out],
    stdin=subprocess.PIPE,
)
for i in range(N):
    t = i / FPS
    dx = np.zeros((H, W), np.float32)
    dy = np.zeros((H, W), np.float32)
    for m, fn in parts:
        ox, oy = fn(t)
        if ox or oy:
            dx += m * ox
            dy += m * oy
    sx, sy = xx - dx, yy - dy  # backward mapping
    frame = np.empty_like(img)
    for c in range(3):
        frame[..., c] = map_coordinates(img[..., c], [sy, sx], order=1, mode='nearest')
    ff.stdin.write(np.clip(frame, 0, 255).astype(np.uint8).tobytes())
ff.stdin.close()
ff.wait()
print('frames', N)
