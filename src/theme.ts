// Palette and theme variants, ported from the original design export's DCLogic.
export type PaperColor = '#F1EDE2' | '#FFFFFF' | '#16140F';

export interface Theme {
  paper: string;
  ink: string;
  gold: string;
  ringColor: string;
  dark: boolean;
}

export function makeTheme(paper: PaperColor = '#F1EDE2'): Theme {
  const dark = paper.toLowerCase() === '#16140f';
  return {
    paper,
    ink: dark ? '#EAE3D4' : '#1A1815',
    gold: '#C2A663',
    ringColor: dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.16)',
    dark,
  };
}
