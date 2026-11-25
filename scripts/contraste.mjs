// Verifica os pares de cor de texto/fundo dos dois temas (WCAG AA: 4.5 para texto, 3 para elementos grandes/graficos).
const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const T = {
  escuro: { bg: '#0E0E10', surface: '#131315', checkOff: '#6E6E73', surface2: '#18181B', alt: '#111113', footer: '#0B0B0D', text: '#EDEDED', text2: '#A3A3A3', muted: '#8F8F8F', accent: '#FAFAFA', accentInk: '#0E0E10', accentSoft: '#1C1C1F', link: '#D4D4D4',
    tl: [['#FAFAFA', '#0E0E10'], ['#9E9E9E', '#0E0E10'], ['#3E3E42', '#EDEDED'], ['#252528', '#EDEDED'], ['#0E0E10', '#EDEDED']], inv: ['#FAFAFA', '#0E0E10', '#3E3E3E', '#505050'], avatar: ['#252528', '#DEDEDE'], careerInk: '#DEDEDE', stroke: '#2E2E32', contorno: '#6E6E73', codigo: { bg: '#131315', comentario: '#8B949E', texto: '#E6EDF3', chave: '#FF7B72', str: '#A5D6FF', fn: '#D2A8FF', num: '#79C0FF', var: '#FFA657', tag: '#7EE787' } },
  claro: { bg: '#FFFFFF', surface: '#FFFFFF', checkOff: '#8A8A8A', surface2: '#FAFAFA', alt: '#FAFAFA', footer: '#FAFAFA', text: '#171717', text2: '#505050', muted: '#6B6B6B', accent: '#09090B', accentInk: '#FFFFFF', accentSoft: '#F3F3F3', link: '#3E3E3E',
    tl: [['#09090B', '#FFFFFF'], ['#6B6B6B', '#FFFFFF'], ['#CECECE', '#09090B'], ['#EEEEEE', '#09090B'], ['#FFFFFF', '#09090B']], inv: ['#09090B', '#FAFAFA', '#C4C4C4', '#A3A3A3'], avatar: ['#EEEEEE', '#171717'], careerInk: '#252525', stroke: '#DEDEDE', contorno: '#8A8A8A', codigo: { bg: '#FFFFFF', comentario: '#6E7781', texto: '#1F2328', chave: '#CF222E', str: '#0A3069', fn: '#8250DF', num: '#0550AE', var: '#953800', tag: '#116329' } },
};
let falhas = 0;
const linhas = [];
const v = (tema, rot, fg, bg, min = 4.5) => { const r = razao(fg, bg); const ok = r >= min; if (!ok) falhas++; linhas.push(`${ok ? 'ok  ' : 'FALHA'} ${tema.padEnd(6)} ${rot.padEnd(34)} ${fg} em ${bg}  ${r.toFixed(2)}:1 (min ${min})`); };
for (const [n, t] of Object.entries(T)) {
  for (const f of ['bg', 'surface', 'surface2', 'alt', 'footer']) {
    v(n, `texto em ${f}`, t.text, t[f]); v(n, `texto-2 em ${f}`, t.text2, t[f]); v(n, `muted em ${f}`, t.muted, t[f]); v(n, `accent em ${f}`, t.accent, t[f]); v(n, `link em ${f}`, t.link, t[f]);
  }
  v(n, 'accent em accent-soft', t.accent, t.accentSoft);
  v(n, 'texto em accent-soft', t.text, t.accentSoft);
  v(n, 'ink em accent (botao/check)', t.accentInk, t.accent);
  v(n, 'ink botao primario', t.inv[1], t.inv[0]);
  v(n, 'texto-2 inverso', t.inv[2], t.inv[0]);
  v(n, 'kicker inverso', t.inv[3], t.inv[0]);
  t.tl.forEach(([bg, ink], i) => v(n, `barra nivel ${i + 1}`, ink, bg));
  v(n, 'iniciais OF', t.avatar[1], t.avatar[0]);
  v(n, 'anel do check (nao-texto) em surface', t.checkOff, t.surface, 3);
  v(n, 'anel do check (nao-texto) em bg', t.checkOff, t.bg, 3);
  v(n, 'carreira em surface', t.careerInk, t.surface);
  v(n, 'carreira em accent-soft', t.careerInk, t.accentSoft);
  // Task 15: RAI.E em contorno (hero e rodape) e trilho/no da rota (nao-texto, >=3:1)
  v(n, 'contorno RAI.E em bg (hero)', t.contorno, t.bg, 3);
  v(n, 'contorno RAI.E em footer', t.contorno, t.footer, 3);
  v(n, 'ponto da rota (accent) em bg', t.accent, t.bg, 3);
  // paginas internas: selos/etiquetas e marcar
  v(n, 'texto-2 em accent-soft', t.text2, t.accentSoft);
  // blocos de codigo (Shiki github-*-default sobre --surface)
  for (const [k, cor] of Object.entries(t.codigo)) if (k !== 'bg') v(n, `codigo ${k}`, cor, t.codigo.bg);
}
console.log(linhas.join('\n'));
console.log(falhas ? `\n${falhas} falha(s)` : '\ntodos os pares passam');
process.exit(falhas ? 1 : 0);
