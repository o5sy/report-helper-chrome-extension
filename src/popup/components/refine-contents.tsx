import ProcessResult, { ProcessResultProps } from './process-result';
import { useEffect, useState } from 'react';

import Button from './ui/button';
import { RefineAnswersMessage } from '@/background/message-handler';

type RefineResult = {
  success: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors: string[];
};

interface RefineContentsProps {
  geminiApiKey: string;
  spreadsheetId: string;
}

function RefineContents({ geminiApiKey, spreadsheetId }: RefineContentsProps) {
  const [sourceRange, setSourceRange] = useState<string>('D2:D3');
  const [targetRange, setTargetRange] = useState<string>('E2:E3');

  const [refinementResult, setRefinementResult] = useState<RefineResult>();
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const [isRefineLoading, setIsRefineLoading] = useState<boolean>(false);

  const processResultProps: ProcessResultProps = isRefineLoading
    ? {
        status: 'in-progress',
        message: '답변 정제 작업을 시작합니다...',
      }
    : {
        status: 'completed',
        processedCount: refinementResult?.processedCount || 0,
        successCount: refinementResult?.successCount || 0,
        errorCount: refinementResult?.errorCount || 0,
        errors: refinementResult?.errors || [],
        processingTime: processingTime || 0,
      };

  const handleRefineAnswers = async () => {
    if (!spreadsheetId.trim() || !geminiApiKey.trim()) {
      return;
    }

    setIsRefineLoading(true);
    const startTime = Date.now();

    try {
      setProcessingTime(null);

      const message: RefineAnswersMessage = {
        type: 'REFINE_ANSWERS',
        payload: {
          spreadsheetId: spreadsheetId.trim(),
          sourceRange: sourceRange.trim(),
          targetRange: targetRange.trim(),
          //   customPrompt: customPrompt.trim() || undefined,
        },
      };

      const response = await window.chrome.runtime.sendMessage(message);
      const endTime = Date.now();
      const duration = endTime - startTime;
      setProcessingTime(duration);

      if (response.success) {
        const result = response.data;
        setRefinementResult({
          success: true,
          processedCount: result.processedCount,
          successCount: result.successCount,
          errorCount: result.errorCount,
          errors: result.errors,
        });
      } else {
        setRefinementResult({
          success: false,
          processedCount: 0,
          successCount: 0,
          errorCount: 1,
          errors: [response.error || '답변 정제 중 오류가 발생했습니다.'],
        });
      }
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      setProcessingTime(duration);

      setRefinementResult({
        success: false,
        processedCount: 0,
        successCount: 0,
        errorCount: 1,
        errors: [
          `예외 발생: ${error instanceof Error ? error.message : String(error)}`,
        ],
      });
    } finally {
      setIsRefineLoading(false);
    }
  };

  // Load saved data from chrome.storage
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        if (window.chrome?.storage?.local) {
          const result = await window.chrome.storage.local.get([
            'refineContentsData',
          ]);
          if (result.refineContentsData) {
            const data = result.refineContentsData;
            setSourceRange(data.sourceRange || 'D2:D3');
            setTargetRange(data.targetRange || 'E2:E3');
          }
        }
      } catch (error) {
        console.error('Failed to load saved refine contents data:', error);
      }
    };

    loadSavedData();
  }, []);

  // Save data to chrome.storage whenever values change
  useEffect(() => {
    const saveData = async () => {
      try {
        if (window.chrome?.storage?.local) {
          const dataToSave = {
            sourceRange,
            targetRange,
          };
          await window.chrome.storage.local.set({
            refineContentsData: dataToSave,
          });
        }
      } catch (error) {
        console.error('Failed to save refine contents data:', error);
      }
    };

    saveData();
  }, [sourceRange, targetRange]);

  return (
    <>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-sm font-medium">원본 범위</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="D2:D3"
              value={sourceRange}
              onChange={(e) => setSourceRange(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">출력 범위</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="E2:E3"
              value={targetRange}
              onChange={(e) => setTargetRange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button
        className="mt-3 w-full"
        onClick={handleRefineAnswers}
        disabled={
          !geminiApiKey.trim() || !spreadsheetId.trim() || isRefineLoading
        }
      >
        답변 정제 실행
      </Button>

      {/* 처리 결과 */}
      {refinementResult && <ProcessResult {...processResultProps} />}
    </>
  );
}

export default RefineContents;
