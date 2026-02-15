export function StepByStep() {
  return (
    <section className="panel">
      <h3>Step-by-step explanation</h3>
      <ol>
        <li>Classify prompt domain.</li>
        <li>Generate structured visualization payload.</li>
        <li>Render with domain renderer.</li>
        <li>Export SVG/PNG/PDF/LaTeX.</li>
      </ol>
    </section>
  );
}
