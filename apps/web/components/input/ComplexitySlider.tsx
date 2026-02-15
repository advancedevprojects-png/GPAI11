export function ComplexitySlider() {
  return (
    <div className="panel">
      <h3>Complexity</h3>
      <input type="range" min={1} max={5} defaultValue={3} style={{ width: '100%' }} />
      <small>ELI5 ↔ PhD</small>
    </div>
  );
}
