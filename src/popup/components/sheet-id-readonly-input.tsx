interface SheetIdReadonlyInputProps {
  spreadsheetId: string;
}

function SheetIdReadonlyInput({ spreadsheetId }: SheetIdReadonlyInputProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">스프레드시트 ID</label>
      <input
        type="text"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        placeholder="Google Sheets 스프레드시트 ID"
        value={spreadsheetId}
        readOnly
      />
    </div>
  );
}

export default SheetIdReadonlyInput;
