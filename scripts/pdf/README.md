# PDF público

O arquivo `public/pdf/roadmap-ai-engineer.pdf` é a edição pública do roadmap, gerada a partir do projeto LaTeX (pasta `latex`, ao lado deste repositório). Não é gerado neste repositório.

Para regenerar, na pasta `latex`:

```
python3 build_publico.py && latexmk -lualatex publico.tex
```

Depois copie o PDF gerado (`roadmap-ai-engineer.pdf`) para `public/pdf/roadmap-ai-engineer.pdf`. Detalhes em `latex/PUBLICO.md`.

Antes de publicar, confira que não há dados internos:

```
pdftotext public/pdf/roadmap-ai-engineer.pdf - | grep -inEf scripts/pdf/termos-proibidos.txt
```

Os termos (nomes e referências pessoais que não devem aparecer) ficam num arquivo local não versionado, `scripts/pdf/termos-proibidos.txt`, uma expressão por linha. A saída deve ser vazia.
