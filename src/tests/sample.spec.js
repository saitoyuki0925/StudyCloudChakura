import { App } from '../App';
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';

describe('Title Test', () => {
  // テスト1: タイトルの表示テスト
  it('タイトルが表示されている', async () => {
    // コンポーネントをレンダリング
    render(<App />);
    // data-testid="title"を持つ要素を非同期で検索
    const title = await screen.findByTestId('title');
    // タイトルのテキストが期待通りか確認
    expect(title).toHaveTextContent('学習記録一覧');
  });

  // テスト2: 学習記録追加機能のテスト
  test('学習記録を追加することができる', async () => {
    // コンポーネントをレンダリング
    render(<App />);

    // 必要な入力フィールドとボタンを取得
    const inputText = await screen.findByTestId('input-text', { name: '新しい学習を入力' });
    const inputTime = await screen.findByTestId('input-time', { name: '新しい学習時間を入力' });
    const registrationButton = await screen.findByTestId('registration-button', { name: '登録' });

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
      expect(within(list).getByText((content, element) => content.startsWith('テスト学習記録'))).toBeInTheDocument();
    });
  });

  // テスト3: 学習記録削除機能のテスト
  test('学習記録を削除することができる', async () => {
    // コンポーネントをレンダリング
    render(<App />);

    // リストを取得（非同期で待機）
    const list = await screen.findByRole('list');

    // 「削除」ボタンを取得（複数ある前提）し、先頭をクリック
    const deleteButtons = within(list).getAllByRole('button', { name: '削除' });
    fireEvent.click(deleteButtons[0]);

    // 削除された学習記録が画面から消えているか確認
    await waitFor(() => {
      expect(within(list).queryByText(/テスト学習記録/)).not.toBeInTheDocument();
    });
  });

  // テスト4: 入力をしないで登録を押すとエラーが表示されるテスト
  test('入力をしないで登録を押すとエラーが表示される', async () => {
    // コンポーネントをレンダリング
    render(<App />);

    // 必要な入力フィールドとボタンを取得
    const inputText = await screen.findByTestId('input-text', { name: '新しい学習を入力' });
    const inputTime = await screen.findByTestId('input-time', { name: '新しい学習時間を入力' });
    const registrationButton = await screen.findByTestId('registration-button', { name: '登録' });

    // 登録ボタンをクリック
    fireEvent.click(registrationButton);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
    });
  });
});
