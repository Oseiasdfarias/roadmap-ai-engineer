---
titulo: "Technical interview"
fase: 3
grupo: "Junior developer"
ordem: 1
resumo: "How to prepare for live coding in Python, explain your projects from the inside, answer AI questions and think out loud. Justifying decisions is worth more than getting it right the first time."
relacionados:
  - "entrevista-comportamental"
  - "teste-pratico"
  - "design-de-sistemas-com-llm"
referencias:
  - titulo: "Tech Interview Handbook: Preparation"
    url: "https://www.techinterviewhandbook.org/coding-interview-prep/"
    tipo: "Artigo"
    idioma: "en"
    gratuito: true
  - titulo: "The Python Tutorial"
    url: "https://docs.python.org/3/tutorial/"
    tipo: "Docs"
    idioma: "en"
    gratuito: true
revisado: "2026-11-25"
rascunho: false
---

## What it is

The technical interview is the conversation where the team checks that you can do the job. For junior roles, it usually combines three parts: a live programming exercise (live coding, usually in Python), questions about your projects and, for AI-related roles, questions about how LLMs work. The format varies by company, so ask the recruiter what to expect.

## Why it matters

Interviewers want to see how you think, not just the final code. Someone who explains their reasoning, tests the result and asks for clarification inspires more confidence than someone who types in silence and gets it right. It is also where the difference shows between someone who built a project and someone who only copied a tutorial: the questions go after your decisions.

Preparing reduces nerves, but it does not guarantee you will pass.

## Step by step

1. **Practice Python without AI help.** Solve short problems with lists, dictionaries, strings and functions, preferably in a simple editor, with a timer.
2. **Think out loud.** Say what you understood from the prompt, give a simple example, describe the idea before writing and test with a small case at the end.
3. **Ask for clarification.** Ask about empty inputs, sizes and output format before coding.
4. **Prepare each portfolio project from the inside.** For each one, write half a page with the problem, the architecture, three decisions and why you chose each one, a mistake you fixed and what you would change.
5. **Study the most common AI questions**: what an embedding is (a vector that represents the meaning of a text), how RAG works (fetching passages from documents and handing them to the model), why the model hallucinates (makes up an answer that looks true), when to use a workflow (a fixed flow of steps) instead of an agent (a model that decides the steps), how you measured quality. Use the roadmap's topic pages as a guide.
6. **Do mock interviews with another person**, once a week, and ask for feedback on clarity.
7. **Have a plan for when you get stuck.** If you do not know, say what you know, what you would try and how you would find out.

## Example

Question: "Why did you use hybrid search in your project?"

Answer, before:

> Because I saw in a tutorial that it works better.

After (illustrative numbers):

> Search by meaning missed fault codes like "F0021" (an illustrative code), because the code has no meaning for the model. I combined it with keyword search. I measured it with 30 test questions: the right passage among the first five went from 62% to 81% (illustrative numbers, use yours). If the number of manuals grew, I would reassess the cost of reranking (reordering the best results with an extra model).

The second answer shows the cause, the decision, the measurement and awareness of the limits.

## Common mistakes

- **Staying silent during the exercise.** The interviewer does not know what you are thinking.
- **Starting to code without understanding the problem.**
- **Memorizing answers.** Deep-dive questions knock down memorized answers.
- **Talking about the project as if it were just the library.** "I used LangChain" explains nothing. Explain the problem and the decision.
- **Overstating what you know.** If you do not know, say so and describe how you would investigate.
- **Relying on AI to practice.** There will be none in the interview, and you need to know what the code does.

## Checklist

- Ten to twenty Python exercises solved without AI help.
- Half a page per project: problem, architecture, decisions, mistakes and improvements.
- Answers on the main AI subjects rehearsed out loud.
- At least one mock interview with another person.
- Video setup and editor tested before the interview.
- Questions for the team prepared.
