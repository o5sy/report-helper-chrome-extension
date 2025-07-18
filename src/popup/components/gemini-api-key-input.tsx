interface GeminiApiKeyInputProps {
  apiKey: string;
  onChange: (value: string) => void;
}

function GeminiApiKeyInput({ apiKey, onChange }: GeminiApiKeyInputProps) {
  return (
    <div className="mb-4 border-t pt-4">
      <p className="mb-2 text-sm font-medium">Gemini API 키</p>
      <input
        type="password"
        className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        placeholder="Gemini API 키를 입력하세요"
        value={apiKey}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="mb-3 text-xs text-gray-500">
        API 키는 브라우저에만 저장되며 외부로 전송되지 않습니다.
      </p>
    </div>
  );
}

export default GeminiApiKeyInput;
