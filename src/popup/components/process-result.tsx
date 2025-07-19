type ProcessInProgress = {
  status: 'in-progress';
  message: string;
};

type ProcessCompleted = {
  status: 'completed';
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  processingTime: number;
};

export type ProcessResultProps = ProcessInProgress | ProcessCompleted;

function ProcessResult(props: ProcessResultProps) {
  const isSuccess =
    props.status === 'completed' && props.successCount === props.processedCount;

  return (
    <div className="mt-4 flex flex-col gap-2 rounded border p-3 text-xs">
      <h4 className="font-medium">처리 결과:</h4>
      <div
        className={`rounded bg-gray-100 p-3 ${
          isSuccess ? 'bg-green-50' : 'bg-gray-100'
        }`}
      >
        {props.status === 'in-progress' ? (
          <div className="text-gray-700">
            <p>{props.message}</p>
          </div>
        ) : (
          // 처리 완료
          <div className={`${isSuccess ? 'text-green-700' : 'text-gray-700'}`}>
            <p>전체 항목: {props.processedCount}개</p>
            <p>성공: {props.successCount}개</p>
            <p>실패: {props.errorCount}개</p>
          </div>
        )}
      </div>

      {props.status === 'completed' && props.errorCount > 0 && (
        // 오류 목록
        <div className="rounded bg-yellow-50 p-3">
          <h5 className="mb-1 font-medium text-yellow-800">오류 목록</h5>
          <ul className="list-inside list-disc text-sm text-yellow-700">
            {!props.errors.length ? (
              <p>알 수 없는 오류가 발생했습니다.</p>
            ) : (
              props.errors.map((error, index) => <li key={index}>{error}</li>)
            )}
          </ul>
        </div>
      )}
      {props.status === 'completed' && (
        <div className="text-xs text-gray-600">
          소요시간: {(props.processingTime / 1000).toFixed(2)}초
        </div>
      )}
    </div>
  );
}

export default ProcessResult;
