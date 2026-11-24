// Verifica os pares de cor de texto/fundo dos dois temas (WCAG AA: 4.5 para texto, 3 para elementos grandes/graficos).
const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const T = {
  escuro: { bg: '#0B0D10', surface: '#0F1216', checkOff: '#646E7E', surface2: '#12161B', alt: '#0D1014', footer: '#090B0E', text: '#E8EAED', text2: '#A3A9B2', muted: '#8E949D', accent: '#8AB4FF', accentInk: '#0B0D10', accentSoft: '#111A27', link: '#C9CDD3',
    tl: [['#8AB4FF', '#0B0D10'], ['#5E86C9', '#0B0D10'], ['#2D4672', '#E8EAED'], ['#1E2D47', '#E8EAED']], inv: ['#E8EAED', '#0B0D10', '#3A414B', '#2D4672'], avatar: ['#1E2D47', '#A9C6FF'], careerInk: '#C9D8F2', stroke: '#262B33', contorno: '#5C6470', codigo: { bg: '#0F1216', comentario: '#8B949E', texto: '#E6EDF3', chave: '#FF7B72', str: '#A5D6FF', fn: '#D2A8FF', num: '#79C0FF', var: '#FFA657', tag: '#7EE787' } },
  claro: { bg: '#F7F8FA', surface: '#FFFFFF', checkOff: '#7D8693', surface2: '#F1F3F7', alt: '#F1F3F7', footer: '#ECEFF4', text: '#0E1116', text2: '#4A5260', muted: '#5B6370', accent: '#2F5FB3', accentInk: '#FFFFFF', accentSoft: '#EAF1FC', link: '#2B323D',
    tl: [['#2F5FB3', '#FFFFFF'], ['#6F95D6', '#0E1116'], ['#A9C0E8', '#0E1116'], ['#C9D8F2', '#0E1116']], inv: ['#0E1116', '#F7F8FA', '#C4CAD4', '#8AB4FF'], avatar: ['#DCE7FA', '#1F4A96'], careerInk: '#1F4A96', stroke: '#CBD2DC', contorno: '#7D8693', codigo: { bg: '#FFFFFF', comentario: '#6E7781', texto: '#1F2328', chave: '#CF222E', str: '#0A3069', fn: '#8250DF', num: '#0550AE', var: '#953800', tag: '#116329' } },
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
