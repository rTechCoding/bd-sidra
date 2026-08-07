from PIL import Image
import numpy as np

img_path = r"C:\Users\91821\.gemini\antigravity\brain\acad4f81-100d-4105-a00c-bdb1f12b58bb\.user_uploaded\media_1786058439671.png"
out_path = r"C:\Users\91821\.gemini\antigravity\scratch\sidra-birthday-celebration\assets\transparent_cake.png"

img = Image.open(img_path).convert("RGBA")
data = np.array(img)

# R, G, B, A
r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

# The background checkerboard consists of white (255, 255, 255) and light grey (~204, 204, 204 or ~225, 225, 225)
# and pngtree watermark pixels in pure grey/light tint outside the cake object.
# Flood fill / Chroma key approach from the edges:
from collections import deque

h, w, _ = data.shape
visited = np.zeros((h, w), dtype=bool)

# Queue for BFS from border pixels
queue = deque()

# Add all border pixels to queue
for x in range(w):
    queue.append((0, x))
    queue.append((h - 1, x))
for y in range(h):
    queue.append((y, 0))
    queue.append((y, w - 1))

def is_bg(r_val, g_val, b_val):
    # Pure white or light grey checkerboard / watermark
    # Checkerboard white: > 240, 240, 240
    # Checkerboard grey: 190..235 for R=G=B
    if r_val > 235 and g_val > 235 and b_val > 235:
        return True
    if abs(int(r_val) - int(g_val)) < 12 and abs(int(g_val) - int(b_val)) < 12:
        if 180 <= r_val <= 235:
            return True
    return False

while queue:
    y, x = queue.popleft()
    if visited[y, x]:
        continue
    visited[y, x] = True
    
    r_v, g_v, b_v = r[y, x], g[y, x], b[y, x]
    if is_bg(r_v, g_v, b_v):
        data[y, x, 3] = 0  # Make transparent
        
        # Add neighbors
        for dy, dx in [(-1,0), (1,0), (0,-1), (0,1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                queue.append((ny, nx))

clean_img = Image.fromarray(data)
clean_img.save(out_path, "PNG")
print("Cleaned cake image saved to", out_path)
