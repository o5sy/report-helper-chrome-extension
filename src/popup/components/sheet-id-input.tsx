interface SheetIdInputProps {
  spreadsheetId: string;
  onChange: (value: string) => void;
}

function SheetIdInput({ spreadsheetId, onChange }: SheetIdInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">스프레드시트 ID</label>
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        placeholder="Google Sheets 스프레드시트 ID"
        value={spreadsheetId}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default SheetIdInput;
