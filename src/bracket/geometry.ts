// Pure radial-bracket geometry — ported verbatim from the design export's DCLogic.
// Coordinate space is a 980x980 SVG viewBox; everything is derived from it.

export const VIEW = 980;
export const CX = 490;
export const CY = 490;

// Ring radius per level. Index 0 = outer leaves (flags), 1..4 = junctions,
// 5 = center (trophy). 32 -> 16 -> 8 -> 4 -> 2 -> 1.
export const R = [400, 300, 220, 150, 80, 0] as const;
export const FLAG_R = 33; // outer flag circle radius in viewBox units
export const NUM_LEAVES = 32;
export const NUM_ROUNDS = 5; // levels 1..5

const D2R = Math.PI / 180;
const f1 = (n: number) => Number(n.toFixed(1));

export interface Pt {
  x: number;
  y: number;
}

/** Polar -> cartesian, 0deg at top, clockwise (matches the export). */
export function pt(angleDeg: number, r: number): Pt {
  return {
    x: CX + r * Math.sin(angleDeg * D2R),
    y: CY - r * Math.cos(angleDeg * D2R),
  };
}

/** Convert a viewBox coordinate to a CSS percentage for absolutely-placed overlays. */
export function pctX(x: number): number {
  return f1((x / VIEW) * 100);
}
export function pctY(y: number): number {
  return f1((y / VIEW) * 100);
}
export function pctSize(rUnits: number): number {
  return f1((rUnits * 2 / VIEW) * 100);
}

export interface LeafNode {
  angle: number;
}
export interface BranchNode {
  angle: number;
  a: TreeNode;
  b: TreeNode;
}
export type TreeNode = LeafNode | BranchNode;

/**
 * Build the binary tree of angles. levels[0] = 32 leaves, levels[5] = root.
 * Each branch node sits at the midpoint angle of its two children.
 */
export function buildLevels(): TreeNode[][] {
  const leaves: LeafNode[] = [];
  for (let i = 0; i < NUM_LEAVES; i++) {
    leaves.push({ angle: (i + 0.5) * 11.25 });
  }
  const levels: TreeNode[][] = [leaves];
  for (let L = 1; L <= NUM_ROUNDS; L++) {
    const prev = levels[L - 1];
    const cur: BranchNode[] = [];
    for (let j = 0; j < prev.length / 2; j++) {
      const a = prev[2 * j];
      const b = prev[2 * j + 1];
      cur.push({ angle: (a.angle + b.angle) / 2, a, b });
    }
    levels.push(cur);
  }
  return levels;
}

export interface Spoke {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export interface Connector {
  d: string;
}
export interface Dot {
  x: number;
  y: number;
}

export type BracketStyle = 'curved' | 'angular';

export interface Skeleton {
  spokes: Spoke[];
  connectors: Connector[];
  dots: Dot[];
}

/** Compute the static skeleton (spokes, connectors, junction dots). */
export function buildSkeleton(
  levels: TreeNode[][],
  style: BracketStyle = 'curved'
): Skeleton {
  const spokes: Spoke[] = [];
  const connectors: Connector[] = [];
  const dots: Dot[] = [];

  for (let L = 1; L <= NUM_ROUNDS; L++) {
    const Rp = R[L];
    const startRc = L === 1 ? R[0] - FLAG_R : R[L - 1];
    for (const node of levels[L] as BranchNode[]) {
      const a = node.a;
      const b = node.b;
      const sa = pt(a.angle, startRc);
      const ea = pt(a.angle, Rp);
      const sb = pt(b.angle, startRc);
      const eb = pt(b.angle, Rp);
      spokes.push({ x1: f1(sa.x), y1: f1(sa.y), x2: f1(ea.x), y2: f1(ea.y) });
      spokes.push({ x1: f1(sb.x), y1: f1(sb.y), x2: f1(eb.x), y2: f1(eb.y) });
      if (Rp > 0) {
        const pa = pt(a.angle, Rp);
        const pb = pt(b.angle, Rp);
        const d =
          style === 'angular'
            ? `M${f1(pa.x)} ${f1(pa.y)} L${f1(pb.x)} ${f1(pb.y)}`
            : `M${f1(pa.x)} ${f1(pa.y)} A${Rp} ${Rp} 0 0 1 ${f1(pb.x)} ${f1(pb.y)}`;
        connectors.push({ d });
        const pp = pt(node.angle, Rp);
        dots.push({ x: f1(pp.x), y: f1(pp.y) });
      }
    }
  }
  return { spokes, connectors, dots };
}

/** Angle of each leaf (R32 slot), in the fixed visual order. */
export function leafAngles(): number[] {
  const out: number[] = [];
  for (let i = 0; i < NUM_LEAVES; i++) out.push((i + 0.5) * 11.25);
  return out;
}

/** Angle of each node at a given level (level 1 has 16 nodes, ... level 5 has 1). */
export function nodeAngles(levels: TreeNode[][], level: number): number[] {
  return levels[level].map((n) => n.angle);
}
