#!/usr/bin/env python3
"""Descobre a capa de cada link do roadmap (para os cards de referência com imagem).

Regras, nesta ordem:
  - YouTube: miniatura do vídeo (i.ytimg.com).
  - Repositório do GitHub: imagem de prévia gerada pelo GitHub (opengraph.githubassets.com).
  - Demais sites: a imagem que a própria página declara (og:image ou twitter:image), se carregar.
  - Sem imagem: só o ícone do site (a página mostra o ícone no lugar da capa).
O HTML baixado é tratado como dado: só leio as meta tags com expressão regular, nada é executado.
O resultado fica em cache (capas-cache.json) para não buscar de novo a cada execução.

Fontes: o frontmatter (referencias[].url) de todos os Markdown em src/content/**.
Saída: src/data/capas.json, indexado pela URL: {tipo, dominio, icone, img}.

Uso: python3 -I scripts/capas.py
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
CONTEUDO = RAIZ / "src" / "content"
SAIDA = RAIZ / "src" / "data" / "capas.json"
CACHE = AQUI / "capas-cache.json"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

TIPOS = [
    ("Vídeo", ("youtube.com", "youtu.be")),
    ("Repositório", ("github.com/",)),
    ("Vagas", ("linkedin.com/jobs", "gupy.io", "ciee.org.br", "nube.com.br")),
    ("Curso", ("cursoemvideo", "cs50.harvard", "skilljar", "academy.openai", "skills.github", "sqlbolt",
               "aws.amazon.com/pt/training", "learningenglish", "deeplearning.ai", "huggingface.co/learn")),
    ("Docs", ("docs.", "/docs", "platform.claude.com", "modelcontextprotocol.io", "fastapi.tiangolo",
              "git-scm.com/book", "docs.python.org", "microsoft.github.io/presidio", "genai.owasp.org")),
]


def tipo(url: str) -> str:
    for nome, chaves in TIPOS:
        if any(k in url for k in chaves):
            pu = urllib.parse.urlparse(url)
            if nome == "Repositório" and (pu.netloc != "github.com" or len(pu.path.strip("/").split("/")) != 2):
                continue
            return nome
    return "Artigo"


def baixar(url: str, limite: int = 600_000) -> tuple[int, str, bytes]:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.status, r.headers.get("Content-Type", ""), r.read(limite)


def imagem_ok(url: str) -> bool:
    try:
        st, ct, corpo = baixar(url, 4096)
        return st == 200 and (ct.startswith("image/") or corpo[:4] in (b"\x89PNG", b"\xff\xd8\xff\xe0", b"\xff\xd8\xff\xe1", b"GIF8", b"RIFF"))
    except Exception:
        return False


def og_image(url: str) -> str | None:
    try:
        st, ct, corpo = baixar(url)
    except Exception:
        return None
    if st != 200 or "html" not in ct:
        return None
    html = corpo.decode("utf-8", "ignore")
    for prop in ("og:image", "og:image:url", "twitter:image", "twitter:image:src"):
        for pat in (rf'<meta[^>]+(?:property|name)=["\']{prop}["\'][^>]*content=["\']([^"\']+)["\']',
                    rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]*(?:property|name)=["\']{prop}["\']'):
            m = re.search(pat, html, re.I)
            if m:
                return urllib.parse.urljoin(url, m.group(1).replace("&amp;", "&").strip())
    return None


def capa(url: str) -> dict:
    p = urllib.parse.urlparse(url)
    host = p.netloc.removeprefix("www.")
    info = {"tipo": tipo(url), "dominio": host,
            "icone": f"https://www.google.com/s2/favicons?sz=64&domain={p.netloc}", "img": None}
    if "youtube.com" in host:
        vid = urllib.parse.parse_qs(p.query).get("v", [None])[0]
        if vid:
            info["img"] = f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
        return info
    partes = p.path.strip("/").split("/")
    if host == "github.com" and len(partes) == 2:
        info["img"] = f"https://opengraph.githubassets.com/1/{partes[0]}/{partes[1]}"
        return info
    img = og_image(url)
    if img and imagem_ok(img):
        info["img"] = img
    return info


def urls_do_conteudo() -> list[str]:
    """URLs das `referencias` no frontmatter YAML (só o bloco entre os '---'; nada é interpretado)."""
    achadas: set[str] = set()
    for md in sorted(CONTEUDO.rglob("*.md")):
        texto = md.read_text(encoding="utf-8")
        m = re.match(r"---\r?\n(.*?)\r?\n---", texto, re.S)
        if not m:
            continue
        for u in re.findall(r'^\s*(?:-\s+)?url:\s*["\']?(https?://[^"\'\s]+)["\']?\s*$', m.group(1), re.M):
            achadas.add(u)
    return sorted(achadas)


def main() -> None:
    urls = urls_do_conteudo()
    cache = json.loads(CACHE.read_text(encoding="utf-8")) if CACHE.exists() else {}
    for u in urls:
        if u not in cache:
            cache[u] = capa(u)
            print(("capa " if cache[u]["img"] else "ícone"), cache[u]["tipo"].ljust(11), u)
    CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")
    usados = {u: {**cache[u], "tipo": tipo(u)} for u in urls}
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(usados, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    com = sum(1 for v in usados.values() if v["img"])
    print(f"{len(usados)} links, {com} com capa, {len(usados) - com} só com ícone -> {SAIDA}")


if __name__ == "__main__":
    main()
