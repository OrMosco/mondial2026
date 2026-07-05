import { BracketState } from '../bracket/bracketModel';

export interface BracketProvider {
  name: string;
  /** True when running on bundled sample data (no live key configured). */
  isSample: boolean;
  getBracket(): Promise<BracketState>;
}
