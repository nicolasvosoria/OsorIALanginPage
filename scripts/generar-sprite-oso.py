"""Diseño y render del sprite del oso retro de OsorIA.

El sprite se genera con formas (elipses) y un paso automático de contorno,
en vez de dibujarse a mano: así la silueta queda redonda y el borde grueso
y parejo, como en la referencia pixel-art.
"""
from PIL import Image
import sys

W, H = 32, 34

PALETTE = {
    ".": None,              # transparente
    "o": (32, 18, 12),      # contorno
    "d": (126, 78, 40),     # sombra
    "b": (176, 118, 62),    # cuerpo
    "l": (212, 156, 94),    # luz
    "c": (243, 220, 180),   # crema (hocico, panza, interior de oreja)
    "p": (26, 122, 30),     # interior de oreja, verde apagado
    "k": (24, 16, 12),      # ojo y nariz
    "w": (255, 255, 255),   # brillo del ojo
    "G": (110, 255, 90),    # dato verde
}

DATA_PIXELS = [(5, 8), (25, 6), (3, 15), (27, 17), (5, 24), (26, 25), (9, 29), (22, 29)]


def blank():
    return [["." for _ in range(W)] for _ in range(H)]


def ellipse(grid, cx, cy, rx, ry, ch, only_over=None):
    for y in range(H):
        for x in range(W):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0:
                if only_over is None or grid[y][x] in only_over:
                    grid[y][x] = ch


def rect(grid, x0, y0, x1, y1, ch):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if 0 <= x < W and 0 <= y < H:
                grid[y][x] = ch


def outline(grid):
    """Cualquier pixel pintado que toque el vacío se convierte en contorno."""
    solid = {(x, y) for y in range(H) for x in range(W) if grid[y][x] != "."}
    edge = set()
    for (x, y) in solid:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if not (0 <= nx < W and 0 <= ny < H) or grid[ny][nx] == ".":
                edge.add((x, y))
                break
    for (x, y) in edge:
        grid[y][x] = "o"


def build():
    g = blank()

    # --- orejas (van primero: la cabeza las recorta por dentro) -------------
    ellipse(g, 9, 7, 4.2, 4.2, "b")
    ellipse(g, 23, 7, 4.2, 4.2, "b")
    ellipse(g, 9, 7, 2.0, 2.0, "p")
    ellipse(g, 23, 7, 2.0, 2.0, "p")

    # --- cuerpo -------------------------------------------------------------
    ellipse(g, 16, 25, 10.0, 8.0, "b")
    # patas
    ellipse(g, 10, 31, 3.6, 2.8, "b")
    ellipse(g, 22, 31, 3.6, 2.8, "b")
    # brazos
    ellipse(g, 6, 24, 2.8, 4.0, "d")
    ellipse(g, 26, 24, 2.8, 4.0, "d")
    # panza
    ellipse(g, 16, 26, 5.6, 5.2, "c")

    # --- cabeza (encima del cuerpo) ----------------------------------------
    ellipse(g, 16, 13, 11.0, 9.5, "b")
    # luz en la frente
    ellipse(g, 10, 9, 3.2, 2.4, "l")

    # hocico
    ellipse(g, 12, 18, 5.4, 3.8, "c")
    # nariz
    ellipse(g, 12, 16, 1.8, 1.3, "k")
    # sonrisa
    g[19][10] = "o"
    g[20][11] = "o"
    g[20][12] = "o"
    g[20][13] = "o"
    g[19][14] = "o"

    # ojo grande con brillo, a la derecha (vista de 3/4)
    ellipse(g, 22, 14, 3.2, 3.8, "k")
    rect(g, 22, 12, 23, 13, "w")

    outline(g)
    return ["".join(r) for r in g]


def validate(sprite):
    problems = []
    for i, row in enumerate(sprite):
        if len(row) != W:
            problems.append(f"  fila {i}: {len(row)} px (esperado {W})")
        for ch in row:
            if ch not in PALETTE:
                problems.append(f"  fila {i}: caracter desconocido {ch!r}")
    if problems:
        print("❌ sprite invalido:\n" + "\n".join(problems))
        sys.exit(1)
    print(f"✅ sprite valido: {W}x{len(sprite)} px")


def render(sprite, scale=12, path="oso.png"):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = img.load()
    for y, row in enumerate(sprite):
        for x, ch in enumerate(row):
            color = PALETTE[ch]
            if color:
                px[x, y] = (*color, 255)
    for (x, y) in DATA_PIXELS:
        if 0 <= x < W and 0 <= y < H and sprite[y][x] in "bdl":
            px[x, y] = (*PALETTE["G"], 255)
    big = img.resize((W * scale, H * scale), Image.NEAREST)
    bg = Image.new("RGBA", big.size, (0, 0, 0, 255))
    bg.alpha_composite(big)
    bg.save(path)
    print(f"✅ render: {path} ({big.width}x{big.height})")


def dump(sprite, path="sprite.txt"):
    with open(path, "w") as fh:
        fh.write("\n".join(sprite))
    print(f"✅ filas guardadas en {path}")


if __name__ == "__main__":
    s = build()
    validate(s)
    render(s)
    dump(s)
