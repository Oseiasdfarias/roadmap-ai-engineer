#!/usr/bin/env python3
"""Exporta as ilustrações refinadas (gerar_ilustracoes.py desta pasta) para SVGs do site.

As cores fixas viram variáveis CSS (--il-*), para o mesmo desenho funcionar no tema claro e no escuro.
Saída: um .svg por ilustração em ./svg, sem width/height fixos (só viewBox), prontos para substituir
os de src/assets/ilustracoes/ no site (mesmos nomes, mesmo mecanismo de cor).

Uso: python3 exportar-ilustracoes.py
"""
import importlib.util
import re
from pathlib import Path

AQUI = Path(__file__).resolve().parent
GERADOR = AQUI / "ilustracoes" / "gerar_ilustracoes.py"
SAIDA = AQUI.parent / "src" / "assets" / "ilustracoes"

# Hex do gerador (= tema claro de tokens.css) -> variável CSS
CORES = {
    "#1B2330": "var(--il-tinta)",
    "#8893A3": "var(--il-fina)",
    "#FFFFFF": "var(--il-papel)",
    "#2F5FB3": "var(--il-acento)",
    "#1F3F7A": "var(--il-acento-esc)",
    "#F1F3F7": "var(--il-ag1)",
    "#E8ECF2": "var(--il-ag2)",
    "#E3EBF8": "var(--il-ag3)",
    "#CBDAF2": "var(--il-ag4)",
    "#F7F8FA": "var(--il-tela)",
    "#E3E7ED": "var(--il-guia)",
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
        sobra = re.findall(r'"#[0-9A-Fa-f]{3,8}"', s)
        if sobra:
            raise SystemExit(f"{nome}: cor sem variável: {sorted(set(sobra))}")
        raiz = re.match(r"<svg\b[^>]*>", s).group(0)
        nova = re.sub(r'\s(?:width|height)="[^"]*"', "", raiz)
        s = nova + s[len(raiz):]
        (SAIDA / f"{nome}.svg").write_text(s + "\n", encoding="utf-8")
    print(f"{len(g.ILUSTRACOES)} ilustrações em {SAIDA}")


if __name__ == "__main__":
    main()
