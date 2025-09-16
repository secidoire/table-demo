import { useMemo, useEffect, useRef, useCallback } from ‘react’;
import {
MaterialReactTable,
useMaterialReactTable,
type MRT_ColumnDef,
} from ‘material-react-table’;
import { OverlayScrollbarsComponent } from ‘overlayscrollbars-react’;
import ‘overlayscrollbars/overlayscrollbars.css’;

// TypeScriptを使用している場合のデータ型定義
interface Person {
name: string;
age: number;
}

// 大量のモックデータ（仮想化をテストするため）
const data: Person[] = Array.from({ length: 1000 }, (_, index) => ({
name: `Person ${index + 1}`,
age: Math.floor(Math.random() * 60) + 20,
}));

export default function App() {
const tableContainerRef = useRef<HTMLDivElement>(null);
const overlayScrollRef = useRef<any>(null);
const syncingRef = useRef(false);

// カラム定義
const columns = useMemo<MRT_ColumnDef<Person>[]>(
() => [
{
accessorKey: ‘name’,
header: ‘Name’,
muiTableHeadCellProps: { style: { color: ‘green’ } },
enableHiding: false,
},
{
accessorFn: (originalRow) => parseInt(originalRow.age),
id: ‘age’,
header: ‘Age’,
Header: <i style={{ color: ‘red’ }}>Age</i>,
Cell: ({ cell }) => <i>{cell.getValue<number>().toLocaleString()}</i>,
},
],
[],
);

// ネイティブスクロール → OverlayScrollbars 同期
const syncToOverlay = useCallback((nativeElement: HTMLElement) => {
if (syncingRef.current || !overlayScrollRef.current) return;

syncingRef.current = true;
const overlayInstance = overlayScrollRef.current.osInstance();

if (overlayInstance) {
  const { scrollTop, scrollLeft } = nativeElement;
  overlayInstance.scroll({ y: scrollTop, x: scrollLeft }, 0);
}

requestAnimationFrame(() => {
  syncingRef.current = false;
});

}, []);

// OverlayScrollbars → ネイティブスクロール 同期
const syncToNative = useCallback((overlayInstance: any) => {
if (syncingRef.current || !tableContainerRef.current) return;

syncingRef.current = true;
const scrollState = overlayInstance.state().scroll;
const { x, y } = scrollState.position;

tableContainerRef.current.scrollTop = y;
tableContainerRef.current.scrollLeft = x;

requestAnimationFrame(() => {
  syncingRef.current = false;
});

}, []);

// テーブル設定
const table = useMaterialReactTable({
columns,
data,
enableRowSelection: true,
enableColumnOrdering: true,
enableGlobalFilter: false,

// 仮想化を有効にする
enableRowVirtualization: true,

// テーブルコンテナの設定
muiTableContainerProps: {
  ref: tableContainerRef,
  className: 'native-scroll-disabled',
  sx: {
    maxHeight: '400px',
    overflow: 'auto',
    position: 'relative',
    // ネイティブスクロールバーを完全に透明化
    '&::-webkit-scrollbar': {
      width: '0px',
      height: '0px',
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-corner': {
      background: 'transparent',
    },
    // Firefox用
    scrollbarWidth: 'none',
    // IE用
    msOverflowStyle: 'none',
  },
  onScroll: (e) => {
    syncToOverlay(e.currentTarget);
  },
},

// ヘッダーを固定
muiTableHeadProps: {
  sx: {
    '& .MuiTableCell-head': {
      position: 'sticky',
      top: 0,
      zIndex: 3,
      backgroundColor: 'white',
      borderBottom: '2px solid #e0e0e0',
    },
  },
},

});

// OverlayScrollbarsの初期化と同期設定
useEffect(() => {
if (!tableContainerRef.current || !overlayScrollRef.current) return;

const overlayInstance = overlayScrollRef.current.osInstance();
if (!overlayInstance) return;

// OverlayScrollbarsのスクロールイベントをリスニング
const handleOverlayScroll = (instance: any) => {
  syncToNative(instance);
};

overlayInstance.on('scroll', handleOverlayScroll);

return () => {
  overlayInstance.off('scroll', handleOverlayScroll);
};

}, [syncToNative]);

return (
<div style={{ padding: ‘20px’ }}>
<h2>Virtualized Table with OverlayScrollbars (Disabled Native Interaction)</h2>
<p>仮想化対応: {data.length.toLocaleString()} 行のデータ</p>

  <div style={{ 
    position: 'relative',
    border: '1px solid #e0e0e0', 
    borderRadius: '4px',
    overflow: 'hidden'
  }}>
    {/* テーブル本体（透明・操作無効スクロールバー） */}
    <MaterialReactTable table={table} />
    
    {/* ネイティブスクロールバー操作を無効化するブロッカー */}
    {/* 縦スクロールバー領域ブロッカー */}
    <div 
      className="scrollbar-blocker-vertical"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '20px', // スクロールバー幅より少し大きめ
        pointerEvents: 'none', // 完全に操作を無効化
        zIndex: 4,
        backgroundColor: 'transparent',
      }}
    />
    
    {/* 横スクロールバー領域ブロッカー */}
    <div 
      className="scrollbar-blocker-horizontal"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '20px', // スクロールバー高さより少し大きめ
        pointerEvents: 'none', // 完全に操作を無効化
        zIndex: 4,
        backgroundColor: 'transparent',
      }}
    />
    
    {/* OverlayScrollbars表示層（縦） */}
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: '16px',
      pointerEvents: 'auto', // OverlayScrollbarsの操作は有効
      zIndex: 5,
    }}>
      <OverlayScrollbarsComponent
        ref={overlayScrollRef}
        options={{
          scrollbars: {
            theme: 'os-theme-dark',
            visibility: 'auto',
            autoHide: 'leave',
            autoHideDelay: 1000,
            dragScroll: true,
            clickScroll: true,
          },
          overflow: {
            x: 'hidden',
            y: 'scroll',
          },
        }}
        style={{
          height: '400px',
          width: '16px',
        }}
        events={{
          scroll: (instance) => {
            syncToNative(instance);
          },
        }}
      >
        {/* 仮想的なスクロール可能エリア */}
        <div style={{ 
          height: `${Math.max(data.length * 50, 400)}px`,
          width: '1px',
          pointerEvents: 'none',
        }} />
      </OverlayScrollbarsComponent>
    </div>
  </div>
  
  <style>{
    /* ネイティブスクロールバーの完全な透明化と操作無効化 */
    .native-scroll-disabled {
      scrollbar-width: none !important; /* Firefox */
      -ms-overflow-style: none !important; /* IE/Edge */
    }
    
    .native-scroll-disabled::-webkit-scrollbar {
      display: none !important; /* Chrome/Safari/Edge */
      width: 0 !important;
      height: 0 !important;
      background: transparent !important;
    }
    
    .native-scroll-disabled::-webkit-scrollbar-track {
      background: transparent !important;
      pointer-events: none !important;
    }
    
    .native-scroll-disabled::-webkit-scrollbar-thumb {
      background: transparent !important;
      pointer-events: none !important;
    }
    
    .native-scroll-disabled::-webkit-scrollbar-corner {
      background: transparent !important;
      pointer-events: none !important;
    }
    
    /* スクロールバー領域の完全な操作無効化 */
    .scrollbar-blocker-vertical,
    .scrollbar-blocker-horizontal {
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }
    
    /* テーブルコンテンツは操作可能にする */
    .native-scroll-disabled .MuiTable-root,
    .native-scroll-disabled .MuiTableCell-root,
    .native-scroll-disabled .MuiTableRow-root,
    .native-scroll-disabled .MuiCheckbox-root {
      pointer-events: auto !important;
    }
    
    /* OverlayScrollbarsのシステム一貫性スタイル */
    .os-theme-dark > .os-scrollbar > .os-scrollbar-track {
      background: rgba(0, 0, 0, 0.1) !important;
      border-radius: 4px !important;
    }
    
    .os-theme-dark > .os-scrollbar > .os-scrollbar-track > .os-scrollbar-handle {
      background: rgba(0, 0, 0, 0.5) !important;
      border-radius: 4px !important;
      min-height: 30px !important;
      transition: background-color 0.2s ease !important;
    }
    
    .os-theme-dark > .os-scrollbar:hover > .os-scrollbar-track > .os-scrollbar-handle {
      background: rgba(0, 0, 0, 0.7) !important;
    }
    
    .os-theme-dark > .os-scrollbar > .os-scrollbar-track > .os-scrollbar-handle:active {
      background: rgba(0, 0, 0, 0.9) !important;
    }
    
    /* OverlayScrollbarsのみ操作可能 */
    .os-scrollbar,
    .os-scrollbar * {
      pointer-events: auto !important;
    }
  }</style>
</div>

);
}