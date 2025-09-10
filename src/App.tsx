import React, { useMemo, useEffect, useRef } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import { useOverlayScrollbars } from 'overlayscrollbars-react';
import type { OverlayScrollbars } from 'overlayscrollbars';
import 'overlayscrollbars/overlayscrollbars.css';

interface Person {
  name: string;
  age: number;
  email: string;
  city: string;
}

// 大量のサンプルデータ
const data: Person[] = Array.from({ length: 500 }, (_, i) => ({
  name: `Person ${i + 1}`,
  age: Math.floor(Math.random() * 50) + 20,
  email: `person${i + 1}@example.com`,
  city: ['東京', '大阪', '京都', '横浜', '神戸'][Math.floor(Math.random() * 5)],
}));

export default function CleanHoverScrollbarTable() {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // OverlayScrollbarsの設定 - マウスホバー時のみ表示
  const [initialize, instance] = useOverlayScrollbars({
    options: {
      scrollbars: {
        theme: 'os-theme-dark',
        autoHide: 'leave',        // マウスが離れると隠れる
        autoHideDelay: 800,       // 少し遅延してから隠れる
        visibility: 'auto',       // 自動表示
        clickScroll: true,
      },
      overflow: {
        x: 'scroll',
        y: 'scroll',
      },
    },
    defer: true,
  });

  // カラム定義
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '名前',
        size: 120,
        enableHiding: false,  // 列の非表示機能を無効
      },
      {
        accessorKey: 'age',
        header: '年齢',
        size: 80,
        enableHiding: false,
        Cell: ({ cell }) => `${cell.getValue<number>()}歳`,
      },
      {
        accessorKey: 'email',
        header: 'メールアドレス',
        size: 250,
        enableHiding: false,
      },
      {
        accessorKey: 'city',
        header: '都市',
        size: 100,
        enableHiding: false,
      },
    ],
    [],
  );

  // テーブル設定 - ツールバー機能を全て無効化
  const table = useMaterialReactTable({
    columns,
    data,
    
    // ✅ 基本機能のみ有効
    enableStickyHeader: true,
    enablePagination: false,
    
    // ❌ ツールバー機能を全て無効化
    enableGlobalFilter: false,         // 検索バーを無効
    enableColumnFilters: false,        // 列フィルターを無効
    enableDensityToggle: false,        // 密度切替を無効
    enableFullScreenToggle: false,     // 全画面表示を無効
    enableHiding: false,               // 列の表示/非表示を無効
    enableColumnOrdering: false,       // 列の並び替えを無効
    enableRowSelection: false,         // 行選択を無効
    enableSorting: false,              // ソートを無効
    enableTopToolbar: false,           // 上部ツールバーを完全に非表示
    enableBottomToolbar: false,        // 下部ツールバーを完全に非表示
    
    // テーブルコンテナの設定
    muiTableContainerProps: {
      ref: tableContainerRef,
      sx: {
        maxHeight: '400px',
        overflow: 'hidden', // ネイティブスクロールを隠す
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
      },
    },
    
    // ヘッダーのスタイル
    muiTableHeadProps: {
      sx: {
        '& .MuiTableCell-head': {
          backgroundColor: '#f5f5f5',
          fontWeight: 'bold',
          borderBottom: '2px solid #ddd',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        },
      },
    },
    
    // データ行のスタイル
    muiTableBodyRowProps: {
      sx: {
        '&:nth-of-type(even)': {
          backgroundColor: '#f9f9f9',
        },
        '&:hover': {
          backgroundColor: '#f0f8ff',
          transition: 'background-color 0.2s ease',
        },
      },
    },
  });

  // 初期化とクリーンアップ
  useEffect(() => {
    if (tableContainerRef.current) {
      initialize(tableContainerRef.current);
    }

    return () => {
      const osInstance: OverlayScrollbars | null = instance();
      if (osInstance) {
        osInstance.destroy();
      }
    };
  }, [initialize, instance]);

  // スクロール制御関数
  const scrollToTop = (): void => {
    const osInstance: OverlayScrollbars | null = instance();
    if (osInstance) {
      const viewport = osInstance.elements().viewport;
      viewport.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const scrollToBottom = (): void => {
    const osInstance: OverlayScrollbars | null = instance();
    if (osInstance) {
      const viewport = osInstance.elements().viewport;
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>シンプル・ホバー時スクロールバー表示</h2>
      
      {/* 説明 */}
      <div style={{ 
        marginBottom: '15px', 
        padding: '12px',
        backgroundColor: '#e8f5e8',
        borderRadius: '6px',
        borderLeft: '4px solid #4caf50'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>✨ 特徴</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#333' }}>
          <li>🚫 ツールバー・フィルター機能なし（すっきり表示）</li>
          <li>🖱️ マウスホバー時のみスクロールバー表示</li>
          <li>🔒 ヘッダー固定・データ部分のみスクロール</li>
          <li>⚡ 軽量で高速動作</li>
        </ul>
      </div>
      
      {/* スクロール制御ボタン */}
      <div style={{ 
        marginBottom: '15px', 
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={scrollToTop}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196f3'}
        >
          📄 トップへ
        </button>
        <button 
          onClick={scrollToBottom}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#388e3c'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4caf50'}
        >
          📄 ボトムへ
        </button>
        <div style={{ 
          padding: '8px 12px',
          backgroundColor: 'white',
          borderRadius: '6px',
          border: '1px solid #ddd',
          fontSize: '14px', 
          color: '#666' 
        }}>
          総データ数: <strong>{data.length.toLocaleString()}件</strong>
        </div>
      </div>

      {/* テーブル */}
      <div style={{ 
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <MaterialReactTable table={table} />
      </div>
      
      {/* フッター情報 */}
      <div style={{ 
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#fff9c4',
        borderRadius: '6px',
        border: '1px solid #fff176'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#f57f17' }}>💡 使用方法</h3>
        <div style={{ fontSize: '14px', color: '#333' }}>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>スクロールバー表示:</strong> テーブル上にマウスを載せるとスクロールバーが表示されます
          </p>
          <p style={{ margin: '0 0 8px 0' }}>
            <strong>スクロール:</strong> マウスホイール、スクロールバーのドラッグ、上記ボタンで操作
          </p>
          <p style={{ margin: 0 }}>
            <strong>ヘッダー:</strong> スクロール時も常に表示され、データの内容を確認できます
          </p>
        </div>
      </div>
      
      {/* 技術詳細（折りたたみ可能） */}
      <details style={{ marginTop: '15px' }}>
        <summary style={{ 
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          color: '#333'
        }}>
          🔧 技術実装詳細
        </summary>
        <div style={{ 
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#f8f8f8',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#555'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>無効化した機能:</h4>
          <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px' }}>
            <li>enableTopToolbar: false (上部ツールバー)</li>
            <li>enableBottomToolbar: false (下部ツールバー)</li>
            <li>enableGlobalFilter: false (検索機能)</li>
            <li>enableColumnFilters: false (列フィルター)</li>
            <li>enableDensityToggle: false (密度切替)</li>
            <li>enableFullScreenToggle: false (全画面)</li>
            <li>enableHiding: false (列の表示/非表示)</li>
            <li>enableColumnOrdering: false (列並び替え)</li>
            <li>enableRowSelection: false (行選択)</li>
            <li>enableSorting: false (ソート)</li>
          </ul>
          <h4 style={{ margin: '0 0 10px 0' }}>スクロールバー設定:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>autoHide: 'leave' (マウスが離れると隠れる)</li>
            <li>autoHideDelay: 800ms (隠れるまでの遅延)</li>
            <li>visibility: 'auto' (必要時のみ表示)</li>
          </ul>
        </div>
      </details>
    </div>
  );
}