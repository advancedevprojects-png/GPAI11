export function InputModeSelector() {
  return (
    <div className="panel">
      <h3>Input Mode</h3>
      <select style={{ width: '100%' }} defaultValue="text">
        <option value="text">Text</option>
        <option value="voice">Voice</option>
        <option value="camera">Camera / OCR</option>
        <option value="sketch">Sketch</option>
        <option value="file">File Upload</option>
      </select>
    </div>
  );
}
