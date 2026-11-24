#!/usr/bin/env python3
"""Exporta as ilustrações de traço de pena (scripts/ilustracoes/gerar_ilustracoes.py) para SVGs do site.

As cores fixas viram variáveis CSS (--il-*), para o mesmo desenho funcionar no tema claro e no escuro.
Saída: um .svg por ilustração em src/assets/ilustracoes/, sem width/height fixos (só viewBox),
para o SVG ocupar o container mantendo a proporção. O componente Ilustracao.astro os injeta inline
(inline, e não <img>, para o texto do desenho usar a fonte carregada pela página).

Uso: python3 scripts/exportar-ilustracoes.py
"""
import importlib.util
import re
from pathlib import Path

AQUI = Path(__file__).resolve().parent
GERADOR = AQUI / "ilustracoes" / "gerar_ilustracoes.py"
SAIDA = AQUI.parent / "src" / "assets" / "ilustracoes"

CORES = {
    "#263241": "var(--il-tinta)",
    "#8C98A8": "var(--il-fina)",
    "#FFFFFF": "var(--il-papel)",
    "#4A78A8": "var(--il-acento)",
    "#1F3B5C": "var(--il-acento-esc)",
    "#EEF2F6": "var(--il-ag1)",
    "#E4EAF1": "var(--il-ag2)",
    "#DDE7F2": "var(--il-ag3)",
    "#C9D8EA": "var(--il-ag4)",
    "#F4F7FA": "var(--il-tela)",
    "#E2E6EC": "var(--il-guia)",
}


def main() -> None:
    spec = importlib.util.spec_from_file_location("gerador", GERADOR)
    g = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(g)
    SAIDA.mkdir(parents=True, exist_ok=True)
    for nome, fn in g.ILUSTRACOES.items():
        s = fn()
        for hexa, var in CORES.items():
            s = s.replace(f'"{hexa}"', f'"{var}"')
        raiz = re.match(r"<svg\b[^>]*>", s).group(0)
        nova = re.sub(r'\s(?:width|height)="[^"]*"', "", raiz)
        s = nova + s[len(raiz):]
        (SAIDA / f"{nome}.svg").write_text(s + "\n", encoding="utf-8")
    print(f"{len(g.ILUSTRACOES)} ilustrações em {SAIDA}")


if __name__ == "__main__":
    main()
