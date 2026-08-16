"""Genera el sprite pixel-art del oso mascota de OsorIA.

Oso chibi con armadura tecnológica, de frente. Dos fotogramas:
  idle  — quieto, las dos patas abajo
  wave  — con la pata derecha levantada, saludando

El sprite se dibuja con elipses y un paso automático de contorno, no a mano:
así la silueta queda redonda y el borde grueso y parejo.

Uso:
    python3 scripts/generar-sprite-oso.py            # renderiza PNG de revisión
    python3 scripts/generar-sprite-oso.py --datauri  # imprime los data URI
"""
from PIL import Image
import base64
import io
import sys

W, H = 34, 42

PALETTE = {
    ".": None,
    "o": (10, 18, 22),      # contorno
    "F": (86, 56, 30),      # pelaje sombra
    "f": (138, 90, 48),     # pelaje
    "L": (172, 118, 66),    # pelaje luz
    "m": (219, 178, 128),   # hocico
    "A": (40, 68, 78),      # armadura sombra
    "a": (107, 147, 156),   # armadura
    "H": (168, 204, 212),   # armadura luz
    "g": (63, 224, 208),    # brillo cian
    "G": (150, 255, 245),   # brillo cian intenso
    "i": (79, 216, 232),    # iris
    "k": (14, 34, 42),      # ojo oscuro
    "w": (255, 255, 255),   # brillo del ojo
    "n": (20, 20, 20),      # nariz
}


def blank():
    return [["." for _ in range(W)] for _ in range(H)]


def ellipse(g, cx, cy, rx, ry, ch, clip_to=None):
    for y in range(H):
        for x in range(W):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0:
                if clip_to is None or g[y][x] in clip_to:
                    g[y][x] = ch


def px(g, x, y, ch):
    if 0 <= x < W and 0 <= y < H:
        g[y][x] = ch


def outline(g):
    """Todo pixel pintado que toque el vacío se vuelve contorno."""
    edge = []
    for y in range(H):
        for x in range(W):
            if g[y][x] == ".":
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if not (0 <= nx < W and 0 <= ny < H) or g[ny][nx] == ".":
                    edge.append((x, y))
                    break
    for (x, y) in edge:
        g[y][x] = "o"


def build(frame="idle"):
    """Se dibuja de atrás hacia adelante: lo último tapa a lo anterior."""
    g = blank()

    # --- orejas -------------------------------------------------------------
    ellipse(g, 7, 7, 4.6, 4.6, "f")
    ellipse(g, 27, 7, 4.6, 4.6, "f")
    ellipse(g, 7, 7, 2.2, 2.2, "F")
    ellipse(g, 27, 7, 2.2, 2.2, "F")

    # --- piernas y patas (asoman por debajo del cuerpo) ---------------------
    for cx in (12, 22):
        ellipse(g, cx, 37, 3.4, 4.2, "f")
        ellipse(g, cx, 35, 3.0, 1.7, "a")     # rodillera
        ellipse(g, cx, 39, 3.8, 2.0, "L")     # pata

    # --- brazos (sobresalen del cuerpo por los lados) -----------------------
    ellipse(g, 5, 31, 3.3, 5.4, "f")          # izquierdo, siempre abajo
    ellipse(g, 5, 34, 3.1, 2.4, "L")
    ellipse(g, 5, 28, 3.3, 1.7, "a")

    if frame == "wave":
        # derecho arriba: antebrazo vertical y pata abierta saludando
        ellipse(g, 30, 24, 3.0, 5.2, "f")
        ellipse(g, 30, 18, 3.2, 3.0, "L")
        ellipse(g, 30, 27, 2.6, 1.5, "a")
    else:
        ellipse(g, 29, 31, 3.3, 5.4, "f")
        ellipse(g, 29, 34, 3.1, 2.4, "L")
        ellipse(g, 29, 28, 3.3, 1.7, "a")

    # --- cuerpo -------------------------------------------------------------
    ellipse(g, 17, 31, 9.0, 7.5, "f")
    ellipse(g, 17, 30, 6.4, 5.8, "a")         # peto
    ellipse(g, 17, 29, 4.8, 4.2, "H")
    ellipse(g, 17, 32, 3.2, 2.6, "a")
    for x in range(14, 21):
        px(g, x, 33, "g")
    px(g, 17, 26, "g")

    # hombreras
    ellipse(g, 8, 27, 3.5, 2.9, "a")
    ellipse(g, 26, 27, 3.5, 2.9, "a")
    ellipse(g, 8, 26, 2.3, 1.7, "H")
    ellipse(g, 26, 26, 2.3, 1.7, "H")

    # --- cabeza -------------------------------------------------------------
    ellipse(g, 17, 15, 11.5, 10.0, "f")

    # casco sobre la mitad superior
    for y in range(H):
        for x in range(W):
            if g[y][x] == "f" and y <= 12 and ((x - 17) / 11.5) ** 2 + ((y - 15) / 10.0) ** 2 <= 1.0:
                g[y][x] = "a"
    ellipse(g, 17, 9, 6.0, 2.8, "H", clip_to="a")
    for x in range(13, 22):
        px(g, x, 7, "g")

    # visores laterales
    for cx in (7, 27):
        ellipse(g, cx, 16, 2.0, 2.8, "a")
        px(g, cx, 16, "g")

    # --- ojos ---------------------------------------------------------------
    for cx in (12, 22):
        ellipse(g, cx, 16, 3.3, 3.7, "k")
        ellipse(g, cx, 16, 2.3, 2.7, "i")
        ellipse(g, cx, 17, 1.5, 1.5, "k")
        px(g, cx - 1, 14, "w")
        px(g, cx, 14, "w")

    # --- hocico -------------------------------------------------------------
    ellipse(g, 17, 21, 5.2, 3.4, "m")
    # nariz como rectangulo: una elipse de este tamano rasteriza como cruz
    for nx in range(16, 19):
        px(g, nx, 19, "n")
    px(g, 17, 20, "n")
    # sonrisa: dos trazos que bajan desde debajo de la nariz
    px(g, 15, 22, "o")
    px(g, 16, 23, "o")
    px(g, 17, 23, "o")
    px(g, 18, 23, "o")
    px(g, 19, 22, "o")

    outline(g)
    return ["".join(r) for r in g]


def to_image(sprite):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    p = img.load()
    for y, row in enumerate(sprite):
        for x, ch in enumerate(row):
            color = PALETTE[ch]
            if color:
                p[x, y] = (*color, 255)
    return img


def data_uri(sprite):
    buf = io.BytesIO()
    to_image(sprite).save(buf, format="PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def preview(scale=10, path="oso.png"):
    frames = [build("idle"), build("wave")]
    imgs = [to_image(f).resize((W * scale, H * scale), Image.NEAREST) for f in frames]
    gap = 24
    canvas = Image.new("RGBA", (imgs[0].width * 2 + gap, imgs[0].height), (8, 12, 14, 255))
    canvas.alpha_composite(imgs[0], (0, 0))
    canvas.alpha_composite(imgs[1], (imgs[0].width + gap, 0))
    canvas.convert("RGB").save(path)
    print(f"✅ {path} — fotogramas idle y wave, {W}x{H} px cada uno")


if __name__ == "__main__":
    if "--datauri" in sys.argv:
        for name in ("idle", "wave"):
            print(f"{name}\t{data_uri(build(name))}")
    else:
        preview()
