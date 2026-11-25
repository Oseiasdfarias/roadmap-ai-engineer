#!/usr/bin/env python3
"""Ilustrações do Roadmap AI Engineer, desenhadas por código (versão 2, refinada).

Técnica: o traço não é `stroke` de SVG, é uma forma preenchida cuja espessura varia ao longo do
caminho, como pena com tinta. Na versão 2 o traço é mais fino e mais regular (pouco tremor, pena
quase neutra, pontas curtas), as aguadas são raras e transparentes, e cada cena tem um único
elemento principal com um ou dois de apoio, sobre a mesma linha de chão.

Paleta: grafite + um acento azul, os mesmos valores das variáveis --il-* do tema claro do site
(src/styles/tokens.css). O exportador troca cada hex pela variável CSS correspondente.

Uso, de dentro desta pasta (precisa do Google Chrome):
    python3 gerar_ilustracoes.py          # gera os PDFs vetoriais (pasta ./pdf) usados pelo LaTeX
    python3 gerar_ilustracoes.py --png    # também salva PNGs em ./previa para revisar

Determinístico: os tremores vêm de sementes fixas, então o desenho sai igual a cada execução.
Sem texto dentro dos desenhos (a identidade nova prefere nenhum).
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
PDF = AQUI / "pdf"
CHROME = shutil.which("google-chrome") or shutil.which("chromium") or "google-chrome"

# --- Paleta (= --il-* do tema claro em tokens.css) ---
TINTA = "#1B2330"        # --il-tinta      traço principal
FINA = "#8893A3"         # --il-fina       detalhes, linhas de texto, tracejados
PAPEL = "#FFFFFF"        # --il-papel      fundo dos objetos
ACENTO = "#2F5FB3"       # --il-acento     um ou dois toques por cena
ACENTO_ESC = "#1F3F7A"   # --il-acento-esc
AG1 = "#F1F3F7"          # --il-ag1        aguada neutra
AG2 = "#E8ECF2"          # --il-ag2        aguada neutra mais funda
AG3 = "#E3EBF8"          # --il-ag3        aguada azulada
AG4 = "#CBDAF2"          # --il-ag4        aguada azul (destaque pontual)
TELA = "#F7F8FA"         # --il-tela       fundo de tela
GUIA = "#E3E7ED"         # --il-guia

# Espessuras-base (v1: 2.4 contorno, 1.6 a 1.8 detalhe). Cerca de 35% mais finas.
E = 1.6      # contorno
EF = 1.05    # detalhe
OP_AG = 0.7  # opacidade das aguadas

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
    s = f"{v:.1f}"
    if s.endswith(".0"):
        s = s[:-2]
    return "0" if s == "-0" else s


def _d(pts, fechar=True) -> str:
    """Caminho SVG compacto."""
    s = "M" + "L".join(f"{_f(x)} {_f(y)}" for x, y in pts)
    return s + ("Z" if fechar else "")


def _simplificar(pts, tol: float = 0.12):
    """Ramer-Douglas-Peucker: tira pontos quase colineares (traço igual, arquivo menor)."""
    if len(pts) < 3:
        return list(pts)
    manter = [False] * len(pts)
    manter[0] = manter[-1] = True
    pilha = [(0, len(pts) - 1)]
    while pilha:
        i, j = pilha.pop()
        (ax, ay), (bx, by) = pts[i], pts[j]
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy)
        melhor, k = -1.0, None
        for m in range(i + 1, j):
            px, py = pts[m]
            d = abs(dx * (ay - py) - dy * (ax - px)) / L if L > 1e-9 else math.hypot(px - ax, py - ay)
            if d > melhor:
                melhor, k = d, m
        if k is not None and melhor > tol:
            manter[k] = True
            pilha += [(i, k), (k, j)]
    return [p for p, m in zip(pts, manter) if m]


def _densificar(pts, passo: float = 2.5):
    """Catmull-Rom centrípeta pelos pontos de controle, amostrado a cada ~`passo` unidades.

    v2: a forma centrípeta (alfa 0.5) não faz laço nem espinho quando pontos próximos (quinas
    arredondadas) vizinham pontos distantes (lados longos); a forma uniforme da v1 fazia.
    """
    pts = [tuple(p) for p in pts]
    if len(pts) == 2:
        (x0, y0), (x1, y1) = pts
        pts = [pts[0], ((x0 + x1) / 2, (y0 + y1) / 2), pts[1]]
    # pontas fantasmas espelhadas (evita segmento de comprimento zero)
    a0 = (2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1])
    a1 = (2 * pts[-1][0] - pts[-2][0], 2 * pts[-1][1] - pts[-2][1])
    P = [a0] + pts + [a1]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        t0 = 0.0
        t1 = t0 + max(math.dist(p0, p1), 1e-6) ** 0.5
        t2 = t1 + max(math.dist(p1, p2), 1e-6) ** 0.5
        t3 = t2 + max(math.dist(p2, p3), 1e-6) ** 0.5
        n = max(2, int(math.dist(p1, p2) / passo))
        for s in range(n):
            t = t1 + (t2 - t1) * s / n
            q = []
            for k in (0, 1):
                A1 = ((t1 - t) * p0[k] + (t - t0) * p1[k]) / (t1 - t0)
                A2 = ((t2 - t) * p1[k] + (t - t1) * p2[k]) / (t2 - t1)
                A3 = ((t3 - t) * p2[k] + (t - t2) * p3[k]) / (t3 - t2)
                B1 = ((t2 - t) * A1 + (t - t0) * A2) / (t2 - t0)
                B2 = ((t3 - t) * A2 + (t - t1) * A3) / (t3 - t1)
                q.append(((t2 - t) * B1 + (t - t1) * B2) / (t2 - t1))
            out.append(tuple(q))
    out.append(pts[-1])
    return out


def traco(pts, esp: float = E, cor: str = TINTA, inicio: float = 0.05, fim: float = 0.08,
          minimo: float = 0.5, tremor: float = 0.03, pena: float = 0.14, jitter: float = 0.12,
          opac: float = 1.0) -> str:
    """Um traço de pena: polígono com espessura variável ao longo do caminho.

    v2: tremor 0.10 -> 0.03, pena 0.38 -> 0.14, jitter 0.5 -> 0.12, pontas mais curtas e menos
    afinadas (mínimo 0.22 -> 0.5): traço regular, ainda com um leve ar de mão.
    """
    rng = random.Random(_semente(*[c for p in pts for c in p], esp))
    pts = [(x + rng.uniform(-jitter, jitter), y + rng.uniform(-jitter, jitter)) for x, y in pts]
    d = _densificar(pts)
    comp = [0.0]
    for a, b in zip(d, d[1:]):
        comp.append(comp[-1] + math.dist(a, b))
    L = comp[-1] or 1.0
    # as pontas afinam por distância fixa (não por fração), para traços curtos e longos casarem
    ini = min(inicio, 9.0 / L) if inicio > 0 else 0
    fi = min(fim, 12.0 / L) if fim > 0 else 0
    f1 = max(1.0, L / 120)
    ph1 = rng.random()
    norm = 1 - 0.36 * pena
    esq, dire = [], []
    for i, p in enumerate(d):
        t = comp[i] / L
        a, b = d[max(i - 1, 0)], d[min(i + 1, len(d) - 1)]
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        r0 = t / ini if ini > 0 else 1.0
        r1 = (1 - t) / fi if fi > 0 else 1.0
        larg = esp * (minimo + (1 - minimo) * _suave(min(r0, r1, 1.0)))
        larg *= 1 + tremor * math.sin(2 * math.pi * (f1 * t + ph1))
        larg *= ((1 - pena) + pena * abs(math.sin(ang - PENA_ANGULO))) / norm
        nx, ny, h = -math.sin(ang), math.cos(ang), larg / 2
        esq.append((p[0] + nx * h, p[1] + ny * h))
        dire.append((p[0] - nx * h, p[1] - ny * h))
    contorno = _simplificar(esq) + _simplificar(dire[::-1])
    op = f' fill-opacity="{opac}"' if opac < 1 else ""
    return f'<path d="{_d(contorno)}" fill="{cor}"{op}/>'


def linha(a, b, esp=E, cor=TINTA, curva=0.0, **kw) -> str:
    rng = random.Random(_semente(*a, *b))
    mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
    L = math.dist(a, b) or 1
    nx, ny = -(b[1] - a[1]) / L, (b[0] - a[0]) / L
    c = curva + rng.uniform(-0.25, 0.25)
    return traco([a, (mx + nx * c, my + ny * c), b], esp, cor, **kw)


def tracejado(pts, esp=EF, cor=FINA, risco=9.0, vao=7.0) -> str:
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
        if math.dist(p[0], p[-1]) > 2:
            out.append(traco([p[0], p[len(p) // 2], p[-1]], esp, cor, inicio=0.3, fim=0.3, minimo=0.6,
                             jitter=0.05, tremor=0.0))
    return "".join(out)


def seta(pts, esp=E, cor=TINTA, cabeca=9.0, tracejada=False) -> str:
    corpo = tracejado(pts, esp, cor) if tracejada else traco(pts, esp, cor, inicio=0.1, fim=0.02, minimo=0.5)
    d = _densificar(pts)
    tip, ante = d[-1], d[max(0, len(d) - 5)]
    ang = math.atan2(tip[1] - ante[1], tip[0] - ante[0])
    pontas = []
    for lado in (-1, 1):
        a = ang + math.pi - lado * math.radians(30)
        base = (tip[0] + cabeca * math.cos(a), tip[1] + cabeca * math.sin(a))
        pontas.append(traco([base, tip], esp, cor, inicio=0.3, fim=0.02, minimo=0.5, jitter=0.05))
    return corpo + "".join(pontas)


def arco(cx, cy, rx, ry, a0, a1, esp=E, cor=TINTA, **kw) -> str:
    """Arco de elipse entre os ângulos a0 e a1 (graus; y para baixo)."""
    n = max(8, int(abs(a1 - a0) / 8))
    pts = [(cx + rx * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
            cy + ry * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]
    kw.setdefault("jitter", 0.05)
    return traco(pts, esp, cor, **kw)


def circulo(cx, cy, r, esp=E, cor=TINTA, voltas=1.03, **kw) -> str:
    rng = random.Random(_semente(cx, cy, r))
    th0 = rng.uniform(0, 2 * math.pi)
    n = max(12, int(r * voltas / 5))
    pts = []
    for i in range(n + 1):
        th = th0 + 2 * math.pi * voltas * i / n
        rr = r * (1 + 0.006 * (i / n))
        pts.append((cx + rr * math.cos(th), cy + rr * math.sin(th)))
    kw.setdefault("jitter", 0.04)
    return traco(pts, esp, cor, **kw)


def disco(cx, cy, r, cor) -> str:
    return f'<circle cx="{_f(cx)}" cy="{_f(cy)}" r="{_f(r)}" fill="{cor}"/>'


def mancha(cx, cy, rx, ry, cor=AG1, irreg=0.05, opac=OP_AG) -> str:
    """Aguada: mancha orgânica, sem contorno, transparente."""
    rng = random.Random(_semente(cx, cy, rx, ry))
    fases = [(k, rng.uniform(0, 2 * math.pi), rng.uniform(0.4, 1.0)) for k in (2, 3, 5)]
    pts = []
    for i in range(72):
        th = 2 * math.pi * i / 72
        r = 1 + irreg * sum(a * math.sin(k * th + ph) for k, ph, a in fases) / 1.7
        pts.append((cx + rx * r * math.cos(th), cy + ry * r * math.sin(th)))
    op = f' fill-opacity="{opac}"' if opac < 1 else ""
    return f'<path d="{_d(_simplificar(pts + pts[:1], 0.3))}" fill="{cor}"{op}/>'


def ret(x, y, w, h, esp=E, cor=TINTA, sobra=1.0, **kw) -> str:
    """Retângulo de quatro traços com sobra mínima nas quinas."""
    rng = random.Random(_semente(x, y, w, h))
    s = lambda: rng.uniform(0.2, sobra)  # noqa: E731
    kw.setdefault("inicio", 0.04)
    kw.setdefault("fim", 0.06)
    return "".join(linha(a, b, esp, cor, **kw) for a, b in [
        ((x - s(), y), (x + w + s(), y)), ((x + w, y - s()), (x + w, y + h + s())),
        ((x + w + s(), y + h), (x - s(), y + h)), ((x, y + h + s()), (x, y - s()))])


def poligono(pts, esp=E, cor=TINTA, fechado=True, preenche=None) -> str:
    """Polígono num traço contínuo (juntas limpas)."""
    out = []
    if preenche:
        out.append(f'<path d="{_d(pts)}" fill="{preenche}"/>')
    caminho = list(pts) + ([pts[0], _meio(pts[0], pts[1], 0.25)] if fechado else [])
    densos = []
    for a, b in zip(caminho, caminho[1:]):
        n = max(1, int(math.dist(a, b) / 14))
        densos += [_meio(a, b, k / n) for k in range(n)]
    densos.append(caminho[-1])
    out.append(_traco_reto(densos, esp, cor))
    return "".join(out)


def _meio(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def _traco_reto(pts, esp, cor):
    """Traço por polilinha sem Catmull-Rom entre quinas (mantém cantos vivos)."""
    return traco(pts, esp, cor, inicio=0.03, fim=0.03, minimo=0.6, jitter=0.0)


def ret_arred(x, y, w, h, r=10, esp=E, cor=TINTA, preenche=None) -> str:
    pts = []
    cantos = [(x + w - r, y + r, -90), (x + w - r, y + h - r, 0), (x + r, y + h - r, 90), (x + r, y + r, 180)]
    for cx, cy, a0 in cantos:
        for k in range(5):
            a = math.radians(a0 + 90 * k / 4)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    fecho = min(14.0, max(2.0, w - 2 * r - 6))
    pts = [(x + r + 2, y)] + pts + [(x + r + 2, y), (x + r + 2 + fecho, y)]
    fundo = ""
    if preenche:
        fundo = f'<rect x="{_f(x)}" y="{_f(y)}" width="{_f(w)}" height="{_f(h)}" rx="{_f(r)}" fill="{preenche}"/>'
    return fundo + traco(pts, esp, cor, inicio=0.03, fim=0.04, minimo=0.55, jitter=0.05)


def chao(x0, x1, y) -> str:
    """Linha de chão única e fina, igual em todas as cenas."""
    return linha((x0, y), (x1, y), EF, FINA, inicio=0.5, fim=0.5, minimo=0.15)


def check(cx, cy, s, cor=ACENTO, esp=E * 1.2) -> str:
    return traco([(cx - s * 0.5, cy), (cx - s * 0.12, cy + s * 0.38), (cx + s * 0.55, cy - s * 0.45)],
                 esp, cor, inicio=0.1, fim=0.15, minimo=0.5)


# =============================================================================
# Objetos (desenhados com o mínimo de detalhe)
# =============================================================================
def terminal(x, y, w, h, linhas=2, aguada=False) -> str:
    out = [mancha(x + w / 2 + 10, y + h / 2 + 10, w * 0.56, h * 0.56, AG3)] if aguada else []
    out.append(ret_arred(x, y, w, h, r=9, preenche=PAPEL))
    by = y + 24
    out.append(linha((x + 1, by), (x + w - 1, by), EF, FINA, inicio=0, fim=0))
    for k in range(3):
        out.append(disco(x + 14 + k * 11, y + 12, 2.8, FINA))
    py = y + by - y + (h - 24) * 0.36
    out.append(poligono([(x + 20, py - 7), (x + 29, py), (x + 20, py + 7)], E, ACENTO, fechado=False))
    out.append(linha((x + 37, py + 7), (x + 37 + 22, py + 7), E, ACENTO))
    for i in range(linhas):
        ly = py + 28 + 16 * i
        if ly > y + h - 12:
            break
        out.append(linha((x + 20, ly), (x + 20 + w * (0.5 - 0.18 * i), ly), EF, FINA))
    return "".join(out)


def git(x, y, w) -> str:
    """Linha principal com uma branch que sai e volta (o nó da branch em acento)."""
    xs = [x + w * f for f in (0.0, 0.33, 0.67, 1.0)]
    out = [linha((xs[0], y), (xs[-1], y), EF, TINTA)]
    out.append(traco([(xs[1], y), (xs[1] + w * 0.08, y - 22), (xs[1] + w * 0.17, y - 28),
                      (xs[2] - w * 0.08, y - 22), (xs[2], y)], EF, FINA, inicio=0.05, fim=0.05))
    for xx in xs:
        out.append(disco(xx, y, 6, PAPEL) + circulo(xx, y, 6, EF))
    out.append(disco(xs[1] + w * 0.17, y - 28, 6, ACENTO))
    return "".join(out)


def banco(cx, cy, w, h) -> str:
    rx, ry = w / 2, w * 0.14
    top, bot = cy - h / 2, cy + h / 2
    out = [f'<path d="M{_f(cx - rx)} {_f(top)}L{_f(cx - rx)} {_f(bot)}A{_f(rx)} {_f(ry)} 0 0 0 '
           f'{_f(cx + rx)} {_f(bot)}L{_f(cx + rx)} {_f(top)}Z" fill="{PAPEL}"/>']
    out.append(f'<ellipse cx="{_f(cx)}" cy="{_f(top)}" rx="{_f(rx)}" ry="{_f(ry)}" fill="{PAPEL}"/>')
    out.append(arco(cx, top, rx, ry, 0, 360, E))
    out.append(arco(cx, top + h / 2, rx, ry, 10, 170, EF, FINA))
    out.append(arco(cx, bot, rx, ry, 0, 180, E))
    out.append(linha((cx - rx, top), (cx - rx, bot), E, inicio=0, fim=0))
    out.append(linha((cx + rx, top), (cx + rx, bot), E, inicio=0, fim=0))
    return "".join(out)


def _contorno_nuvem(cx, cy, s, n=140):
    """Contorno da nuvem: três arcos em cima e base reta embaixo (raios a partir do centro)."""
    circs = [(cx - s * 0.3, cy + s * 0.04, s * 0.2), (cx - s * 0.02, cy - s * 0.1, s * 0.29),
             (cx + s * 0.3, cy + s * 0.02, s * 0.21)]
    base = cy + s * 0.18
    # extremos da base reta: onde ela corta o arco da esquerda e o da direita
    (lx, ly, lr), _, (rx, ry, rr) = circs
    xb0 = lx - math.sqrt(lr * lr - (base - ly) ** 2)
    xb1 = rx + math.sqrt(rr * rr - (base - ry) ** 2)
    ox, oy = cx, cy
    pts = []
    for i in range(n):
        th = 2 * math.pi * i / n
        dx, dy = math.cos(th), math.sin(th)
        if dy > 1e-6:
            tb = (base - oy) / dy
            if xb0 <= ox + tb * dx <= xb1:
                pts.append((ox + tb * dx, base))
                continue
        best = 0.0
        for px, py, r in circs:
            fx, fy = ox - px, oy - py
            b = fx * dx + fy * dy
            disc = b * b - (fx * fx + fy * fy - r * r)
            if disc >= 0:
                best = max(best, -b + math.sqrt(disc))
        pts.append((ox + best * dx, oy + best * dy))
    return pts


def _fechar(pts):
    """Fecha o contorno começando no meio do último lado (a emenda cai num trecho reto, não numa quina)."""
    return [_meio(pts[-1], pts[0], 0.5)] + list(pts) + [_meio(pts[-1], pts[0], 0.58)]


def nuvem(cx, cy, s, esp=E, aguada=False) -> str:
    pts = _contorno_nuvem(cx, cy, s)
    out = [mancha(cx + 8, cy + 10, s * 0.52, s * 0.3, AG3)] if aguada else []
    out.append(f'<path d="{_d(_simplificar(pts, 0.2))}" fill="{PAPEL}"/>')
    out.append(traco(_fechar(pts), esp, TINTA, inicio=0.02, fim=0.03, minimo=0.55, jitter=0.0))
    return "".join(out)


def conteiner(x, y, w, h, acc=False) -> str:
    out = [f'<rect x="{_f(x)}" y="{_f(y)}" width="{_f(w)}" height="{_f(h)}" fill="{AG4 if acc else PAPEL}"/>']
    out.append(ret(x, y, w, h, E, sobra=0.8))
    for i in range(1, 4):
        xx = x + w * i / 4
        out.append(linha((xx, y + 6), (xx, y + h - 6), EF, FINA))
    return "".join(out)


def rede_neural(cx, cy, s, aguada=True) -> str:
    camadas = [3, 4, 2]
    xs = [cx - s * 0.42, cx, cx + s * 0.42]
    nos = []
    for k, n in enumerate(camadas):
        esp_v = s * 0.26
        y0 = cy - esp_v * (n - 1) / 2
        nos.append([(xs[k], y0 + j * esp_v) for j in range(n)])
    out = [mancha(cx + 8, cy + 8, s * 0.5, s * 0.48, AG3)] if aguada else []
    for a_l, b_l in zip(nos, nos[1:]):
        for a in a_l:
            for b in b_l:
                out.append(linha(a, b, 0.8, FINA, inicio=0, fim=0, minimo=1))
    r = s * 0.06
    destaque = {(1, 1), (2, 0)}
    for k, cam in enumerate(nos):
        for j, (x, y) in enumerate(cam):
            out.append(disco(x, y, r, ACENTO if (k, j) in destaque else PAPEL))
            out.append(circulo(x, y, r, E, ACENTO if (k, j) in destaque else TINTA))
    return "".join(out)


def robo(cx, base, s, aguada=True) -> str:
    """Robô agente: cabeça arredondada, antena, dois olhos e ombros."""
    w, h = s, s * 0.7
    x, y = cx - w / 2, base - s * 0.3 - h
    out = [mancha(cx + 8, base - s * 0.48, s * 0.6, s * 0.56, AG3)] if aguada else []
    out.append(f'<path d="M{_f(cx - s * 0.4)} {_f(base)}Q{_f(cx - s * 0.4)} {_f(base - s * 0.26)} '
               f'{_f(cx)} {_f(base - s * 0.26)}Q{_f(cx + s * 0.4)} {_f(base - s * 0.26)} {_f(cx + s * 0.4)} {_f(base)}Z" fill="{PAPEL}"/>')
    out.append(traco([(cx - s * 0.4, base), (cx - s * 0.35, base - s * 0.21), (cx, base - s * 0.26),
                      (cx + s * 0.35, base - s * 0.21), (cx + s * 0.4, base)], E, inicio=0.02, fim=0.02))
    out.append(linha((cx, y), (cx, y - s * 0.14), E, inicio=0, fim=0))
    out.append(disco(cx, y - s * 0.17, s * 0.04, ACENTO))
    out.append(ret_arred(x, y, w, h, r=s * 0.16, preenche=PAPEL))
    out.append(ret_arred(x + w * 0.16, y + h * 0.26, w * 0.68, h * 0.4, r=h * 0.18, esp=EF, cor=FINA))
    for lado in (-1, 1):
        out.append(disco(cx + lado * w * 0.16, y + h * 0.46, s * 0.045, TINTA))
    return "".join(out)


def balao(x, y, w, h, linhas=2, acc=False) -> str:
    out = [ret_arred(x, y, w, h, r=min(14, h / 2.5), preenche=PAPEL)]
    a, tip, b = (x + w * 0.2, y + h - 1), (x + w * 0.12, y + h + 15), (x + w * 0.34, y + h - 1)
    out.append(f'<path d="M{_f(a[0])} {_f(a[1] - 3)}L{_f(tip[0])} {_f(tip[1])}L{_f(b[0])} {_f(b[1] - 3)}Z" fill="{PAPEL}"/>')
    out.append(traco([a, tip, b], E, inicio=0.05, fim=0.05, minimo=0.6, jitter=0.0))
    for i in range(linhas):
        ly = y + h * (0.38 + 0.26 * i) if linhas > 1 else y + h / 2
        out.append(linha((x + 15, ly), (x + w * (0.78 - 0.25 * i), ly), EF,
                         ACENTO if (acc and i == 0) else FINA))
    return "".join(out)


def folha(x, y, w, h, linhas=4, dobra=14) -> str:
    pts = [(x, y), (x + w - dobra, y), (x + w, y + dobra), (x + w, y + h), (x, y + h)]
    out = [poligono(pts, E, preenche=PAPEL)]
    out.append(poligono([(x + w - dobra, y), (x + w - dobra, y + dobra), (x + w, y + dobra)], EF, fechado=False))
    for i in range(linhas):
        ly = y + h * 0.28 + i * (h * 0.56 / max(1, linhas - 1))
        out.append(linha((x + w * 0.18, ly), (x + w * (0.78 - 0.12 * (i % 2)), ly), EF, FINA))
    return "".join(out)


def lupa(cx, cy, r, esp=E) -> str:
    a = math.radians(45)
    p0 = (cx + r * 1.04 * math.cos(a), cy + r * 1.04 * math.sin(a))
    p1 = (cx + r * 1.8 * math.cos(a), cy + r * 1.8 * math.sin(a))
    return (disco(cx, cy, r, PAPEL) + circulo(cx, cy, r, esp)
            + traco([p0, p1], esp * 2.0, TINTA, inicio=0.05, fim=0.1, minimo=0.7, pena=0.0))


def escudo(cx, cy, s) -> str:
    w, h = s * 0.8, s
    pts = [(cx, cy - h / 2), (cx + w / 2, cy - h * 0.36), (cx + w / 2, cy), (cx + w * 0.28, cy + h * 0.3),
           (cx, cy + h / 2), (cx - w * 0.28, cy + h * 0.3), (cx - w / 2, cy), (cx - w / 2, cy - h * 0.36)]
    out = [f'<path d="{_d(pts)}" fill="{PAPEL}"/>']
    out.append(traco(_fechar(pts), E, inicio=0.02, fim=0.03, minimo=0.55, jitter=0.0))
    out.append(check(cx, cy, s * 0.3, ACENTO))
    return "".join(out)


def notebook(cx, base, s, tela=None, aguada=False) -> str:
    w, h = s, s * 0.62
    x, y = cx - w / 2, base - h - s * 0.04
    out = [mancha(cx + 10, base - h * 0.5, w * 0.56, h * 0.6, AG3)] if aguada else []
    out.append(ret_arred(x, y, w, h, r=8, preenche=PAPEL))
    if tela:
        out.append(tela(x + 12, y + 12, w - 24, h - 24))
    out.append(poligono([(cx - w * 0.5, base - s * 0.04), (cx + w * 0.5, base - s * 0.04),
                         (cx + w * 0.58, base), (cx - w * 0.58, base)], E, preenche=PAPEL))
    return "".join(out)


def tela_codigo(x, y, w, h) -> str:
    out = [f'<rect x="{_f(x)}" y="{_f(y)}" width="{_f(w)}" height="{_f(h)}" rx="3" fill="{TELA}"/>']
    todos = [(0, [0.16, 0.3]), (1, [0.22]), (1, [0.12, 0.26]), (2, [0.18]), (1, [0.3]), (0, [0.2])]
    passo = min(22.0, (h - 30) / 3)
    segs = todos[:max(4, min(len(todos), int((h - 40) / passo) + 1))] if passo >= 22 else todos[:4]
    if passo >= 22:
        segs = segs[:-1] + [todos[-1]]
    for i, (ind, partes) in enumerate(segs):
        ly = y + 16 + i * passo
        x0 = x + 12 + ind * 16
        for k, seg in enumerate(partes):
            cor = ACENTO if (i == 0 and k == 0) else FINA
            out.append(linha((x0, ly), (x0 + w * seg, ly), EF * 1.3, cor, inicio=0.1, fim=0.1))
            x0 += w * seg + 9
    return "".join(out)


def grafico(x, base, w, h) -> str:
    out = [linha((x, base - h), (x, base), EF, inicio=0, fim=0)]
    alturas = [0.38, 0.56, 0.48, 0.84]
    bw = w / 7
    for i, f in enumerate(alturas):
        bx = x + 14 + i * bw * 1.6
        bh = h * f
        out.append(f'<rect x="{_f(bx)}" y="{_f(base - bh)}" width="{_f(bw)}" height="{_f(bh)}" '
                   f'fill="{AG4 if i == 3 else PAPEL}"/>')
        out.append(ret(bx, base - bh, bw, bh, EF, sobra=0.6))
    return "".join(out)


def carro(cx, base, s, aguada=True) -> str:
    w = s
    pts = [(cx - w * 0.5, base - s * 0.12), (cx - w * 0.5, base - s * 0.27), (cx - w * 0.3, base - s * 0.31),
           (cx - w * 0.17, base - s * 0.48), (cx + w * 0.2, base - s * 0.48), (cx + w * 0.34, base - s * 0.31),
           (cx + w * 0.5, base - s * 0.27), (cx + w * 0.5, base - s * 0.12)]
    out = [mancha(cx + 10, base - s * 0.26, w * 0.52, s * 0.26, AG3)] if aguada else []
    out.append(f'<path d="{_d(pts)}" fill="{PAPEL}"/>')
    out.append(traco(_fechar(pts), E, inicio=0.02, fim=0.03, minimo=0.55, jitter=0.0))
    out.append(poligono([(cx - w * 0.14, base - s * 0.44), (cx + w * 0.0, base - s * 0.44), (cx + w * 0.0, base - s * 0.33),
                         (cx - w * 0.24, base - s * 0.33)], EF))
    out.append(poligono([(cx + w * 0.05, base - s * 0.44), (cx + w * 0.18, base - s * 0.44), (cx + w * 0.27, base - s * 0.33),
                         (cx + w * 0.05, base - s * 0.33)], EF))
    for wx in (cx - w * 0.28, cx + w * 0.28):
        out.append(disco(wx, base - s * 0.1, s * 0.1, PAPEL) + circulo(wx, base - s * 0.1, s * 0.1, E))
        out.append(disco(wx, base - s * 0.1, s * 0.035, TINTA))
    out.append(disco(cx + w * 0.46, base - s * 0.21, 3, ACENTO))
    return "".join(out)


def manual(x, y, w, h) -> str:
    out = [ret_arred(x, y, w, h, r=6, preenche=PAPEL)]
    out.append(linha((x + w * 0.16, y + 1), (x + w * 0.16, y + h - 1), EF, inicio=0, fim=0))
    for i in range(3):
        ly = y + h * (0.3 + 0.16 * i)
        out.append(linha((x + w * 0.32, ly), (x + w * (0.84 - 0.14 * (i % 2)), ly), EF, FINA))
    return "".join(out)


def maleta(cx, cy, s, aguada=True) -> str:
    w, h = s, s * 0.66
    x, y = cx - w / 2, cy - h / 2
    out = [mancha(cx + 8, cy + 8, s * 0.52, s * 0.38, AG3)] if aguada else []
    out.append(ret_arred(cx - w * 0.17, y - s * 0.13, w * 0.34, s * 0.2, r=7))
    out.append(ret_arred(x, y, w, h, r=9, preenche=PAPEL))
    out.append(linha((x + 1, y + h * 0.42), (x + w - 1, y + h * 0.42), EF, inicio=0, fim=0))
    out.append(f'<rect x="{_f(cx - 7)}" y="{_f(y + h * 0.42 - 6)}" width="14" height="12" rx="3" fill="{ACENTO}"/>')
    return "".join(out)


def capelo(cx, cy, s) -> str:
    w = s
    topo = [(cx, cy - s * 0.22), (cx + w / 2, cy), (cx, cy + s * 0.2), (cx - w / 2, cy)]
    out = [f'<path d="M{_f(cx - w * 0.3)} {_f(cy + s * 0.08)}L{_f(cx - w * 0.3)} {_f(cy + s * 0.3)}'
           f'Q{_f(cx)} {_f(cy + s * 0.44)} {_f(cx + w * 0.3)} {_f(cy + s * 0.3)}L{_f(cx + w * 0.3)} {_f(cy + s * 0.08)}Z" fill="{PAPEL}"/>']
    out.append(traco([(cx - w * 0.3, cy + s * 0.08), (cx - w * 0.3, cy + s * 0.3), (cx, cy + s * 0.39),
                      (cx + w * 0.3, cy + s * 0.3), (cx + w * 0.3, cy + s * 0.08)], E, inicio=0.03, fim=0.03))
    out.append(poligono(topo, E, preenche=PAPEL))
    out.append(linha((cx + w * 0.38, cy + s * 0.04), (cx + w * 0.38, cy + s * 0.3), EF, ACENTO, inicio=0, fim=0))
    out.append(disco(cx + w * 0.38, cy + s * 0.32, 4, ACENTO))
    return "".join(out)


def janela_video(x, y, w, h) -> str:
    out = [ret_arred(x, y, w, h, r=9, preenche=PAPEL)]
    cx, cy, r = x + w / 2, y + h * 0.42, h * 0.16
    out.append(poligono([(cx - r * 0.6, cy - r), (cx + r, cy), (cx - r * 0.6, cy + r)], E))
    by = y + h * 0.8
    out.append(linha((x + 16, by), (x + w - 16, by), EF, FINA, inicio=0, fim=0))
    out.append(linha((x + 16, by), (x + w * 0.42, by), E, ACENTO, inicio=0, fim=0))
    return "".join(out)


def livro_aberto(cx, cy, s, aguada=True) -> str:
    w, h = s, s * 0.56
    out = [mancha(cx + 8, cy + 10, s * 0.56, s * 0.32, AG3)] if aguada else []
    for lado in (-1, 1):
        ext = cx + lado * w / 2
        pts = [(cx, cy - h / 2 + 8), (ext, cy - h / 2), (ext, cy + h / 2), (cx, cy + h / 2 + 8)]
        out.append(poligono(pts, E, preenche=PAPEL))
        for i in range(3):
            ly = cy - h * 0.2 + i * h * 0.2
            a, b = (cx + lado * w * 0.1, ly + 4), (cx + lado * w * (0.4 - 0.08 * (i == 2)), ly)
            out.append(linha(a, b, EF, FINA))
    return "".join(out)


def bandeira(x, base, h) -> str:
    return (linha((x, base), (x, base - h), E, inicio=0, fim=0)
            + f'<path d="M{_f(x + 1)} {_f(base - h + 1)}L{_f(x + 24)} {_f(base - h + 10)}L{_f(x + 1)} {_f(base - h + 19)}Z" fill="{ACENTO}"/>')


def mapa_dobrado(cx, cy, w, h) -> str:
    p = w / 3
    x0, y0 = cx - w / 2, cy - h / 2
    out = []
    for i in range(3):
        par = i % 2 == 0
        pts = [(x0 + i * p, y0 + (0 if par else 8)), (x0 + (i + 1) * p, y0 + (8 if par else 0)),
               (x0 + (i + 1) * p, y0 + h + (8 if par else 0)), (x0 + i * p, y0 + h + (0 if par else 8))]
        out.append(poligono(pts, E, preenche=AG1 if i == 1 else PAPEL))
    return "".join(out)


def degraus(x0, base, sw, sh, n=4) -> str:
    """Escada de blocos (carreira): um contorno só, o último degrau em aguada azul."""
    out = [f'<rect x="{_f(x0 + (n - 1) * sw)}" y="{_f(base - n * sh)}" width="{_f(sw)}" height="{_f(n * sh)}" fill="{AG4}" fill-opacity="{OP_AG}"/>']
    pts = [(x0, base)]
    for i in range(n):
        pts += [(x0 + i * sw, base - (i + 1) * sh), (x0 + (i + 1) * sw, base - (i + 1) * sh)]
    pts.append((x0 + n * sw, base))
    out.append(poligono(pts, E, fechado=False))
    for i in range(1, n):
        out.append(linha((x0 + i * sw, base - i * sh), (x0 + i * sw, base), EF, FINA, inicio=0, fim=0))
    return "".join(out)


# =============================================================================
# Ilustrações
# Faixas 1000x300: chão em y=262 de x=120 a 880; elemento principal com ~150 de altura,
# apoio com ~70 a 110. Capa 1000x600 com chão em y=520.
# =============================================================================
CHAO = 262


def svg(larg, alt, corpo) -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{larg}" height="{alt}" '
            f'viewBox="0 0 {larg} {alt}">{corpo}</svg>')


def il_capa() -> str:
    """A rota: do notebook (começo) até a nuvem (produção), com três marcos no caminho."""
    W, H = 1000, 600
    o = [chao(110, 890, 500)]
    o.append(notebook(320, 500, 340, tela=tela_codigo, aguada=True))
    rota = [(540, 476), (610, 440), (660, 370), (720, 300), (775, 256)]
    o.append(tracejado(rota, EF, FINA))
    for x, y in [(540, 476), (632, 410), (712, 309)]:
        o.append(disco(x, y, 5, PAPEL) + circulo(x, y, 5, EF))
    o.append(nuvem(800, 200, 210))
    o.append(disco(800, 208, 7, ACENTO))
    return svg(W, H, "".join(o))


def il_intro() -> str:
    W, H = 1000, 300
    o = [chao(120, 880, CHAO)]
    o.append(mapa_dobrado(520, 150, 300, 170))
    rota = [(400, 200), (460, 150), (530, 175), (590, 112)]
    o.append(tracejado(rota, EF, TINTA, risco=8, vao=6))
    for x, y in rota[:3]:
        o.append(disco(x, y, 4.5, TINTA))
    o.append(bandeira(592, 116, 44))
    o.append(livro_aberto(245, 214, 130, aguada=False))
    return svg(W, H, "".join(o))


def il_nivel1() -> str:
    W, H = 1000, 300
    o = [chao(120, 880, CHAO)]
    o.append(terminal(410, 92, 230, 160, linhas=2, aguada=True))
    o.append(git(170, 222, 170))
    o.append(banco(760, 212, 76, 92))
    return svg(W, H, "".join(o))


def il_nivel2() -> str:
    W, H = 1000, 300
    o = [chao(120, 880, CHAO)]
    o.append(rede_neural(510, 158, 190))
    o.append(folha(215, 132, 78, 104, linhas=3))
    o.append(lupa(290, 214, 22))
    o.append(escudo(770, 200, 92))
    return svg(W, H, "".join(o))


def il_nivel3() -> str:
    W, H = 1000, 300
    o = [chao(120, 880, CHAO)]
    o.append(robo(530, CHAO, 150))
    o.append(balao(620, 58, 120, 56, linhas=2, acc=True))
    o.append(notebook(260, CHAO, 190, tela=tela_codigo))
    return svg(W, H, "".join(o))


def il_nivel4() -> str:
    W, H = 1000, 300
    o = [chao(120, 880, CHAO)]
    for (x, y, a) in [(170, 222, False), (240, 222, False), (205, 182, True)]:
        o.append(conteiner(x, y, 64, 40, a))
    o.append(seta([(330, 190), (380, 170), (420, 160)], EF, FINA, cabeca=8, tracejada=True))
    o.append(nuvem(540, 150, 230, aguada=True))
    o.append(grafico(730, CHAO - 10, 130, 110))
    return svg(W, H, "".join(o))


def il_nivel5() -> str:
    # Fronteira: dois agentes coordenados em volta do modelo aberto por dentro.
    W, H = 1000, 300
    o = [chao(120, 880, CHAO)]
    o.append(rede_neural(500, 150, 200))
    o.append(robo(230, CHAO, 110))
    o.append(robo(770, CHAO, 110))
    o.append(seta([(300, 160), (350, 150), (390, 148)], EF, FINA, cabeca=8, tracejada=True))
    o.append(seta([(700, 160), (650, 150), (610, 148)], EF, FINA, cabeca=8, tracejada=True))
    o.append(balao(560, 40, 110, 50, linhas=2, acc=True))
    return svg(W, H, "".join(o))


def il_projetos() -> str:
    W, H = 1000, 300
    o = [chao(120, 880, CHAO)]
    o.append(carro(500, CHAO, 240))
    o.append(balao(610, 66, 112, 54, linhas=2, acc=True))
    o.append(manual(220, 150, 84, 112))
    o.append(lupa(318, 222, 20))
    return svg(W, H, "".join(o))


def il_carreira() -> str:
    W, H = 1000, 300
    o = [chao(120, 880, CHAO)]
    x0, sw, sh = 440, 80, 40
    o.append(degraus(x0, CHAO, sw, sh, 4))
    o.append(bandeira(x0 + 3.5 * sw, CHAO - 4 * sh, 44))
    o.append(maleta(270, CHAO - 40, 104))
    return svg(W, H, "".join(o))


def il_cursos() -> str:
    W, H = 1000, 300
    o = [chao(120, 880, CHAO)]
    o.append(livro_aberto(480, 190, 220))
    o.append(janela_video(170, 140, 150, 110))
    o.append(capelo(770, 196, 130))
    return svg(W, H, "".join(o))


# --- Ícones de nível: um glifo só, traço mais grosso para ler a 32 px ---
EI = 8.0  # 8 unidades num viewBox de 200 = ~1.3 px a 32 px


def _ic(pts, esp=EI, cor=TINTA, fechado=False):
    return traco(pts + (pts[:2] if fechado else []), esp, cor, inicio=0.0, fim=0.0, minimo=1,
                 tremor=0.0, pena=0.06, jitter=0.0)


def _ic_ret(x, y, w, h, r, esp=EI, cor=TINTA, preenche=PAPEL):
    pts = []
    for cx, cy, a0 in [(x + w - r, y + r, -90), (x + w - r, y + h - r, 0), (x + r, y + h - r, 90), (x + r, y + r, 180)]:
        for k in range(5):
            a = math.radians(a0 + 90 * k / 4)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    fundo = f'<rect x="{_f(x)}" y="{_f(y)}" width="{_f(w)}" height="{_f(h)}" rx="{_f(r)}" fill="{preenche}"/>'
    return fundo + _ic(pts, esp, cor, fechado=True)


def icone_terminal() -> str:
    o = [_ic_ret(26, 44, 148, 112, 18)]
    o.append(_ic([(58, 80), (82, 100), (58, 120)], EI, ACENTO))
    o.append(_ic([(96, 122), (136, 122)], EI, TINTA))
    return "".join(o)


def icone_rede() -> str:
    nos = [(56, 64), (56, 136), (144, 100)]
    centro = (100, 100)
    o = []
    for a, b in [(nos[0], nos[1]), (nos[0], nos[2]), (nos[1], nos[2])]:
        o.append(_ic([a, b], EI * 0.7, FINA))
    for i, (x, y) in enumerate(nos):
        cor = ACENTO if i == 2 else TINTA
        o.append(disco(x, y, 19, PAPEL) + _ic([(x + 19 * math.cos(t / 24 * 2 * math.pi), y + 19 * math.sin(t / 24 * 2 * math.pi))
                                             for t in range(25)], EI, cor))
    del centro
    return "".join(o)


def icone_robo() -> str:
    o = [_ic([(100, 50), (100, 30)], EI)]
    o.append(disco(100, 26, 9, ACENTO))
    o.append(_ic_ret(38, 50, 124, 104, 26))
    o.append(disco(76, 100, 11, TINTA) + disco(124, 100, 11, TINTA))
    o.append(_ic([(84, 130), (116, 130)], EI * 0.8, FINA))
    return "".join(o)


def icone_nuvem() -> str:
    pts = _contorno_nuvem(100, 112, 168, 96)
    pts = _simplificar(pts, 0.2)
    return (f'<path d="{_d(pts)}" fill="{PAPEL}"/>' + _ic(pts, EI, TINTA, fechado=True)
            + _ic([(100, 132), (100, 96)], EI, ACENTO) + _ic([(87, 109), (100, 96), (113, 109)], EI, ACENTO))


def icone_camadas() -> str:
    # Camadas empilhadas (o modelo por dentro), a de cima em destaque.
    o = []
    for i, y in enumerate([118, 84, 50]):
        o.append(_ic_ret(40 + i * 6, y, 120 - i * 12, 34, 10, cor=ACENTO if i == 2 else TINTA))
    return "".join(o)


def _icone(fn) -> callable:
    return lambda: svg(200, 200, fn())


ICONES = {
    "icone-1": _icone(icone_terminal),
    "icone-2": _icone(icone_rede),
    "icone-3": _icone(icone_robo),
    "icone-4": _icone(icone_nuvem),
    "icone-5": _icone(icone_camadas),
}

ILUSTRACOES = {
    "capa": il_capa, "intro": il_intro, "nivel1": il_nivel1, "nivel2": il_nivel2,
    "nivel3": il_nivel3, "nivel4": il_nivel4, "nivel5": il_nivel5, "projetos": il_projetos, "carreira": il_carreira,
    "cursos": il_cursos, **ICONES,
}


def _pagina(corpo_svg: str, w: int, h: int) -> str:
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page {{ size: {w}px {h}px; margin: 0 }}
html, body {{ margin: 0; padding: 0; width: {w}px; height: {h}px; overflow: hidden; background: transparent; }}
svg {{ display: block; }}
</style></head><body>{corpo_svg}</body></html>"""


def _chrome(html: Path, *args: str) -> None:
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-pdf-header-footer",
                    *args, html.as_uri()], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main() -> None:
    previa = "--png" in sys.argv
    PDF.mkdir(exist_ok=True)
    if previa:
        (AQUI / "previa").mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for nome, fn in ILUSTRACOES.items():
            corpo = fn()
            w, h = map(int, re.search(r'width="(\d+)" height="(\d+)"', corpo).groups())
            html = Path(tmp) / f"{nome}.html"
            html.write_text(_pagina(corpo, w, h), encoding="utf-8")
            _chrome(html, f"--print-to-pdf={PDF / f'{nome}.pdf'}")
            if previa:
                _chrome(html, f"--screenshot={AQUI / 'previa' / f'{nome}.png'}", f"--window-size={w},{h}")
            print("ok", nome)


if __name__ == "__main__":
    main()
