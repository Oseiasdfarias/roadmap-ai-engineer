#!/usr/bin/env python3
"""Ilustrações do Roadmap AI Engineer, desenhadas por código.

Técnica: o traço não é `stroke` de SVG, é uma forma preenchida cuja espessura varia ao longo do
caminho, como pena com tinta (afina nas pontas e engrossa conforme a direção). Por baixo, manchas
de cor suaves e levemente deslocadas, como aguada. Paleta: tinta grafite e as cores dos níveis.

Uso, de dentro desta pasta (precisa do Google Chrome e da IBM Plex instalada no sistema):
    python3 gerar_ilustracoes.py          # gera os PDFs vetoriais usados pelo LaTeX
    python3 gerar_ilustracoes.py --png    # também salva PNGs em ./previa para revisar

Determinístico: os tremores vêm de sementes fixas, então o desenho sai igual a cada execução.
"""
from __future__ import annotations

import math
import random
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
CHROME = shutil.which("google-chrome") or shutil.which("chromium") or "google-chrome"

# --- Paleta: tinta sobre papel, um único acento em azul-aço (usado com avareza) ---
TINTA = "#263241"          # traço principal
TINTA_FINA = "#8C98A8"     # detalhes, linhas de texto, tracejados
BRANCO = "#FFFFFF"
ACENTO = "#4A78A8"         # acento único
ACENTO_ESC = "#1F3B5C"     # rótulos
AGUADA = "#EEF2F6"         # papel frio
AGUADA_2 = "#E4EAF1"       # papel mais fundo (sombra de folha)
AGUADA_ACENTO = "#DDE7F2"  # acento diluído
AGUADA_FORTE = "#C9D8EA"   # destaque pontual
# Os nomes antigos (um por nível) apontam todos para a mesma paleta: sem várias cores.
N1 = N2 = N3 = N4 = ACENTO
A1 = A3 = AGUADA
A2 = A4 = AGUADA_ACENTO
B1 = B2 = B3 = B4 = AGUADA_FORTE
CINZA_AG = AGUADA_2
GUIA = "#E2E6EC"

PENA_ANGULO = math.radians(38)


# =============================================================================
# Primitivas
# =============================================================================
def _semente(*vals) -> int:
    s = 7
    for v in vals:
        s = (s * 1000003 + int(round(float(v) * 100))) & 0xFFFFFFFF
    return s


