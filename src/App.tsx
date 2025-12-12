import { useEffect, useState, type ChangeEvent } from 'react';

import { Archive } from './components/Archive';
import { Total } from './components/Total';
import { DeleteStudyLog, getAllStudyLog, addStudyLog } from './utils/supabaseFunctions/supabaseFunctions';
import type { Database } from '../database.types';
import { Inputform } from './components/Inputform';

// Supabase で生成されたテーブルの型（Row）を利用
type StudyRecord = Database['public']['Tables']['study-record']['Row'];

// App コンポーネント：学習ログの取得・登録・削除を行う
export const App = () => {
  const [records, setRecords] = useState<StudyRecord[]>([]); // records: サーバーから取得した完全なレコード配列（id, careated_at を含む）
  const [detail, setDetail] = useState<string>(''); // 入力フォームのタイトル
  const [time, setTime] = useState<number>(0); // 入力フォームの時間（数値）
  const [error, setError] = useState(''); // エラーメッセージ表示用
  const [isCheckValue, setIsCheckValue] = useState<boolean>(false); // 入力チェックフラグ
  const [totalTime, setTotalTime] = useState<number>(0); // 合計時間
  const [isLoading, setIsLoading] = useState<boolean>(true); // 初回ロード中フラグ

  // フォーム入力ハンドラ
  const onChangeDetailValue = (event: ChangeEvent<HTMLInputElement>) => setDetail(event.target.value);
  const onChangeTimeValue = (event: ChangeEvent<HTMLInputElement>) => setTime(Number(event.target.value));

  // 登録処理：バリデーション→サーバーへ挿入→返却されたレコードを state に追加
  const onClickRegistration = async () => {
    if (detail === '' || time === 0 || isNaN(time)) {
      setError('入力項目が正しくありません');
      setIsCheckValue(true);
      return;
    } else {
      setIsCheckValue(false);
    }

    // サーバーへ保存し、返ってきた完全なレコード（id, careated_at を含む）を state に追加
    try {
      const inserted = await addStudyLog(detail, time);
      if (inserted) {
        // DBが生成した id や created_at を持つレコードを追加
        setRecords((prev) => [...prev, inserted]);
        setTotalTime((prev) => prev + (inserted.time ?? 0));
      }
      // 入力フォームをクリア
      setDetail('');
      setTime(0);
    } catch (e) {
      // サーバーエラー時はユーザーに通知
      console.error('登録に失敗しました', e);
      setError('登録に失敗しました');
    }
  };

  // 全件取得：サーバーから全レコードを取得して state に設定
  // const getStudyLog = async () => {
  //   const studyLogs = await getAllStudyLog();
  //   setRecords(studyLogs);

  //   // time は null の可能性があるので null 合体で 0 にフォールバック
  //   const sum = studyLogs.reduce((acc, record) => acc + Number(record.time || 0), 0);
  //   setTotalTime(sum);

  //   setIsLoading(false);
  // };
  const getStudyLog = async () => {
    try {
      const studyLogs = await getAllStudyLog();
      setRecords(studyLogs);

      const sum = studyLogs.reduce((acc, record) => acc + Number(record.time || 0), 0);
      setTotalTime(sum);
    } catch (e) {
      console.error('学習ログの取得に失敗しました', e);
      setError('学習記録の取得に失敗しました');
    } finally {
      // 成功・失敗に関係なくロード中は解除する
      setIsLoading(false);
    }
  };

  // 削除処理：ローカルの state を先に更新して UX を良くし、その後サーバーに削除を依頼
  const onClickDeleteRecord = async (recordId: string) => {
    // ローカルから即時に削除
    setRecords((prev) => prev.filter((r) => r.id !== recordId));

    // 合計時間を更新（削除対象の time を差し引く）
    setTotalTime((prev) => {
      const target = records.find((record) => record.id === recordId);
      return target ? prev - Number(target.time || 0) : prev;
    });

    // サーバーへ削除リクエスト
    await DeleteStudyLog(recordId);
  };

  useEffect(() => {
    getStudyLog();
  }, []);

  return (
    <>
      <Inputform detail={detail} time={time} onChangeDetailValue={onChangeDetailValue} onChangeTimeValue={onChangeTimeValue} onClickRegistration={onClickRegistration} isCheckValue={isCheckValue} error={error} />
      {isLoading ? (
        <>
          <h1 className="archive" data-testid="title">
            学習記録一覧
          </h1>
          <h1>ロード中です！</h1>
        </>
      ) : (
        <>
          <Archive records={records} onClick={onClickDeleteRecord} />
          <Total totalTime={totalTime} />
        </>
      )}
    </>
  );
};
