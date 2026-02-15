import { PromptInput } from '../components/input/PromptInput';
import { InputModeSelector } from '../components/input/InputModeSelector';
import { ComplexitySlider } from '../components/input/ComplexitySlider';
import { VisualizerDisplay } from '../components/visualizer/VisualizerDisplay';
import { StepByStep } from '../components/explanation/StepByStep';
import { ProgressTracker } from '../components/learning/ProgressTracker';

export default function HomePage() {
  return (
    <main className="container">
      <header>
        <h1>NEXUS STEM AI Visualizer (No-Cost Build)</h1>
        <p>Architecture-aligned Next.js app scaffold with local deterministic renderers.</p>
      </header>
      <section className="grid">
        <aside>
          <InputModeSelector />
          <PromptInput />
          <ComplexitySlider />
          <ProgressTracker />
        </aside>
        <article>
          <VisualizerDisplay />
          <StepByStep />
        </article>
      </section>
    </main>
  );
}
