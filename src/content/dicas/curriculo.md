---
titulo: "Currículo"
fase: 2
grupo: "Estágio"
ordem: 2
resumo: "Um currículo de uma página, legível por sistemas de triagem e sem enfeite. Descreva cada projeto como problema, decisão e resultado medido, e veja uma linha fraca reescrita antes e depois."
tempo: "3 a 4 horas na primeira versão"
ferramentas:
  - "Google Docs ou Word"
  - "Exportação em PDF"
relacionados:
  - "onde-buscar-vagas"
  - "linkedin-desde-ja"
  - "github-como-vitrine"
  - "candidatura-com-foco"
referencias:
  - titulo: "Gupy: dicas e boas práticas para o seu currículo"
    url: "https://www.gupy.io/blog-do-emprego/boas-praticas-curriculo-gupy"
    tipo: "Artigo"
    idioma: "pt"
    gratuito: true
  - titulo: "Gupy: currículo para estágio"
    url: "https://www.gupy.io/blog-do-emprego/curriculo-para-estagio"
    tipo: "Artigo"
    idioma: "pt"
    gratuito: true
  - titulo: "Tech Interview Handbook: Resume"
    url: "https://www.techinterviewhandbook.org/resume/"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "MIT CAPD: Resumes"
    url: "https://capd.mit.edu/resources/resumes/"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "Harvard: Create a Resume/CV or Cover Letter"
    url: "https://careerservices.fas.harvard.edu/channels/create-a-resume-cv-or-cover-letter/"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
revisado: "2026-11-24"
rascunho: false
---

## O que é

O currículo é um documento de uma página que mostra, em poucos segundos de leitura, que você resolve problemas parecidos com os da vaga. Para estágio e primeiro emprego em AI Engineering, os projetos são o centro do documento. Formação, cursos e idiomas entram como apoio.

## Por que importa

No Brasil, boa parte das vagas de estágio e de tecnologia passa por plataformas de recrutamento como Gupy, que podem ler o seu currículo e comparar o texto com a descrição da vaga antes de alguém abri-lo. Depois dessa triagem, quem recruta lê rápido e procura evidência, não adjetivo.

Um currículo claro não garante entrevista. Ele evita que você seja descartado por motivo de forma, e dá ao entrevistador perguntas concretas para fazer.

## Passo a passo

1. **Leia de três a cinco anúncios da vaga que você quer.** Anote as palavras que se repetem, como Python, SQL, APIs, RAG, Docker. Use os mesmos termos quando você de fato tiver a experiência. Escreva no idioma do anúncio.
2. **Use um modelo simples, de uma coluna.** Títulos de seção comuns (Formação, Projetos, Experiência, Habilidades), fonte padrão, sem tabelas, ícones ou barras de nível. Exporte em PDF com texto selecionável.
3. **Coloque o cabeçalho em uma linha ou duas.** Nome, cidade e estado, e-mail, telefone, LinkedIn e GitHub. Sem foto, idade, estado civil ou documentos: não ajudam na triagem e expõem dados pessoais.
4. **Escreva a seção de projetos.** Dois ou três projetos, cada um com link para o repositório e duas ou três linhas no formato problema, decisão e resultado medido.
5. **Inclua experiência, mesmo fora de TI.** Monitoria, iniciação científica, trabalho voluntário e emprego em outra área contam. Descreva o que você fez e o resultado, não só o cargo.
6. **Liste habilidades que você consegue defender numa entrevista.** Se não consegue explicar por cinco minutos, tire.
7. **Revise.** Leia em voz alta, peça para outra pessoa ler e confira se cabe em uma página.

## Exemplo

Uma linha de projeto, antes:

> Desenvolvi um chatbot com Python, LangChain e IA generativa para responder perguntas sobre documentos.

O problema: diz quais ferramentas você usou, mas não diz para quê, que decisão você tomou nem se funcionou.

A mesma linha, depois (números ilustrativos):

> Criei uma busca com citação de página em 12 manuais técnicos públicos (Python, PostgreSQL com pgvector). Troquei o corte de texto em tamanho fixo por corte por seção e subi o acerto da busca (recall@5) de 62% para 81% em 30 perguntas de teste.

Agora a linha tem o problema (achar informação em manuais), a decisão (como cortar o texto) e o resultado medido. Recall@5 é a fração das perguntas de teste em que o trecho certo aparece entre os cinco primeiros resultados. No seu currículo, os números precisam ser seus e estar no README do projeto (o arquivo de apresentação do repositório), porque o entrevistador vai perguntar como você mediu.

## Erros comuns

- **Listar tecnologias sem contexto.** Uma linha com dez ferramentas diz menos que um projeto com resultado.
- **Usar layout de duas colunas, gráficos ou texto dentro de imagem.** Sistemas de triagem podem ler a ordem errada ou não ler nada.
- **Passar de uma página no início da carreira.** Corte o que não tem relação com a vaga.
- **Escrever objetivo genérico.** "Busco oportunidade para crescer" ocupa espaço. Se usar um resumo no topo, diga o que você estuda e o que já construiu.
- **Inventar ou inflar resultado.** Qualquer número no currículo vira pergunta na entrevista.
- **Mandar o mesmo arquivo para toda vaga.** Ajuste a ordem dos projetos e os termos ao anúncio.

## Checklist

- Cabe em uma página, em PDF com texto selecionável.
- Layout de uma coluna, sem tabelas, ícones, foto ou dados pessoais além do contato.
- LinkedIn e GitHub no cabeçalho, com links funcionando.
- Dois ou três projetos com link e linhas no formato problema, decisão e resultado.
- Todo número tem fonte no README do projeto.
- Termos da vaga aparecem onde você tem a experiência de fato.
- Escrito no idioma do anúncio.
- Revisado por outra pessoa.
