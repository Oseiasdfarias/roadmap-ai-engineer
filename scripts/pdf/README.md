# PDF público

O arquivo `public/pdf/roadmap-ai-engineer.pdf` é a edição pública do roadmap, gerada a partir do projeto LaTeX (pasta `latex`, ao lado deste repositório). Não é gerado neste repositório.

Para regenerar, na pasta `latex`:

```
python3 build_publico.py && latexmk -lualatex publico.tex
```

Depois copie o PDF gerado (`roadmap-ai-engineer.pdf`) para `public/pdf/roadmap-ai-engineer.pdf`. Detalhes em `latex/PUBLICO.md`.

Antes de publicar, confira que não há dados internos:

```
```

A saída deve ser vazia.
