export type Domain = 'chemistry' | 'physics' | 'math' | 'biology' | 'circuit' | 'logic';

export interface ClassificationResult {
  domain: Domain;
  subDomain: string;
  confidence: number;
  visualizationType: 'mermaid' | 'reactflow' | 'smiles' | 'plotly' | 'latex' | 'circuitjs';
}

export function classifyPrompt(prompt: string): ClassificationResult {
  const p = prompt.toLowerCase();
  if (/(resistor|voltage|current|kirchhoff|ohm)/.test(p)) return { domain: 'circuit', subDomain: 'dc_circuits', confidence: 0.8, visualizationType: 'circuitjs' };
  if (/(derivative|integral|quadratic|equation|graph)/.test(p)) return { domain: 'math', subDomain: 'algebra', confidence: 0.8, visualizationType: 'plotly' };
  if (/(cell|dna|protein|photosynthesis)/.test(p)) return { domain: 'biology', subDomain: 'cell_biology', confidence: 0.75, visualizationType: 'mermaid' };
  return { domain: 'logic', subDomain: 'algorithms', confidence: 0.65, visualizationType: 'mermaid' };
}
