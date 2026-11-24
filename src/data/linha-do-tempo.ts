/** Linha do tempo da página inicial: intervalos em meses (0 a 24), indicativos para 10 a 15 horas por semana. */
export const MESES = 24;
/** Um rótulo na régua a cada N meses. */
export const PASSO_REGUA = 3;

export type BarraNivel = { nivel: number; inicio: number; fim: number };
export type BarraFase = { fase: number; inicio: number; fim: number; rotulo: string };

export const BARRAS_NIVEL: BarraNivel[] = [
  { nivel: 1, inicio: 0, fim: 6 },
  { nivel: 2, inicio: 5, fim: 8 },
  { nivel: 3, inicio: 8, fim: 17 },
  { nivel: 4, inicio: 17, fim: 21 },
];

export const BARRAS_FASE: BarraFase[] = [
  { fase: 1, inicio: 0, fim: 4, rotulo: 'Fundamentos' },
  { fase: 2, inicio: 4, fim: 17, rotulo: 'Estágio, desde o 1º semestre' },
  { fase: 3, inicio: 17, fim: 24, rotulo: 'Júnior, depois 4 e 5' },
];