def _suave(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def _f(v: float) -> str:
    return f"{v:.1f}"


def _densificar(pts, passo: float = 2.5):
    """Catmull-Rom pelos pontos de controle, amostrado a cada ~`passo` unidades."""
    pts = [tuple(p) for p in pts]
    if len(pts) == 2:
        (x0, y0), (x1, y1) = pts
        pts = [pts[0], ((x0 + x1) / 2, (y0 + y1) / 2), pts[1]]
    P = [pts[0]] + pts + [pts[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        n = max(3, int(math.dist(p1, p2) / passo))
        for s in range(n):
            t = s / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(
                0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2
                       + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3) for k in (0, 1)))
    out.append(pts[-1])
    return out


def traco(pts, esp: float = 3.0, cor: str = TINTA, inicio: float = 0.14, fim: float = 0.24,
          minimo: float = 0.22, tremor: float = 0.10, pena: float = 0.38, jitter: float = 0.5,
          opac: float = 1.0) -> str:
    """Um traço de pena: polígono com espessura variável ao longo do caminho."""
    rng = random.Random(_semente(*[c for p in pts for c in p], esp))
    pts = [(x + rng.uniform(-jitter, jitter), y + rng.uniform(-jitter, jitter)) for x, y in pts]
    d = _densificar(pts)
    comp = [0.0]
    for a, b in zip(d, d[1:]):
        comp.append(comp[-1] + math.dist(a, b))
    L = comp[-1] or 1.0
    f1, f2 = max(1.0, L / 90), max(1.0, L / 38)
    ph1, ph2 = rng.random(), rng.random()
    norm = 1 - 0.36 * pena
    esq, dire = [], []
    for i, p in enumerate(d):
        t = comp[i] / L
        a, b = d[max(i - 1, 0)], d[min(i + 1, len(d) - 1)]
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        r0 = t / inicio if inicio > 0 else 1.0
        r1 = (1 - t) / fim if fim > 0 else 1.0
        larg = esp * (minimo + (1 - minimo) * _suave(min(r0, r1, 1.0)))
        larg *= 1 + tremor * (0.6 * math.sin(2 * math.pi * (f1 * t + ph1)) + 0.4 * math.sin(2 * math.pi * (f2 * t + ph2)))
        larg *= ((1 - pena) + pena * abs(math.sin(ang - PENA_ANGULO))) / norm
        nx, ny, h = -math.sin(ang), math.cos(ang), larg / 2
        esq.append((p[0] + nx * h, p[1] + ny * h))
        dire.append((p[0] - nx * h, p[1] - ny * h))
    contorno = esq + dire[::-1]
    caminho = "M" + " L".join(f"{_f(x)} {_f(y)}" for x, y in contorno) + "Z"
    op = f' fill-opacity="{opac}"' if opac < 1 else ""
    return f'<path d="{caminho}" fill="{cor}"{op}/>'


def linha(a, b, esp=2.6, cor=TINTA, curva=0.0, **kw) -> str:
    rng = random.Random(_semente(*a, *b))
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
    L = math.dist(a, b) or 1
    nx, ny = -(b[1] - a[1]) / L, (b[0] - a[0]) / L
    c = curva + rng.uniform(-0.7, 0.7)
    return traco([a, (mx + nx * c, my + ny * c), b], esp, cor, **kw)


def tracejado(pts, esp=1.8, cor=TINTA_FINA, risco=11.0, vao=8.0) -> str:
    d = _densificar(pts, 1.5)
    partes, atual, andado, desenhando = [], [d[0]], 0.0, True
    for a, b in zip(d, d[1:]):
        andado += math.dist(a, b)
        atual.append(b)
        if desenhando and andado >= risco:
            partes.append(atual)
            atual, andado, desenhando = [b], 0.0, False
        elif not desenhando and andado >= vao:
            atual, andado, desenhando = [b], 0.0, True
    if desenhando and len(atual) > 2:
        partes.append(atual)
    out = []
    for p in partes:
        sub = p[:: max(1, len(p) // 4)] + [p[-1]] if len(p) > 4 else p
        if len(sub) >= 2 and math.dist(sub[0], sub[-1]) > 2:
            out.append(traco(sub, esp, cor, inicio=0.3, fim=0.3, minimo=0.4, jitter=0.2, tremor=0.05))
    return "".join(out)


def seta(pts, esp=2.4, cor=TINTA, cabeca=13.0, tracejada=False) -> str:
    corpo = tracejado(pts, esp, cor) if tracejada else traco(pts, esp, cor, inicio=0.12, fim=0.05, minimo=0.35)
    d = _densificar(pts)
    tip, ante = d[-1], d[max(0, len(d) - 5)]
    ang = math.atan2(tip[1] - ante[1], tip[0] - ante[0])
    pontas = []
    for lado in (-1, 1):
        a = ang + math.pi - lado * math.radians(28)
        base = (tip[0] + cabeca * math.cos(a), tip[1] + cabeca * math.sin(a))
        pontas.append(traco([base, tip], esp * 0.95, cor, inicio=0.35, fim=0.08, minimo=0.35, jitter=0.2))
    return corpo + "".join(pontas)


def arco(cx, cy, rx, ry, a0, a1, esp=2.4, cor=TINTA, **kw) -> str:
    """Arco de elipse entre os ângulos a0 e a1 (graus; y para baixo)."""
    n = max(8, int(abs(a1 - a0) / 8))
    pts = [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
            cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]
    kw.setdefault("inicio", 0.08)
    kw.setdefault("fim", 0.1)
    kw.setdefault("minimo", 0.4)
    return traco(pts, esp, cor, **kw)


def circulo(cx, cy, r, esp=2.6, cor=TINTA, voltas=1.07, **kw) -> str:
    rng = random.Random(_semente(cx, cy, r))
    th0 = rng.uniform(0, 2 * math.pi)
    n = max(10, int(r * voltas / 6))
    pts = []
    for i in range(n + 1):
        th = th0 + 2 * math.pi * voltas * i / n
        rr = r * (1 + rng.uniform(-0.012, 0.012) + 0.02 * (i / n))
        pts.append((cx + rr * math.cos(th), cy + rr * math.sin(th)))
    kw.setdefault("inicio", 0.06)
    kw.setdefault("fim", 0.10)
    return traco(pts, esp, cor, **kw)


def disco(cx, cy, r, cor) -> str:
    return f'<circle cx="{_f(cx)}" cy="{_f(cy)}" r="{_f(r)}" fill="{cor}"/>'


def mancha(cx, cy, rx, ry, cor=A1, irreg=0.06, opac=1.0) -> str:
    """Aguada: mancha orgânica, sem contorno."""
    rng = random.Random(_semente(cx, cy, rx, ry))
    fases = [(k, rng.uniform(0, 2 * math.pi), rng.uniform(0.4, 1.0)) for k in (2, 3, 5)]
    pts = []
    for i in range(120):
        th = 2 * math.pi * i / 120
        r = 1 + irreg * sum(a * math.sin(k * th + ph) for k, ph, a in fases) / 1.7
        pts.append((cx + rx * r * math.cos(th), cy + ry * r * math.sin(th)))
    op = f' fill-opacity="{opac}"' if opac < 1 else ""
    return f'<path d="M{" L".join(f"{_f(x)} {_f(y)}" for x, y in pts)}Z" fill="{cor}"{op}/>'


def mancha_ret(x, y, w, h, cor=CINZA_AG, expo=7.0, irreg=1.6) -> str:
    """Aguada retangular de cantos moles."""
    rng = random.Random(_semente(x, y, w, h))
    cx, cy, a, b = x + w / 2, y + h / 2, w / 2, h / 2
    ph = [rng.uniform(0, 6.3) for _ in range(3)]
    pts = []
    for i in range(160):
        th = 2 * math.pi * i / 160
        c, s = math.cos(th), math.sin(th)
        px = a * math.copysign(abs(c) ** (2 / expo), c)
        py = b * math.copysign(abs(s) ** (2 / expo), s)
        dr = irreg * (math.sin(3 * th + ph[0]) + 0.6 * math.sin(7 * th + ph[1]) + 0.3 * math.sin(13 * th + ph[2]))
        L = math.hypot(px, py) or 1
        pts.append((cx + px + px / L * dr, cy + py + py / L * dr))
    return f'<path d="M{" L".join(f"{_f(px)} {_f(py)}" for px, py in pts)}Z" fill="{cor}"/>'


def ret(x, y, w, h, esp=2.4, cor=TINTA, sobra=3.0, **kw) -> str:
    rng = random.Random(_semente(x, y, w, h))
    s = lambda: rng.uniform(0.8, sobra)  # noqa: E731
    kw.setdefault("inicio", 0.08)
    kw.setdefault("fim", 0.12)
    kw.setdefault("minimo", 0.45)
    return "".join(linha(a, b, esp, cor, **kw) for a, b in [
        ((x - s(), y), (x + w + s(), y)), ((x + w, y - s()), (x + w, y + h + s())),
        ((x + w + s(), y + h), (x - s(), y + h)), ((x, y + h + s()), (x, y - s()))])


def poligono(pts, esp=2.4, cor=TINTA, fechado=True, sobra=2.0, preenche=None) -> str:
    rng = random.Random(_semente(*[c for p in pts for c in p]))
    lados = list(zip(pts, pts[1:] + pts[:1])) if fechado else list(zip(pts, pts[1:]))
    out = []
    if preenche:
        out.append(f'<path d="M{" L".join(f"{_f(x)} {_f(y)}" for x, y in pts)}Z" fill="{preenche}"/>')
    for a, b in lados:
        L = math.dist(a, b) or 1
        ux, uy = (b[0] - a[0]) / L, (b[1] - a[1]) / L
        s0, s1 = rng.uniform(0.3, sobra), rng.uniform(0.3, sobra)
        out.append(linha((a[0] - ux * s0, a[1] - uy * s0), (b[0] + ux * s1, b[1] + uy * s1), esp, cor,
                         inicio=0.08, fim=0.12, minimo=0.45))
    return "".join(out)


def ret_arred(x, y, w, h, r=12, esp=2.4, cor=TINTA, preenche=None) -> str:
    pts = []
    cantos = [(x + w - r, y + r, -90), (x + w - r, y + h - r, 0), (x + r, y + h - r, 90), (x + r, y + r, 180)]
    for cx, cy, a0 in cantos:
        for k in range(4):
            a = math.radians(a0 + 90 * k / 3)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    fecho = min(26.0, max(2.0, w - 2 * r - 6))
    pts = [(x + r + 2, y)] + pts + [(x + r + 2, y), (x + r + 2 + fecho, y)]
    fundo = ""
    if preenche:
        fundo = f'<rect x="{_f(x)}" y="{_f(y)}" width="{_f(w)}" height="{_f(h)}" rx="{r}" fill="{preenche}"/>'
    return fundo + traco(pts, esp, cor, inicio=0.04, fim=0.06, minimo=0.3)


def texto(x, y, s, tam=22, cor=TINTA, anc="middle", peso=400, mono=False, espaco=0.0,
          italico=False, versalete=False) -> str:
    fam = "'Latin Modern Mono', 'DejaVu Sans Mono', monospace" if mono else "'EB Garamond 12', 'EB Garamond', serif"
    ls = f' letter-spacing="{espaco}"' if espaco else ""
    it = ' font-style="italic"' if italico else ""
    cl = ' class="sc"' if versalete else ""
    return (f'<text x="{_f(x)}" y="{_f(y)}" font-size="{tam}" fill="{cor}" text-anchor="{anc}" '
            f'font-weight="{peso}" font-family="{fam}"{ls}{it}{cl}>{s}</text>')


def rotulo(x, y, s, tam=17, cor=ACENTO_ESC) -> str:
    """Rótulo em versalete espaçado, como nos títulos de caixa."""
    return texto(x, y, s, tam, cor, versalete=True, espaco=1.8)


def estrela(cx, cy, r, cor=N1) -> str:
    kw = dict(inicio=0.5, fim=0.5, minimo=0.05, pena=0.0, jitter=0.1)
    return (traco([(cx, cy - r), (cx, cy + r)], r * 0.32, cor, **kw)
            + traco([(cx - r * 0.75, cy), (cx + r * 0.75, cy)], r * 0.28, cor, **kw))


def chao(x0, x1, y) -> str:
    return (linha((x0, y), (x1, y - 1), 2.2, TINTA, curva=-2, inicio=0.3, fim=0.3, minimo=0.08)
            + linha((x0 + (x1 - x0) * 0.25, y + 12), (x0 + (x1 - x0) * 0.75, y + 11), 1.4, TINTA_FINA,
                    inicio=0.3, fim=0.3, minimo=0.1))


def check(cx, cy, s, cor=N2, esp=3.0) -> str:
    return traco([(cx - s * 0.5, cy), (cx - s * 0.12, cy + s * 0.38), (cx + s * 0.55, cy - s * 0.45)],
                 esp, cor, inicio=0.15, fim=0.2, minimo=0.3)


def disco_numero(cx, cy, n, cor=N1, ag=A1, r=21) -> str:
    return (mancha(cx, cy, r, r, ag, irreg=0.04) + circulo(cx, cy, r, 1.9, cor)
            + texto(cx, cy + 7, n, 21, ACENTO_ESC))


# =============================================================================
# Objetos (ícones desenhados)
# =============================================================================
def terminal(x, y, w, h, acc=N1, ag=A1, linhas=3) -> str:
    rng = random.Random(_semente(x, y, w, h))
    out = [mancha(x + w / 2 + 10, y + h / 2 + 12, w * 0.6, h * 0.62, ag)]
    out.append(ret_arred(x, y, w, h, r=10, preenche=BRANCO))
    by = y + h * 0.2
    out.append(linha((x + 2, by), (x + w - 2, by), 1.8))
    for k, c in enumerate((TINTA_FINA, TINTA_FINA, TINTA_FINA)):
        out.append(disco(x + 16 + k * 14, y + h * 0.1, 4.2, c))
    py = y + h * 0.42
    out.append(poligono([(x + 18, py - 9), (x + 30, py), (x + 18, py + 9)], 2.6, acc, fechado=False))
    out.append(linha((x + 40, py + 8), (x + 40 + w * 0.22, py + 8), 2.6, acc))
    for i in range(linhas):
        ly = y + h * (0.62 + 0.13 * i)
        if ly > y + h - 10:
            break
        out.append(linha((x + 18, ly), (x + 18 + w * rng.uniform(0.35, 0.65), ly), 1.6, TINTA_FINA,
                         inicio=0.2, fim=0.2))
    return "".join(out)


def navegador(x, y, w, h, acc=N3, ag=A3) -> str:
    out = [mancha(x + w / 2 + 10, y + h / 2 + 12, w * 0.6, h * 0.62, ag)]
    out.append(ret_arred(x, y, w, h, r=10, preenche=BRANCO))
    by = y + h * 0.2
    out.append(linha((x + 2, by), (x + w - 2, by), 1.8))
    for k in range(3):
        out.append(disco(x + 15 + k * 12, y + h * 0.1, 3.5, TINTA_FINA))
    out.append(ret_arred(x + 58, y + h * 0.05, w - 72, h * 0.1, r=6, esp=1.4, cor=TINTA_FINA))
    hx, hy, hw, hh = x + 16, by + 14, w - 32, h * 0.3
    out.append(mancha_ret(hx, hy, hw, hh, ag, irreg=0.8))
    out.append(ret(hx, hy, hw, hh, 1.6, sobra=1.4))
    for i in range(2):
        ly = hy + hh + 18 + i * 14
        out.append(linha((x + 16, ly), (x + w * 0.55, ly), 1.6, TINTA_FINA, inicio=0.2, fim=0.2))
    bx, bw, bh = x + w - 16 - w * 0.28, w * 0.28, 22
    out.append(f'<rect x="{_f(bx)}" y="{_f(hy + hh + 12)}" width="{_f(bw)}" height="{bh}" rx="8" fill="{acc}"/>')
    return "".join(out)


def banco(cx, cy, w, h, acc=N1, ag=A1) -> str:
    rx, ry = w / 2, w * 0.15
    top, bot = cy - h / 2, cy + h / 2
    out = [mancha(cx + 8, cy + 10, w * 0.62, h * 0.6, ag)]
    out.append(f'<path d="M{_f(cx - rx)} {_f(top)} L{_f(cx - rx)} {_f(bot)} A{_f(rx)} {_f(ry)} 0 0 0 '
               f'{_f(cx + rx)} {_f(bot)} L{_f(cx + rx)} {_f(top)}Z" fill="{BRANCO}"/>')
    out.append(f'<ellipse cx="{_f(cx)}" cy="{_f(top)}" rx="{_f(rx)}" ry="{_f(ry)}" fill="{ag}"/>')
    out.append(arco(cx, top, rx, ry, 0, 360, 2.4))
    for yy in (top + h / 3, top + 2 * h / 3):
        out.append(arco(cx, yy, rx, ry, 0, 180, 1.8, cor=TINTA_FINA if yy < bot - 1 else TINTA))
    out.append(arco(cx, bot, rx, ry, 0, 180, 2.4))
    out.append(linha((cx - rx, top), (cx - rx, bot), 2.4))
    out.append(linha((cx + rx, top), (cx + rx, bot), 2.4))
    out.append(disco(cx + rx * 0.55, top + h / 3 + ry * 0.4, 4, acc))
    return "".join(out)


def nuvem(cx, cy, s, ag=A4, esp=2.6) -> str:
    circs = [(cx - s * 0.3, cy + s * 0.04, s * 0.2), (cx - s * 0.02, cy - s * 0.1, s * 0.29),
             (cx + s * 0.3, cy + s * 0.02, s * 0.21)]
    base = cy + s * 0.22
    o = (cx, cy + s * 0.05)
    pts = []
    for i in range(180):
        th = 2 * math.pi * i / 180
        dx, dy = math.cos(th), math.sin(th)
        best = 0.0
        for ox, oy, r in circs:
            fx, fy = o[0] - ox, o[1] - oy
            b = fx * dx + fy * dy
            c = fx * fx + fy * fy - r * r
            disc = b * b - c
            if disc >= 0:
                best = max(best, -b + math.sqrt(disc))
        if dy > 0.01:
            best = min(best if best > 0 else 1e9, (base - o[1]) / dy)
        best = max(best, 0.0)
        if dy > 0.01 and best < 1e-6:
            best = (base - o[1]) / dy
        pts.append((o[0] + best * dx, o[1] + best * dy))
    # base reta: garante que a parte de baixo vá até as laterais
    caminho = "M" + " L".join(f"{_f(x)} {_f(y)}" for x, y in pts) + "Z"
    out = [mancha(cx + 8, cy + 8, s * 0.6, s * 0.36, ag)]
    out.append(f'<path d="{caminho}" fill="{BRANCO}"/>')
    out.append(traco(pts + pts[:4], esp, TINTA, inicio=0.03, fim=0.04, minimo=0.3))
    return "".join(out)


def conteiner(x, y, w, h, acc=N4, ag=A4) -> str:
    out = [mancha_ret(x + 5, y + 5, w, h, ag, irreg=0.8)]
    out.append(ret(x, y, w, h, 2.3, sobra=1.8))
    n = 6
    for i in range(1, n):
        xx = x + w * i / n
        out.append(linha((xx, y + 6), (xx, y + h - 6), 1.5, TINTA_FINA, inicio=0.2, fim=0.2))
    out.append(disco(x + w - 8, y + h / 2, 3, acc))
    return "".join(out)


def engrenagem(cx, cy, r, ag=A3, esp=2.3, dentes=8) -> str:
    pts = []
    for i in range(dentes):
        a0 = 2 * math.pi * i / dentes
        for da, rr in ((-0.16, r * 0.78), (-0.1, r), (0.1, r), (0.16, r * 0.78)):
            pts.append((cx + rr * math.cos(a0 + da * 2 * math.pi / dentes * 2.2),
                        cy + rr * math.sin(a0 + da * 2 * math.pi / dentes * 2.2)))
    out = [mancha(cx + 4, cy + 4, r * 0.85, r * 0.85, ag)]
    out.append(poligono(pts, esp, sobra=0.6))
    out.append(circulo(cx, cy, r * 0.32, esp * 0.9))
    return "".join(out)


def rede_neural(cx, cy, s, acc=N2, ag=A2) -> str:
    camadas = [3, 4, 2]
    xs = [cx - s * 0.42, cx, cx + s * 0.42]
    nos = []
    for k, n in enumerate(camadas):
        esp_v = s * 0.27
        y0 = cy - esp_v * (n - 1) / 2
        nos.append([(xs[k], y0 + j * esp_v) for j in range(n)])
    out = [mancha(cx + 6, cy + 6, s * 0.62, s * 0.58, ag)]
    for a_l, b_l in zip(nos, nos[1:]):
        for a in a_l:
            for b in b_l:
                out.append(linha(a, b, 1.2, TINTA_FINA, inicio=0.2, fim=0.2, minimo=0.5))
    r = s * 0.075
    for k, cam in enumerate(nos):
        for j, (x, y) in enumerate(cam):
            out.append(disco(x, y, r, acc if (k + j) % 3 == 1 else BRANCO))
            out.append(circulo(x, y, r, 2.0))
    return "".join(out)


def robo(cx, base, s, acc=N3, ag=A3) -> str:
    """Robô agente: cabeça arredondada, antena, olhos e ombros."""
    w, h = s, s * 0.72
    x, y = cx - w / 2, base - s * 0.3 - h
    out = [mancha(cx + 6, base - s * 0.5, s * 0.66, s * 0.6, ag)]
    # ombros
    out.append(f'<path d="M{_f(cx - s * 0.42)} {_f(base)} Q{_f(cx - s * 0.42)} {_f(base - s * 0.27)} '
               f'{_f(cx)} {_f(base - s * 0.27)} Q{_f(cx + s * 0.42)} {_f(base - s * 0.27)} {_f(cx + s * 0.42)} {_f(base)}Z" fill="{BRANCO}"/>')
    out.append(traco([(cx - s * 0.42, base), (cx - s * 0.36, base - s * 0.22), (cx, base - s * 0.27),
                      (cx + s * 0.36, base - s * 0.22), (cx + s * 0.42, base)], 2.4, inicio=0.05, fim=0.05))
    out.append(disco(cx, base - s * 0.12, s * 0.05, acc))
    # antena
    out.append(linha((cx, y), (cx, y - s * 0.16), 2.2))
    out.append(disco(cx, y - s * 0.2, s * 0.05, acc))
    # orelhas
    for lado in (-1, 1):
        ox = cx + lado * (w / 2 + s * 0.04)
        out.append(ret_arred(ox - s * 0.04, y + h * 0.32, s * 0.08, h * 0.36, r=4, esp=2.0, preenche=ag))
    out.append(ret_arred(x, y, w, h, r=s * 0.16, esp=2.5, preenche=BRANCO))
    # visor
    out.append(f'<rect x="{_f(x + w * 0.14)}" y="{_f(y + h * 0.24)}" width="{_f(w * 0.72)}" height="{_f(h * 0.42)}" '
               f'rx="{_f(h * 0.2)}" fill="{TINTA}"/>')
    for lado in (-1, 1):
        out.append(disco(cx + lado * w * 0.17, y + h * 0.45, s * 0.055, AGUADA_ACENTO))
    out.append(arco(cx, y + h * 0.74, w * 0.12, h * 0.07, 10, 170, 2.0))
    return "".join(out)


def balao(x, y, w, h, cauda="esq", esp=2.4, ag=None, linhas=2, acc=None) -> str:
    out = []
    if ag:
        out.append(mancha(x + w / 2 + 8, y + h / 2 + 8, w * 0.58, h * 0.66, ag))
    out.append(ret_arred(x, y, w, h, r=min(16, h / 2.5), esp=esp, preenche=BRANCO))
    if cauda == "esq":
        a, tip, b = (x + w * 0.18, y + h - 2), (x + w * 0.08, y + h + 20), (x + w * 0.34, y + h - 2)
    else:
        a, tip, b = (x + w * 0.66, y + h - 2), (x + w * 0.9, y + h + 20), (x + w * 0.82, y + h - 2)
    out.append(f'<path d="M{_f(a[0])} {_f(a[1] - 3)} L{_f(tip[0])} {_f(tip[1])} L{_f(b[0])} {_f(b[1] - 3)}Z" fill="{BRANCO}"/>')
    out.append(traco([a, tip, b], esp, inicio=0.1, fim=0.1, minimo=0.4))
    for i in range(linhas):
        ly = y + h * (0.38 + 0.26 * i) if linhas > 1 else y + h / 2
        out.append(linha((x + 16, ly), (x + w * (0.78 - 0.25 * i), ly), 1.8, acc or TINTA_FINA, inicio=0.2, fim=0.2))
    return "".join(out)


def folha(x, y, w, h, linhas=5, dobra=16, ag=CINZA_AG, esp=2.3, sombra=True) -> str:
    out = []
    if sombra:
        out.append(mancha_ret(x + 7, y + 8, w, h, ag, irreg=1.0))
    out.append(f'<path d="M{_f(x)} {_f(y)} L{_f(x + w - dobra)} {_f(y)} L{_f(x + w)} {_f(y + dobra)} '
               f'L{_f(x + w)} {_f(y + h)} L{_f(x)} {_f(y + h)}Z" fill="{BRANCO}"/>')
    out.append(poligono([(x, y), (x + w - dobra, y), (x + w, y + dobra), (x + w, y + h), (x, y + h)], esp, sobra=1.4))
    out.append(poligono([(x + w - dobra, y), (x + w - dobra, y + dobra), (x + w, y + dobra)], esp * 0.7,
                        fechado=False, sobra=0.6))
    rng = random.Random(_semente(x, y, w))
    for i in range(linhas):
        ly = y + h * 0.24 + i * (h * 0.62 / max(1, linhas - 1) if linhas > 1 else 0)
        out.append(linha((x + w * 0.16, ly), (x + w * rng.uniform(0.62, 0.84), ly), 1.5, TINTA_FINA,
                         inicio=0.2, fim=0.2))
    return "".join(out)


def lupa(cx, cy, r, esp=2.6, ag=A2) -> str:
    a = math.radians(45)
    p0 = (cx + r * 1.02 * math.cos(a), cy + r * 1.02 * math.sin(a))
    p1 = (cx + r * 1.85 * math.cos(a), cy + r * 1.85 * math.sin(a))
    return (f'<circle cx="{_f(cx)}" cy="{_f(cy)}" r="{_f(r)}" fill="{BRANCO}" fill-opacity="0.85"/>'
            + mancha(cx + 2, cy + 2, r * 0.82, r * 0.82, ag, opac=0.9)
            + circulo(cx, cy, r, esp)
            + traco([p0, p1], esp * 2.3, TINTA, inicio=0.1, fim=0.15, minimo=0.6, pena=0.1))


def escudo(cx, cy, s, acc=N2, ag=A2) -> str:
    w, h = s * 0.8, s
    pts = [(cx, cy - h / 2), (cx + w / 2, cy - h * 0.36), (cx + w / 2, cy), (cx + w * 0.28, cy + h * 0.3),
           (cx, cy + h / 2), (cx - w * 0.28, cy + h * 0.3), (cx - w / 2, cy), (cx - w / 2, cy - h * 0.36)]
    out = [mancha(cx + 6, cy + 6, s * 0.52, s * 0.56, ag)]
    out.append(f'<path d="M{" L".join(f"{_f(x)} {_f(y)}" for x, y in pts)}Z" fill="{BRANCO}"/>')
    out.append(traco(pts + pts[:2], 2.6, inicio=0.03, fim=0.04, minimo=0.35))
    out.append(check(cx, cy, s * 0.32, acc, 3.4))
    return "".join(out)


def cadeado(cx, cy, s, acc=N2, ag=A2) -> str:
    w, h = s * 0.72, s * 0.56
    out = [mancha(cx + 4, cy + h * 0.3, s * 0.5, s * 0.44, ag)]
    out.append(arco(cx, cy - h * 0.05, w * 0.32, s * 0.36, 180, 360, 2.6))
    out.append(ret_arred(cx - w / 2, cy - h * 0.05, w, h, r=8, preenche=BRANCO))
    out.append(disco(cx, cy + h * 0.32, s * 0.06, acc))
    out.append(linha((cx, cy + h * 0.36), (cx, cy + h * 0.6), 2.4, acc))
    return "".join(out)


def prancheta(x, y, w, h, acc=N4, ag=A4, itens=3) -> str:
    out = [mancha_ret(x + 7, y + 8, w, h, ag, irreg=1.0)]
    out.append(ret_arred(x, y, w, h, r=8, preenche=BRANCO))
    out.append(ret_arred(x + w * 0.3, y - 8, w * 0.4, 18, r=5, esp=2.0, preenche=ag))
    for i in range(itens):
        ly = y + h * (0.3 + 0.22 * i)
        out.append(ret(x + w * 0.14, ly - 8, 16, 16, 1.6, sobra=1.0))
        if i < itens - 1:
            out.append(check(x + w * 0.14 + 9, ly - 1, 16, acc, 2.6))
        out.append(linha((x + w * 0.34, ly), (x + w * 0.84, ly), 1.6, TINTA_FINA, inicio=0.2, fim=0.2))
    return "".join(out)


def grafico(x, base, w, h, acc=N4, ag=A4) -> str:
    out = [linha((x, base - h), (x, base + 2), 2.3), linha((x - 2, base), (x + w, base), 2.3)]
    alturas = [0.38, 0.58, 0.47, 0.86]
    bw = w / (len(alturas) * 1.6)
    for i, f in enumerate(alturas):
        bx = x + 14 + i * bw * 1.55
        bh = h * f * 0.92
        out.append(mancha_ret(bx + 3, base - bh + 3, bw, bh - 3, ag if i < 3 else B4, irreg=0.8))
        out.append(ret(bx, base - bh, bw, bh, 1.9, sobra=1.4))
    pts = [(x + 14 + i * bw * 1.55 + bw / 2, base - h * f * 0.92 - 16) for i, f in enumerate(alturas)]
    out.append(traco(pts, 2.2, acc, inicio=0.1, fim=0.1, minimo=0.4))
    for p in pts:
        out.append(disco(p[0], p[1], 3.5, acc))
    return "".join(out)


def git(x, y, w, acc=N1) -> str:
    """Linha principal com uma branch que sai e volta."""
    xs = [x + w * f for f in (0.0, 0.25, 0.5, 0.75, 1.0)]
    out = [linha((xs[0], y), (xs[-1], y), 2.4)]
    out.append(traco([(xs[1], y), (xs[1] + w * 0.08, y - 30), (xs[2], y - 38), (xs[3] - w * 0.08, y - 30), (xs[3], y)],
                     2.4, acc, inicio=0.05, fim=0.05, minimo=0.5))
    for xx in xs:
        out.append(disco(xx, y, 8, BRANCO) + circulo(xx, y, 8, 2.2))
    out.append(disco(xs[2], y - 38, 8, BRANCO) + circulo(xs[2], y - 38, 8, 2.2, acc))
    return "".join(out)


def servidor(x, y, w, h, acc=N4, ag=A4, unidades=3) -> str:
    out = [mancha_ret(x + 7, y + 8, w, h, ag, irreg=1.0)]
    uh = h / unidades
    for i in range(unidades):
        uy = y + i * uh
        out.append(ret_arred(x, uy + 3, w, uh - 6, r=6, esp=2.2, preenche=BRANCO))
        out.append(disco(x + 14, uy + uh / 2, 4, acc if i != 1 else N2))
        out.append(linha((x + w * 0.45, uy + uh / 2), (x + w - 14, uy + uh / 2), 1.5, TINTA_FINA, inicio=0.2, fim=0.2))
    return "".join(out)


def notebook(cx, base, s, ag=A1, tela=None) -> str:
    w, h = s, s * 0.62
    x, y = cx - w / 2, base - h - s * 0.05
    out = [mancha(cx + 6, base - h * 0.45, w * 0.62, h * 0.62, ag)]
    out.append(ret_arred(x, y, w, h, r=8, preenche=BRANCO))
    if tela:
        out.append(tela(x + 10, y + 10, w - 20, h - 20))
    out.append(poligono([(cx - w * 0.5, base - s * 0.05), (cx + w * 0.5, base - s * 0.05),
                         (cx + w * 0.62, base), (cx - w * 0.62, base)], 2.4, preenche=CINZA_AG))
    return "".join(out)


def tela_codigo(x, y, w, h) -> str:
    rng = random.Random(_semente(x, y, w, h))
    out = [mancha_ret(x, y, w, h, "#F4F7FA", irreg=0.5)]
    cores = [ACENTO, TINTA_FINA, TINTA_FINA, ACENTO, TINTA_FINA]
    for i in range(5):
        ly = y + 14 + i * (h - 24) / 4
        ind = 10 + (14 if i in (1, 2, 3) else 0)
        x0 = x + ind
        for k in range(rng.randint(1, 3)):
            seg = w * rng.uniform(0.1, 0.24)
            if x0 + seg > x + w - 8:
                break
            out.append(linha((x0, ly), (x0 + seg, ly), 2.2, cores[(i + k) % len(cores)], inicio=0.2, fim=0.2))
            x0 += seg + 8
    return "".join(out)


def carro(cx, base, s, acc=N3, ag=A3) -> str:
    w = s
    pts = [(cx - w * 0.5, base - s * 0.12), (cx - w * 0.5, base - s * 0.28), (cx - w * 0.3, base - s * 0.32),
           (cx - w * 0.17, base - s * 0.5), (cx + w * 0.2, base - s * 0.5), (cx + w * 0.34, base - s * 0.32),
           (cx + w * 0.5, base - s * 0.28), (cx + w * 0.5, base - s * 0.12)]
    out = [mancha(cx + 6, base - s * 0.26, w * 0.6, s * 0.3, ag)]
    out.append(f'<path d="M{" L".join(f"{_f(x)} {_f(y)}" for x, y in pts)}Z" fill="{BRANCO}"/>')
    out.append(traco(pts + [pts[0]], 2.5, inicio=0.03, fim=0.04, minimo=0.35))
    out.append(poligono([(cx - w * 0.14, base - s * 0.46), (cx + w * 0.01, base - s * 0.46), (cx + w * 0.01, base - s * 0.33),
                         (cx - w * 0.24, base - s * 0.33)], 1.9, preenche=ag, sobra=0.8))
    out.append(poligono([(cx + w * 0.06, base - s * 0.46), (cx + w * 0.18, base - s * 0.46), (cx + w * 0.27, base - s * 0.33),
                         (cx + w * 0.06, base - s * 0.33)], 1.9, preenche=ag, sobra=0.8))
    for wx in (cx - w * 0.28, cx + w * 0.28):
        out.append(disco(wx, base - s * 0.1, s * 0.1, BRANCO) + circulo(wx, base - s * 0.1, s * 0.1, 2.4))
        out.append(disco(wx, base - s * 0.1, s * 0.04, acc))
    out.append(disco(cx + w * 0.46, base - s * 0.22, 4, TINTA_FINA))
    return "".join(out)


def manual(x, y, w, h, acc=N2, ag=A2) -> str:
    out = [mancha_ret(x + 7, y + 8, w, h, ag, irreg=1.0)]
    out.append(ret_arred(x, y, w, h, r=6, preenche=BRANCO))
    out.append(f'<rect x="{_f(x + 3)}" y="{_f(y + 3)}" width="{_f(w * 0.16)}" height="{_f(h - 6)}" fill="{ag}"/>')
    out.append(linha((x + w * 0.18, y + 2), (x + w * 0.18, y + h - 2), 2.0))
    out.append(engrenagem(x + w * 0.6, y + h * 0.42, w * 0.22, ag=BRANCO, esp=2.0))
    out.append(linha((x + w * 0.34, y + h * 0.78), (x + w * 0.86, y + h * 0.78), 1.6, TINTA_FINA, inicio=0.2, fim=0.2))
    return "".join(out)


def plugue(cx, cy, s, acc=N2, ag=A2) -> str:
    w, h = s * 0.55, s * 0.45
    out = [mancha(cx + 4, cy + 4, s * 0.5, s * 0.46, ag)]
    for dx in (-w * 0.22, w * 0.22):
        out.append(linha((cx + dx, cy - h / 2), (cx + dx, cy - h / 2 - s * 0.22), 3.2))
    out.append(ret_arred(cx - w / 2, cy - h / 2, w, h, r=10, preenche=BRANCO))
    out.append(disco(cx, cy, s * 0.06, acc))
    out.append(traco([(cx, cy + h / 2), (cx + 4, cy + h / 2 + s * 0.2), (cx - s * 0.2, cy + h / 2 + s * 0.38),
                      (cx - s * 0.45, cy + h / 2 + s * 0.4)], 2.6, acc, inicio=0.05, fim=0.3))
    return "".join(out)


def maleta(cx, cy, s, acc=N3, ag=A3) -> str:
    w, h = s, s * 0.66
    x, y = cx - w / 2, cy - h / 2
    out = [mancha(cx + 6, cy + 6, s * 0.6, s * 0.45, ag)]
    out.append(ret_arred(cx - w * 0.18, y - s * 0.14, w * 0.36, s * 0.2, r=8, esp=2.4))
    out.append(ret_arred(x, y, w, h, r=10, preenche=BRANCO))
    out.append(linha((x + 2, y + h * 0.42), (x + w - 2, y + h * 0.42), 2.0))
    out.append(f'<rect x="{_f(cx - 8)}" y="{_f(y + h * 0.42 - 7)}" width="16" height="14" rx="3" fill="{acc}"/>')
    return "".join(out)


def globo(cx, cy, r, acc=N1, ag=A1) -> str:
    out = [mancha(cx + 5, cy + 5, r * 1.05, r * 1.05, ag)]
    out.append(disco(cx, cy, r, BRANCO))
    out.append(circulo(cx, cy, r, 2.6))
    out.append(arco(cx, cy, r * 0.45, r, -90, 90, 1.8, TINTA_FINA))
    out.append(arco(cx, cy, r * 0.45, r, 90, 270, 1.8, TINTA_FINA))
    out.append(linha((cx, cy - r), (cx, cy + r), 1.8, TINTA_FINA))
    out.append(linha((cx - r, cy), (cx + r, cy), 1.8, TINTA_FINA))
    for f in (-0.5, 0.5):
        yy = cy + f * r
        hw = r * math.sqrt(1 - f * f)
        out.append(linha((cx - hw, yy), (cx + hw, yy), 1.5, TINTA_FINA))
    return "".join(out)


def capelo(cx, cy, s, acc=N1, ag=A1) -> str:
    w = s
    topo = [(cx, cy - s * 0.22), (cx + w / 2, cy), (cx, cy + s * 0.2), (cx - w / 2, cy)]
    out = [mancha(cx + 6, cy + s * 0.12, s * 0.55, s * 0.36, ag)]
    out.append(f'<path d="M{_f(cx - w * 0.3)} {_f(cy + s * 0.08)} L{_f(cx - w * 0.3)} {_f(cy + s * 0.3)} '
               f'Q{_f(cx)} {_f(cy + s * 0.44)} {_f(cx + w * 0.3)} {_f(cy + s * 0.3)} L{_f(cx + w * 0.3)} {_f(cy + s * 0.08)}Z" fill="{ag}"/>')
    out.append(traco([(cx - w * 0.3, cy + s * 0.08), (cx - w * 0.3, cy + s * 0.3), (cx, cy + s * 0.4),
                      (cx + w * 0.3, cy + s * 0.3), (cx + w * 0.3, cy + s * 0.08)], 2.4, inicio=0.05, fim=0.05))
    out.append(poligono(topo, 2.6, preenche=BRANCO))
    out.append(linha((cx + w * 0.38, cy + s * 0.04), (cx + w * 0.38, cy + s * 0.32), 2.0, acc))
    out.append(disco(cx + w * 0.38, cy + s * 0.34, 5, acc))
    return "".join(out)


def janela_video(x, y, w, h, acc=N3, ag=A3) -> str:
    out = [mancha_ret(x + 7, y + 8, w, h, ag, irreg=1.0)]
    out.append(ret_arred(x, y, w, h, r=10, preenche=BRANCO))
    cx, cy, r = x + w / 2, y + h * 0.44, h * 0.2
    out.append(f'<path d="M{_f(cx - r * 0.6)} {_f(cy - r)} L{_f(cx + r)} {_f(cy)} L{_f(cx - r * 0.6)} {_f(cy + r)}Z" fill="{acc}"/>')
    by = y + h * 0.82
    out.append(linha((x + 14, by), (x + w - 14, by), 2.0, TINTA_FINA))
    out.append(linha((x + 14, by), (x + w * 0.45, by), 2.4, acc))
    out.append(disco(x + w * 0.45, by, 5, acc))
    return "".join(out)


def certificado(x, y, w, h, acc=N4, ag=A4) -> str:
    out = [folha(x, y, w, h, linhas=3, dobra=0.01, ag=ag)]
    sx, sy = x + w * 0.74, y + h * 0.78
    for dx in (-8, 8):
        out.append(f'<path d="M{_f(sx + dx - 5)} {_f(sy)} L{_f(sx + dx + 5)} {_f(sy)} L{_f(sx + dx + 3)} {_f(sy + 30)} '
                   f'L{_f(sx + dx)} {_f(sy + 24)} L{_f(sx + dx - 3)} {_f(sy + 30)}Z" fill="{acc}"/>')
    out.append(disco(sx, sy, 15, B4) + circulo(sx, sy, 15, 2.2, acc))
    return "".join(out)


def livro_aberto(cx, cy, s, ag=A1) -> str:
    w, h = s, s * 0.56
    out = [mancha(cx, cy + s * 0.05, s * 0.62, s * 0.36, ag)]
    for lado in (-1, 1):
        ext = cx + lado * w / 2
        pts = [(cx, cy - h / 2 + 8), (ext, cy - h / 2), (ext, cy + h / 2), (cx, cy + h / 2 + 8)]
        out.append(f'<path d="M{" L".join(f"{_f(x)} {_f(y)}" for x, y in pts)}Z" fill="{BRANCO}"/>')
        out.append(poligono(pts, 2.4, sobra=1.2))
        for i in range(4):
            ly = cy - h * 0.26 + i * h * 0.17
            a, b = (cx + lado * w * 0.1, ly + 4), (cx + lado * w * 0.4, ly)
            out.append(linha(a, b, 1.4, TINTA_FINA, inicio=0.2, fim=0.2))
    return "".join(out)


def bandeira(x, base, h, acc=N3) -> str:
    return (linha((x, base), (x, base - h), 2.4)
            + f'<path d="M{_f(x + 2)} {_f(base - h + 1)} L{_f(x + 30)} {_f(base - h + 12)} L{_f(x + 2)} {_f(base - h + 24)}Z" fill="{acc}"/>')


def mapa_dobrado(cx, cy, w, h) -> str:
    p = w / 3
    x0, y0 = cx - w / 2, cy - h / 2
    cores = [A1, A2, A3]
    out = [mancha(cx + 8, cy + 10, w * 0.58, h * 0.62, CINZA_AG)]
    for i in range(3):
        sk = 10 if i % 2 == 0 else -10
        pts = [(x0 + i * p, y0 + (0 if i % 2 == 0 else 10)), (x0 + (i + 1) * p, y0 + (10 if i % 2 == 0 else 0)),
               (x0 + (i + 1) * p, y0 + h + (10 if i % 2 == 0 else 0)), (x0 + i * p, y0 + h + (0 if i % 2 == 0 else 10))]
        out.append(poligono(pts, 2.4, preenche=cores[i], sobra=1.0))
        del sk
    return "".join(out)


# =============================================================================
# Ilustrações
# =============================================================================
def svg(larg, alt, corpo) -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{larg}" height="{alt}" '
            f'viewBox="0 0 {larg} {alt}">{corpo}</svg>')


def il_capa() -> str:
    """A rota dos quatro níveis: do terminal à nuvem."""
    W, H = 1000, 600
    o = [mancha(470, 330, 430, 210, AGUADA)]
    caminho = [(20, 560), (150, 500), (300, 470), (420, 400), (560, 360), (680, 290), (800, 230), (900, 160), (975, 120)]
    o.append(tracejado(caminho, 2.2, TINTA_FINA, risco=12, vao=9))
    marcos = [(150, 500), (420, 400), (680, 290), (900, 160)]
    # 1: terminal + git
    o.append(terminal(62, 330, 170, 118, N1, A1))
    o.append(estrela(250, 320, 9, N1))
    # 2: rede neural + documento com lupa
    o.append(rede_neural(392, 268, 130, N2, A2))
    o.append(folha(466, 236, 56, 72, linhas=3, dobra=12))
    o.append(lupa(512, 296, 20))
    # 3: robô agente ao lado do notebook
    o.append(notebook(646, 244, 150, A3, tela=tela_codigo))
    o.append(robo(760, 238, 74, N3, A3))
    # 4: nuvem + contêineres
    o.append(nuvem(880, 66, 150, A4))
    o.append(conteiner(822, 98, 52, 28, N4, A4))
    o.append(conteiner(880, 98, 52, 28, N4, A4))
    o.append(conteiner(851, 70, 52, 28, N4, A4))
    o += [estrela(560, 210, 8, N2), estrela(960, 40, 9, N4), estrela(80, 300, 7, N3), estrela(780, 140, 7, N3)]
    o.append(bandeira(975, 122, 62, N3))
    nomes = ["Base", "Conceitos", "Construção", "Produção"]
    for i, ((x, y), n) in enumerate(zip(marcos, nomes)):
        o.append(disco_numero(x, y, str(i + 1), ACENTO, AGUADA_ACENTO))
        o.append(rotulo(x, y + 46, f"nível {i + 1}"))
        o.append(texto(x, y + 72, n, 23, TINTA))
    return svg(W, H, "".join(o))


def il_intro() -> str:
    W, H = 1000, 300
    o = [chao(140, 860, 268)]
    o.append(mapa_dobrado(500, 140, 330, 190))
    rota = [(370, 200), (430, 150), (500, 175), (565, 110), (630, 92)]
    o.append(tracejado(rota, 2.4, TINTA, risco=10, vao=8))
    for (x, y), (c, a) in zip(rota[:4], [(N1, A1), (N2, A2), (N3, A3), (N4, A4)]):
        o.append(disco(x, y, 9, c))
    o.append(bandeira(632, 96, 56, N3))
    o.append(livro_aberto(205, 205, 130, A1))
    o.append(lupa(800, 160, 42))
    o += [estrela(300, 80, 10, N1), estrela(720, 60, 8, N2), estrela(905, 210, 7, N4), estrela(110, 120, 7, N3)]
    return svg(W, H, "".join(o))


def il_nivel1() -> str:
    W, H = 1000, 300
    o = [chao(80, 920, 270)]
    o.append(git(90, 200, 170, N1))
    o.append(terminal(320, 60, 220, 165, N1, A1, linhas=3))
    o.append(banco(640, 160, 100, 120, N1, A1))
    o.append(rede_neural(830, 150, 160, N2, A2))
    o += [estrela(280, 60, 9, N1), estrela(570, 50, 7, N2), estrela(930, 50, 8, N1)]
    return svg(W, H, "".join(o))


def il_nivel2() -> str:
    W, H = 1000, 300
    o = [chao(80, 920, 270)]
    o.append(folha(100, 80, 82, 110, linhas=4, dobra=14))
    o.append(folha(124, 64, 82, 110, linhas=4, dobra=14, sombra=False))
    o.append(lupa(205, 175, 34))
    o.append(robo(430, 250, 150, N3, A3))
    o.append(engrenagem(540, 120, 34, A3))
    o.append(escudo(690, 150, 140, N2, A2))
    o.append(prancheta(820, 70, 110, 150, N4, A4))
    rota = [(260, 150), (330, 140)]
    o.append(tracejado(rota, 1.8, TINTA_FINA))
    o += [estrela(300, 60, 9, N2), estrela(610, 50, 7, N1), estrela(950, 60, 8, N4)]
    return svg(W, H, "".join(o))


def il_nivel3() -> str:
    W, H = 1000, 300
    o = [chao(80, 920, 270)]
    o.append(notebook(270, 262, 260, A3, tela=tela_codigo))
    o.append(robo(470, 262, 110, N3, A3))
    o.append(balao(500, 52, 120, 60, "esq", ag=None, linhas=2, acc=N3))
    o.append(navegador(620, 92, 170, 140, N3, A3))
    o.append(servidor(830, 110, 100, 130, N4, A4))
    o.append(texto(880, 90, "{ API }", 22, ACENTO_ESC, mono=True))
    o += [estrela(110, 80, 9, N3), estrela(605, 50, 7, N1), estrela(955, 200, 8, N2)]
    return svg(W, H, "".join(o))


def il_nivel4() -> str:
    W, H = 1000, 300
    o = [chao(80, 920, 270)]
    for (x, y) in [(100, 210), (182, 210), (141, 168), (100, 126)]:
        o.append(conteiner(x, y, 78, 40, N4, A4))
    o.append(seta([(290, 190), (350, 170), (400, 150)], 2.4, TINTA, tracejada=True))
    o.append(nuvem(520, 120, 220, A4))
    o.append(servidor(480, 120, 80, 72, N4, A4, unidades=2))
    # pipeline CI/CD: laço com setas
    o.append(seta([(660, 210), (690, 170), (740, 165), (770, 200)], 2.4, N2))
    o.append(seta([(770, 220), (740, 256), (690, 258), (660, 225)], 2.4, N1))
    o.append(rotulo(715, 218, "ci/cd", 17))
    o.append(grafico(810, 250, 120, 150, N4, A4))
    o += [estrela(250, 80, 9, N4), estrela(640, 60, 7, N2), estrela(960, 70, 8, N4)]
    return svg(W, H, "".join(o))


def il_projetos() -> str:
    W, H = 1000, 320
    o = [chao(60, 940, 262)]
    o.append(carro(150, 240, 170, N3, A3))
    o.append(balao(150, 60, 110, 56, "esq", linhas=2, acc=N3))
    o.append(manual(330, 110, 100, 130, N2, A2))
    o.append(lupa(445, 190, 28))
    o.append(plugue(600, 160, 140, N2, A2))
    o.append(prancheta(720, 90, 100, 140, N4, A4))
    o.append(robo(890, 240, 110, N4, A4))
    for x, n, c, a in [(150, "P1", N3, A3), (380, "P2", N2, A2), (600, "P3", N2, A2), (770, "P4", N4, A4), (890, "PF", N4, A4)]:
        o.append(disco_numero(x, 296, n, c, a, r=19))
    return svg(W, H, "".join(o))


def il_carreira() -> str:
    W, H = 1000, 320
    o = [chao(80, 920, 280)]
    cores = [(ACENTO, AGUADA), (ACENTO, AGUADA_ACENTO), (ACENTO, AGUADA), (ACENTO, AGUADA_ACENTO), (ACENTO, AGUADA_FORTE)]
    x0, base, sw, sh = 300, 272, 84, 40
    for i, (c, a) in enumerate(cores):
        x, h = x0 + i * sw, sh * (i + 1)
        o.append(mancha_ret(x + 4, base - h + 4, sw, h, a, irreg=0.8))
        o.append(ret(x, base - h, sw, h, 2.2, sobra=1.6))
        o.append(texto(x + sw / 2, base - h + 27, str(i + 1), 21, ACENTO_ESC))
    o.append(bandeira(x0 + 4 * sw + sw / 2, base - 5 * sh, 70, N3))
    o.append(maleta(170, 210, 120, N3, A3))
    o.append(globo(850, 170, 62, N1, A1))
    o.append(balao(870, 60, 96, 50, "esq", linhas=0))
    o.append(texto(918, 94, "Hi!", 23, ACENTO_ESC, italico=True))
    o += [estrela(250, 90, 9, N1), estrela(500, 70, 7, N2), estrela(780, 50, 8, N4)]
    return svg(W, H, "".join(o))


def il_cursos() -> str:
    W, H = 1000, 300
    o = [chao(80, 920, 270)]
    o.append(livro_aberto(200, 190, 200, A1))
    o.append(janela_video(380, 80, 190, 140, N3, A3))
    o.append(certificado(640, 60, 130, 170, N4, A4))
    o.append(capelo(860, 160, 150, N1, A1))
    o += [estrela(330, 60, 9, N1), estrela(600, 40, 7, N3), estrela(950, 70, 8, N4)]
    return svg(W, H, "".join(o))


def _icone(fn) -> callable:
    return lambda: svg(200, 200, fn())


ICONES = {
    "icone-1": _icone(lambda: terminal(30, 45, 140, 110, N1, A1)),
    "icone-2": _icone(lambda: rede_neural(100, 100, 130, N2, A2)),
    "icone-3": _icone(lambda: robo(100, 175, 120, N3, A3)),
    "icone-4": _icone(lambda: nuvem(100, 100, 165, A4) + conteiner(70, 92, 60, 30, N4, A4)),
}

ILUSTRACOES = {
    "capa": il_capa, "intro": il_intro, "nivel1": il_nivel1, "nivel2": il_nivel2,
    "nivel3": il_nivel3, "nivel4": il_nivel4, "projetos": il_projetos, "carreira": il_carreira,
    "cursos": il_cursos, **ICONES,
}


def _pagina(corpo_svg: str, w: int, h: int) -> str:
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: {w}px {h}px; margin: 0 }}
html, body {{ margin: 0; padding: 0; width: {w}px; height: {h}px; overflow: hidden; background: transparent; }}
svg {{ display: block; }}
svg text {{ font-variant-numeric: lining-nums; font-kerning: normal; }}
svg text.sc {{ font-variant-caps: all-small-caps; }}
</style></head><body>{corpo_svg}</body></html>"""


def _chrome(html: Path, *args: str) -> None:
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-pdf-header-footer",
                    *args, html.as_uri()], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main() -> None:
    previa = "--png" in sys.argv
    if previa:
        (AQUI / "previa").mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for nome, fn in ILUSTRACOES.items():
            corpo = fn()
            w, h = map(int, re.search(r'width="(\d+)" height="(\d+)"', corpo).groups())
            html = Path(tmp) / f"{nome}.html"
            html.write_text(_pagina(corpo, w, h), encoding="utf-8")
            _chrome(html, f"--print-to-pdf={AQUI / f'{nome}.pdf'}")
            if previa:
                _chrome(html, f"--screenshot={AQUI / 'previa' / f'{nome}.png'}", f"--window-size={w},{h}")
            print("ok", nome)


if __name__ == "__main__":
    main()
