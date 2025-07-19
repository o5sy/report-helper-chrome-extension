import ProcessResult, { ProcessResultProps } from './process-result';
import React, { useEffect, useState } from 'react';

import type { BatchFeedbackResult } from '@/services/feedback-generator';
import Button from './ui/button';

interface FeedbackTestProps {
  geminiApiKey: string;
  spreadsheetId: string;
}

const FeedbackTest: React.FC<FeedbackTestProps> = ({
  geminiApiKey,
  spreadsheetId,
}) => {
  const [questionColumn, setQuestionColumn] = useState<string>('');
  const [answerColumn, setAnswerColumn] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [startRow, setStartRow] = useState<number>(2);
  const [endRow, setEndRow] = useState<number>(10);
  const [batchResult, setBatchResult] = useState<BatchFeedbackResult | null>(
    null
  );
  const [isBatchLoading, setIsBatchLoading] = useState<boolean>(false);
  const [batchProcessingTime, setBatchProcessingTime] = useState<number | null>(
    null
  );

  // Load saved data from chrome.storage
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        if (window.chrome?.storage?.local) {
          const result = await window.chrome.storage.local.get([
            'feedbackTestData',
          ]);
          if (result.feedbackTestData) {
            const data = result.feedbackTestData;
            setQuestionColumn(data.questionColumn || '');
            setAnswerColumn(data.answerColumn || '');
            setTargetColumn(data.targetColumn || '');
            setStartRow(data.startRow || 2);
            setEndRow(data.endRow || 10);
          }
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    };

    loadSavedData();
  }, []);

  // TODO storage에 직접 접근 못하도록 수정
  // Save data to chrome.storage whenever values change
  useEffect(() => {
    const saveData = async () => {
      try {
        if (window.chrome?.storage?.local) {
          const dataToSave = {
            questionColumn,
            answerColumn,
            targetColumn,
            startRow,
            endRow,
          };
          await window.chrome.storage.local.set({
            feedbackTestData: dataToSave,
          });
        }
      } catch (error) {
        console.error('Failed to save feedback test data:', error);
      }
    };

    saveData();
  }, [questionColumn, answerColumn, targetColumn, startRow, endRow]);

  const handleBatchFeedback = async () => {
    // TODO 알림도 다른 ui(refinementResult)와 동일하게 처리
    if (!geminiApiKey) {
      alert('Gemini API Key가 필요합니다.');
      return;
    }

    if (
      !spreadsheetId.trim() ||
      !questionColumn.trim() ||
      !answerColumn.trim() ||
      !targetColumn.trim()
    ) {
      alert(
        '스프레드시트 ID, 질문 열, 답변 열, 피드백 열을 모두 입력해주세요.'
      );
      return;
    }

    if (startRow < 1 || endRow < startRow) {
      alert('올바른 행 범위를 입력해주세요.');
      return;
    }

    setIsBatchLoading(true);
    setBatchResult(null);
    setBatchProcessingTime(null);
    const startTime = Date.now();

    try {
      const questionRange = `${questionColumn}${startRow}:${questionColumn}${endRow}`;
      const answerRange = `${answerColumn}${startRow}:${answerColumn}${endRow}`;
      const targetRange = `${targetColumn}${startRow}:${targetColumn}${endRow}`;

      const response = await globalThis.chrome?.runtime?.sendMessage({
        type: 'GENERATE_FEEDBACK',
        payload: {
          spreadsheetId: spreadsheetId.trim(),
          sourceRange: {
            questionRange,
            answerRange,
          },
          targetRange: targetRange,
        },
      });

      const endTime = Date.now();
      setBatchProcessingTime(endTime - startTime);

      if (response.success) {
        setBatchResult(response.data);
        alert('피드백 생성이 완료되었습니다. 팝업을 닫아도 처리가 계속됩니다.');
      } else {
        setBatchResult({
          success: false,
          processedCount: 0,
          successCount: 0,
          errorCount: 1,
          errors: [response.error || '피드백 생성 중 오류가 발생했습니다.'],
        });
      }
    } catch (error) {
      const endTime = Date.now();
      setBatchProcessingTime(endTime - startTime);
      setBatchResult({
        success: false,
        processedCount: 0,
        successCount: 0,
        errorCount: 1,
        errors: [
          `피드백 생성 중 오류가 발생했습니다: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
      });
    } finally {
      setIsBatchLoading(false);
    }
  };

  const processResultProps: ProcessResultProps = isBatchLoading
    ? {
        status: 'in-progress',
        message: '피드백 생성 중...',
      }
    : {
        status: 'completed',
        processedCount: batchResult?.processedCount || 0,
        successCount: batchResult?.successCount || 0,
        errorCount: batchResult?.errorCount || 0,
        errors: batchResult?.errors || [],
        processingTime: batchProcessingTime || 0,
      };

  return (
    <>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-sm font-medium">질문 열</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="E"
              value={questionColumn}
              onChange={(e) => setQuestionColumn(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">답변 열</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="F"
              value={answerColumn}
              onChange={(e) => setAnswerColumn(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              피드백 출력 열
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="I"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-sm font-medium">시작 행</label>
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={startRow}
              onChange={(e) => setStartRow(parseInt(e.target.value))}
              onBlur={(e) => e.target.value === '' && setStartRow(0)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">종료 행</label>
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={endRow}
              onChange={(e) => setEndRow(parseInt(e.target.value))}
              onBlur={(e) => e.target.value === '' && setEndRow(0)}
            />
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleBatchFeedback}
          disabled={isBatchLoading || !geminiApiKey}
        >
          피드백 생성 실행
        </Button>

        {/* 처리 결과 */}
        {batchResult && <ProcessResult {...processResultProps} />}
      </div>
    </>
  );
};

export default FeedbackTest;
