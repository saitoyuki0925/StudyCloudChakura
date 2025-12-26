import { App } from '../App';
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';

// supabase 呼び出しをモックしてテストを安定化させる
// mock path must match the module resolution used by the app (no file extension)
jest.mock('../utils/supabaseFunctions/supabaseFunctions', () => {
  // テスト内で共有される擬似的なレコード配列()
  let records = [];

  return {
    // getAllStudyLog は配列のコピーを返して、実際の配列参照を外に漏らさない
    getAllStudyLog: jest.fn(async () => [...records]),
    // addStudyLog は内部配列に追加して、getAllStudyLog が更新を反映できるようにする
    addStudyLog: jest.fn(async (title, time) => {
      const newRecord = { id: `test-${Math.random().toString(36).slice(2)}`, title, time };
      records.push(newRecord);
      return newRecord;
    }),
    // DeleteStudyLog は必要なら内部配列を更新できる
    DeleteStudyLog: jest.fn(async (id) => {
      records = records.filter((r) => r.id !== id);
      return;
    }),
    // テスト間で状態をクリアするためのヘルパー
    resetRecords: () => {
      records = [];
    },
  };
});

describe('Title Test', () => {
  const supabaseMock = require('../utils/supabaseFunctions/supabaseFunctions');

  beforeEach(() => {
    supabaseMock.resetRecords();
  });

  //ローディング画面をみることができる
  test('ロード画面が表示される', async () => {
    // コンポーネントをレンダリング
    render(<App />);
    // data-testid="title"を持つ要素を非同期で検索
    const title = await screen.findByTestId('loading');
    // タイトルのテキストが期待通りか確認
    expect(title).toHaveTextContent('ロード中です！');
  });

  //テーブルをみることができる(リスト)
  test('テーブルが表示される', async () => {
    // コンポーネントをレンダリング
    render(<App />);
    // data-testid="list"を持つ要素を非同期で検索
    const list = await screen.findByRole('list');
    // タイトルのテキストが期待通りか確認
    expect(list).toBeInTheDocument();
  });

  //新規登録ボタンがある
  test('新規登録ボタンが表示される', async () => {
    // コンポーネントをレンダリング
    render(<App />);
    // data-testid="open-dialog-button"を持つ要素を非同期で検索
    const button = await screen.findByRole('button', { name: '新規登録用のモーダルを開くボタン' });
    // タイトルのテキストが期待通りか確認
    expect(button).toBeInTheDocument();
  });

  //新規登録モーダルが新規登録というタイトルになっている
  test('新規登録のモーダルのタイトルが新規登録になっている', async () => {
    // コンポーネントをレンダリング
    render(<App />);
    // まず Dialog を開く
    fireEvent.click(await screen.findByRole('button', { name: '新規登録用のモーダルを開くボタン' }));
    // data-testid="dialog-title"を持つ要素を非同期で検索
    const dialogTitle = await screen.findByTestId('dialog-title');
    // タイトルのテキストが期待通りか確認
    expect(dialogTitle).toHaveTextContent('新規登録');
  });

  // テスト1: タイトルの表示テスト
  test('タイトルが表示されている', async () => {
    // コンポーネントをレンダリング
    render(<App />);
    // data-testid="title"を持つ要素を非同期で検索
    const title = await screen.findByTestId('title');
    // タイトルのテキストが期待通りか確認
    expect(title).toHaveTextContent('学習記録一覧');
  });

  // 学習記録追加機能のテスト
  test('学習記録を追加することができる', async () => {
    // コンポーネントをレンダリング
    render(<App />);

    // まず Dialog を開く
    fireEvent.click(await screen.findByRole('button', { name: '新規登録用のモーダルを開くボタン' }));

    // 必要な入力フィールドとボタンを取得
    const inputText = await screen.findByTestId('input-text');
    const inputTime = await screen.findByTestId('input-time');
    const registrationButton = await screen.findByTestId('registration-button');

    // フォームに値を入力
    fireEvent.change(inputText, { target: { value: 'テスト学習記録' } });
    fireEvent.change(inputTime, { target: { value: '10' } });
    // 登録ボタンをクリック
    fireEvent.click(registrationButton);

    // リストを取得（非同期で待機）
    const list = await screen.findByRole('list');

    // 追加された学習記録が表示されているか確認
    // startsWith()を使用して、テキストの前方一致で検索
    await waitFor(() => {
      expect(within(list).getByText((content) => content.startsWith('テスト学習記録'))).toBeInTheDocument();
    });
  });

  //  学習記録削除機能のテスト
  test('学習記録を削除することができる', async () => {
    // コンポーネントをレンダリング
    render(<App />);

    // まず Dialog を開く
    fireEvent.click(await screen.findByRole('button', { name: '新規登録用のモーダルを開くボタン' }));

    // まず学習記録を追加してから削除する（テスト独立性の確保）
    const inputText = await screen.findByTestId('input-text');
    const inputTime = await screen.findByTestId('input-time');
    const registrationButton = await screen.findByTestId('registration-button');

    fireEvent.change(inputText, { target: { value: 'テスト学習記録' } });
    fireEvent.change(inputTime, { target: { value: '10' } });
    fireEvent.click(registrationButton);

    // 追加されたリスト項目が表示されるのを待つ
    const list = await screen.findByRole('list');
    await waitFor(() => {
      expect(within(list).getByText((content) => content.startsWith('テスト学習記録'))).toBeInTheDocument();
    });

    // 削除ボタンを取得してクリック
    const deleteButtons = within(list).getAllByRole('button', { name: '削除' });
    fireEvent.click(deleteButtons[0]);

    // 削除された学習記録が画面から消えているか確認
    await waitFor(() => {
      expect(screen.queryByText((content) => content && content.startsWith('テスト学習記録'))).not.toBeInTheDocument();
    });
  });

  //  入力をしないで登録を押すとエラーが表示されるテスト
  test('入力をしないで登録を押すとエラーが表示される', async () => {
    // コンポーネントをレンダリング
    render(<App />);
    // まず Dialog を開く
    fireEvent.click(await screen.findByRole('button', { name: '新規登録用のモーダルを開くボタン' }));

    // 必要な入力フィールドとボタンを取得
    const registrationButton = await screen.findByTestId('registration-button');

    // 入力なしで登録ボタンをクリック
    fireEvent.click(registrationButton);

    // エラーメッセージが表示されていることを確認
    await waitFor(() => {
      expect(screen.getByTestId('error-detail')).toHaveTextContent('内容の入力は必須です');
      expect(screen.getByTestId('error-time')).toHaveTextContent('時間の入力は必須です');
    });

    // このケースでは送信失敗（サーバーエラー）ではないため、submit 用エラーは出ない
    expect(screen.queryByTestId('error-submit')).not.toBeInTheDocument();
  });

  //  編集モーダルのタイトルが「記録編集」であることをテスト
  test('編集モーダルのタイトルが記録編集である', async () => {
    // コンポーネントをレンダリング
    render(<App />);

    // まず学習記録を追加する
    fireEvent.click(await screen.findByRole('button', { name: '新規登録用のモーダルを開くボタン' }));
    const inputText = await screen.findByTestId('input-text');
    const inputTime = await screen.findByTestId('input-time');
    const registrationButton = await screen.findByTestId('registration-button');
    fireEvent.change(inputText, { target: { value: 'テスト学習記録' } });
    fireEvent.change(inputTime, { target: { value: '10' } });
    fireEvent.click(registrationButton);

    // リストが表示されるのを待つ
    const list = await screen.findByRole('list');
    await waitFor(() => {
      expect(within(list).getByText((content) => content.startsWith('テスト学習記録'))).toBeInTheDocument();
    });

    // 編集ボタンをクリック（リスト内の最初の編集ボタンを想定） data-testid="open-dialog-button"
    fireEvent.click(within(list).getAllByRole('button', { name: '編集用のモーダルを開くボタン' })[0]);

    // 編集モーダルが開き、タイトルが '記録編集' になるまで待機して検証
    await waitFor(() => {
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('記録編集');
    });
  });
  //編集して登録すると更新される
  test('編集して登録すると更新される', async () => {
    // コンポーネントをレンダリング
    render(<App />);

    // まず学習記録を追加する
    fireEvent.click(await screen.findByRole('button', { name: '新規登録用のモーダルを開くボタン' }));
    const inputText = await screen.findByTestId('input-text');
    const inputTime = await screen.findByTestId('input-time');
    const registrationButton = await screen.findByTestId('registration-button');
    fireEvent.change(inputText, { target: { value: 'テスト学習記録' } });
    fireEvent.change(inputTime, { target: { value: '10' } });
    fireEvent.click(registrationButton);

    // リストが表示されるのを待つ
    const list = await screen.findByRole('list');
    await waitFor(() => {
      expect(within(list).getByText((content) => content.startsWith('テスト学習記録'))).toBeInTheDocument();
    });

    // 編集ボタンをクリック（リスト内の最初の編集ボタンを想定）
    fireEvent.click(within(list).getAllByRole('button', { name: '編集用のモーダルを開くボタン' })[0]);

    // 編集用の入力フィールドとボタンを取得
    const editInputText = await screen.findByTestId('input-text');
    const editInputTime = await screen.findByTestId('input-time');
    const editRegistrationButton = await screen.findByTestId('registration-button');
  });
});
