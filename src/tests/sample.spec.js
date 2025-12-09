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
});
