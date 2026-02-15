export function PromptInput() {
  return (
    <div className="panel">
      <h3>Prompt</h3>
      <textarea rows={5} defaultValue="Draw a circuit with V=9 and R=220" style={{ width: '100%' }} />
    </div>
  );
}
