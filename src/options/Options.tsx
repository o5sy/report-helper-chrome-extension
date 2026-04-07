import { useEffect, useState } from "react";

import type { ReferenceData } from "@/services/reference-store";

const URLS_STORAGE_KEY = "referenceUrlsText";
const REFERENCE_DATA_KEY = "referenceData";

export function Options() {
  const [urlsText, setUrlsText] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null);
  const [tonePrompt, setTonePrompt] = useState("");
  const [isSavingTone, setIsSavingTone] = useState(false);
  const [toneSaveMessage, setToneSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const result = await globalThis.chrome?.storage?.local?.get([
        URLS_STORAGE_KEY,
        REFERENCE_DATA_KEY,
      ]);
      if (result?.[URLS_STORAGE_KEY]) {
        setUrlsText(result[URLS_STORAGE_KEY] as string);
      }
      if (result?.[REFERENCE_DATA_KEY]) {
        const data = result[REFERENCE_DATA_KEY] as ReferenceData;
        setReferenceData(data);
        setTonePrompt(data.toneSystemPrompt || "");
      }
    };
    load();
  }, []);

  const handleSync = async () => {
    const trimmed = urlsText.trim();
    if (!trimmed) {
      setSyncMessage({ type: "error", text: "시트 URL 또는 ID를 입력해주세요." });
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);

    await globalThis.chrome?.storage?.local?.set({ [URLS_STORAGE_KEY]: trimmed });

    try {
      const response = await globalThis.chrome?.runtime?.sendMessage({
        type: "SYNC_REFERENCE",
        payload: { urlsText: trimmed },
      });

      if (response?.success) {
        setSyncMessage({
          type: "success",
          text: `동기화 완료 — 질문 ${response.data?.questionCount ?? 0}개`,
        });
        // 저장된 데이터 재조회
        const result = await globalThis.chrome?.storage?.local?.get([REFERENCE_DATA_KEY]);
        if (result?.[REFERENCE_DATA_KEY]) {
          const data = result[REFERENCE_DATA_KEY] as ReferenceData;
          setReferenceData(data);
          setTonePrompt(data.toneSystemPrompt || "");
        }
      } else {
        setSyncMessage({
          type: "error",
          text: response?.data?.error || response?.error || "동기화 중 오류가 발생했습니다.",
        });
      }
    } catch (error) {
      setSyncMessage({
        type: "error",
        text: `오류: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveTonePrompt = async () => {
    setIsSavingTone(true);
    setToneSaveMessage(null);
    try {
      const result = await globalThis.chrome?.storage?.local?.get([REFERENCE_DATA_KEY]);
      const data = result?.[REFERENCE_DATA_KEY] as ReferenceData | undefined;
      if (!data) {
        setToneSaveMessage("먼저 동기화를 실행해주세요.");
        return;
      }
      await globalThis.chrome?.storage?.local?.set({
        [REFERENCE_DATA_KEY]: { ...data, toneSystemPrompt: tonePrompt },
      });
      setToneSaveMessage("저장되었습니다.");
    } catch {
      setToneSaveMessage("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSavingTone(false);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <h1 className="text-xl font-semibold">레퍼런스 설정</h1>

      {/* 동기화 섹션 */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-gray-700">멘토링 일지 시트 동기화</h2>
        <p className="text-xs text-gray-500">
          시트 URL 또는 ID를 줄바꿈/쉼표로 구분해서 붙여넣으세요.
        </p>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          rows={4}
          placeholder={
            "https://docs.google.com/spreadsheets/d/...\nhttps://docs.google.com/spreadsheets/d/..."
          }
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
        />
        <button
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? "동기화 중..." : "동기화"}
        </button>

        {syncMessage && (
          <p
            className={`text-xs ${
              syncMessage.type === "success" ? "text-green-700" : "text-red-600"
            }`}
          >
            {syncMessage.text}
          </p>
        )}

        {referenceData && (
          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 space-y-1">
            <p>마지막 동기화: {formatDate(referenceData.lastSynced)}</p>
            <p>질문 수: {Object.keys(referenceData.questions).length}개</p>
            <p>시트 수: {referenceData.sourceSheetIds.length}개</p>
          </div>
        )}
      </section>

      {/* 말투/톤 시스템 프롬프트 섹션 */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-gray-700">말투/톤 시스템 프롬프트</h2>
        <p className="text-xs text-gray-500">
          동기화 시 자동 생성됩니다. 직접 수정도 가능합니다.
        </p>
        <textarea
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono"
          rows={12}
          placeholder="동기화를 실행하면 자동으로 생성됩니다."
          value={tonePrompt}
          onChange={(e) => setTonePrompt(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSaveTonePrompt}
            disabled={isSavingTone}
          >
            {isSavingTone ? "저장 중..." : "저장"}
          </button>
          {toneSaveMessage && (
            <p className="text-xs text-gray-600">{toneSaveMessage}</p>
          )}
        </div>
      </section>
    </div>
  );
}