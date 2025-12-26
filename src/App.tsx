import { useCallback, useEffect, useState } from 'react';
import { theme } from './theme/theme';
import { Archive } from './components/Archive';
import { Total } from './components/Total';
import { DeleteStudyLog, getAllStudyLog, addStudyLog, EditStudyLog } from './utils/supabaseFunctions/supabaseFunctions';
import { InputForm } from './components/InputForm';
import { ChakraProvider, Heading } from '@chakra-ui/react';
import type { Record } from './domain/record';

// App コンポーネント：学習ログの取得・登録・削除を行う
export const App = () => {
  const [records, setRecords] = useState<Record[]>([]); // records: サーバーから取得した完全なレコード配列（id, careated_at を含む）
  const [totalTime, setTotalTime] = useState<number>(0); // 合計時間
  const [isLoading, setIsLoading] = useState<boolean>(true); // 初回ロード中フラグ

  // 登録ボタンクリックハンドラ
  const onSubmitRegistration = useCallback(async (data: { detail: string; time: number }): Promise<boolean> => {
    const { detail, time } = data;

    const inserted = await addStudyLog(detail, time);
    if (!inserted) return false;

    // addStudyLog の返却型は `time: number | null` になり得るため、
    // App 側のドメイン型（Record[]）に合わせて null を吸収してから state に追加する
    const normalized: Record = {
      ...inserted,
      time: inserted.time ?? 0,
    };

    // DBが生成した id や created_at を持つレコードを追加
    setRecords((prev) => [...prev, normalized]);
    setTotalTime((prev) => prev + normalized.time);

    return true;
  }, []);

  //編集ボタンのクリックハンドラ(title,timeを編集)
  const onClickEditRecord = useCallback(
    async (id: string, title: string, time: number) => {
      const edited = await EditStudyLog(id, title, time);
      if (!edited) return false;

      //編集したレコードでstateを更新
      setRecords((prev) => prev.map((record) => (record.id === id ? { ...record, title: edited.title, time: edited.time ?? 0 } : record)));

      //合計時間を再計算
      const sum = records.reduce((acc, record) => {
        if (record.id === id) {
          return acc + (edited.time ?? 0);
        }
        return acc + Number(record.time || 0);
      }, 0);
      setTotalTime(sum);

      return true;
    },
    [records]
  );

  // 学習ログ取得関数
  const getStudyLog = async () => {
    try {
      const studyLogs = await getAllStudyLog();
      setRecords(studyLogs);

      const sum = studyLogs.reduce((acc, record) => acc + Number(record.time || 0), 0);
      setTotalTime(sum);
    } finally {
      // 成功・失敗に関係なくロード中は解除する
      setIsLoading(false);
    }
  };

  // 削除処理：ローカルの state を先に更新して UX を良くし、その後サーバーに削除を依頼
  const onClickDeleteRecord = useCallback(
    async (recordId: string) => {
      // ローカルから即時に削除
      setRecords((prev) => prev.filter((r) => r.id !== recordId));

      // 合計時間を更新（削除対象の time を差し引く）
      setTotalTime((prev) => {
        const target = records.find((record) => record.id === recordId);
        return target ? prev - Number(target.time || 0) : prev;
      });

      // サーバーへ削除リクエスト
      await DeleteStudyLog(recordId);
    },
    [records]
  );

  // 初回マウント時に学習ログを取得
  useEffect(() => {
    getStudyLog();
  }, []);

  return (
    <ChakraProvider value={theme}>
      <InputForm inputKeyword="add" onSubmitRegistration={onSubmitRegistration} />
      {isLoading ? (
        <Heading data-testid="loading">ロード中です！</Heading>
      ) : (
        <>
          <Archive records={records} onClickDeleteRecord={onClickDeleteRecord} onClickEditRecord={onClickEditRecord} />
          <Total totalTime={totalTime} />
        </>
      )}
    </ChakraProvider>
  );
};
