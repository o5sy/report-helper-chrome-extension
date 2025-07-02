interface GeminiApiKeyInputProps {
  key: string;
  onChange: (value: string) => void;
}

function GeminiApiKeyInput({ key, onChange }: GeminiApiKeyInputProps) {
  return (
    <div className="mb-4 border-t pt-4">
      <p className="text-sm font-medium mb-2">Gemini API 설정:</p>
      <input
        type="password"
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
        placeholder="Gemini API 키를 입력하세요"
        value={key}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-gray-500 mb-3">
        API 키는 브라우저에만 저장되며 외부로 전송되지 않습니다.
      </p>
    </div>
  );
}

export default GeminiApiKeyInput;
