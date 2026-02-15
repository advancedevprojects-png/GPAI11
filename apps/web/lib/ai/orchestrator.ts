import { classifyPrompt } from './classifier';

export function orchestrate(prompt: string) {
  const classification = classifyPrompt(prompt);
  return {
    classification,
    renderer: classification.visualizationType,
    qualityGate: 'local-deterministic',
  };
}
