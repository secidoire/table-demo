# Playwright CSSセレクタ チートシート

## 📌 セレクタ選択の優先順位

### 第1階層：ユーザー指向のロケータ（最優先）

```javascript
// ロールベース：インタラクティブ要素に最適
await page.getByRole('button', { name: 'ログイン' }).click();
await page.getByRole('checkbox', { name: '記憶する' }).check();

// ラベルベース：フォームコントロールに最適
await page.getByLabel('メールアドレス').fill('test@example.com');
await page.getByLabel('パスワード').fill('secret');

// テキストベース：非インタラクティブコンテンツ用
await expect(page.getByText('ようこそ、山田様')).toBeVisible();

// プレースホルダーベース
await page.getByPlaceholder('検索...').fill('playwright');
```

### 第2階層：テストID（最も安定したフォールバック）

```javascript
await page.getByTestId('submit-button').click();

// playwright.config.ts でカスタム属性を設定
export default defineConfig({
  use: { testIdAttribute: 'data-pw' }
});
```

### 第3階層：CSS/XPath（最小限の使用）

```javascript
// CSSセレクタ（XPathは最終手段）
await page.locator('#submit-btn').click();
```

## 🎯 基本的なCSSセレクタ

### 要素セレクタ

```javascript
// HTMLタグで選択
await page.locator('button').click();
await page.locator('input').fill('値');
await page.locator('p').textContent();
```

### クラスセレクタ

```javascript
// 単一クラス
await page.locator('.submit-button').click();

// 複数クラス（両方必要）
await page.locator('.primary.large').click();

// 要素＋クラス
await page.locator('button.submit-button').click();
```

### IDセレクタ

```javascript
// ID選択
await page.locator('#username').fill('john');

// 要素＋ID
await page.locator('input#username').fill('value');
```

### 属性セレクタ

```javascript
// [attr] - 属性を持つ
await page.locator('[disabled]').count();

// [attr="value"] - 完全一致
await page.locator('[type="password"]').fill('secret');

// [attr^="value"] - 前方一致
await page.locator('[href^="https"]').count();

// [attr$="value"] - 後方一致
await page.locator('[href$=".pdf"]').count();

// [attr*="value"] - 部分一致
await page.locator('[href*="example"]').count();

// [attr~="value"] - 単語を含む
await page.locator('[class~="active"]').click();

// 大文字小文字を無視（iフラグ）
await page.locator('[type="submit" i]').click();
```

## 🔗 CSS結合子

### 子孫結合子（スペース）

```javascript
// article内のすべてのspan
await page.locator('article span').textContent();

// 複数レベルのネスト
await page.locator('div.container section p').count();
```

### 子結合子（>）

```javascript
// 直接の子要素のみ
await page.locator('div > p').click();

// クラスと組み合わせ
await page.locator('.container > .content').isVisible();
```

### 隣接兄弟結合子（+）

```javascript
// 直後の兄弟要素
await page.locator('div + p').click();

// ラベル + 入力パターン
await page.locator('label + input').fill('value');
```

### 一般兄弟結合子（~）

```javascript
// 後続のすべての兄弟要素
await page.locator('h2 ~ p').count();
```

## ⚡ Playwright固有の擬似クラス

### :visible 擬似クラス

```javascript
// 表示されている要素のみ
await page.locator('button:visible').click();

// モーダル内の表示要素
await page.locator('.modal:visible').isVisible();
```

### テキストマッチング擬似クラス

```javascript
// :has-text() - 部分一致（大文字小文字無視）
await page.locator('article:has-text("Playwright")').click();

// :text() - テキストを含む最小要素
await page.locator('#nav-bar :text("ホーム")').click();

// :text-is() - 完全一致
await page.locator('#nav-bar :text-is("ホーム")').click();

// :text-matches() - 正規表現
await page.locator(':text-matches("ログ\\s*イン", "i")').click();
```

### :has() 擬似クラス

```javascript
// 特定の要素を含む
await page.locator('article:has(div.promo)').textContent();

// filter()メソッドと併用
await page
  .getByRole('listitem')
  .filter({ has: page.getByRole('heading', { name: '商品2' }) })
  .getByRole('button', { name: 'カートに追加' })
  .click();
```

### :nth-match() 擬似クラス

```javascript
// n番目の要素を選択（1ベース）
await page.locator(':nth-match(:text("購入"), 3)').click();
```

### レイアウト擬似クラス（使用注意）

```javascript
// :right-of() - 右側の要素
await page.locator('input:right-of(:text("パスワード"))').fill('secret');

// :near() - 近くの要素（デフォルト50px）
await page.locator('button:near(.promo-card)').click();
```

⚠️ **注意**: レイアウトセレクタは計算コストが高く、1pxのレイアウト変更にも敏感です。

## 🚫 擬似要素（重要な制限）

**擬似要素はPlaywrightではアクセスできません。**

```javascript
// ❌ 動作しない
// await page.locator('div::before').isVisible();

// ✅ 回避策：page.evaluate()を使用
const beforeContent = await page.locator('.my-element').first()
  .evaluate(el => window.getComputedStyle(el, '::before').content);
```

## 🔍 セレクタの組み合わせとチェイン

### ロケータチェイン（推奨）

```javascript
// コンテキストに基づく選択
await page
  .locator('.product-card')
  .locator('.buy-button')
  .click();

// getBy*メソッドを使用
await page
  .getByRole('listitem')
  .filter({ hasText: '商品2' })
  .getByRole('button', { name: 'カートに追加' })
  .click();
```

### フィルタリングメソッド

```javascript
// テキストでフィルタ
await page.locator('button').filter({ hasText: '送信' }).click();

// 子要素でフィルタ
await page
  .getByRole('listitem')
  .filter({ has: page.getByRole('heading', { name: '商品2' }) })
  .click();
```

### ロケータ演算子

```javascript
// and() - 両方の条件
const button = page.getByRole('button').and(page.getByTitle('購読'));

// or() - いずれかの条件
const newEmail = page.getByRole('button', { name: '新規' });
const dialog = page.getByText('セキュリティ設定を確認');
await expect(newEmail.or(dialog).first()).toBeVisible();
```

## ⚠️ Strictモード：品質保証

Playwrightは**デフォルトでstrictモード**が有効。複数要素にマッチするとエラーになります。

### エラー例と解決方法

```javascript
// ❌ エラー：複数要素にマッチ
await page.locator('button').click();

// ✅ 解決策1：より具体的に（推奨）
await page.getByRole('button', { name: '送信' }).click();

// ✅ 解決策2：コンテキストを追加
await page.locator('#login-form').getByRole('button').click();

// ⚠️ 解決策3：位置指定（非推奨）
await page.locator('button').first().click();
```

## 🐛 デバッグツール

### Playwright Inspector

```bash
# デバッグモードで起動
PWDEBUG=1 npx playwright test

# または --debug フラグを使用
npx playwright test --debug
```

**主な機能：**

- ステップ実行
- ロケータピッカー
- セレクタの編集と検証
- マッチ要素数の表示

### ブラウザコンソール

```javascript
// DevToolsコンソールで使用
playwright.$('selector')        // 最初のマッチをハイライト
playwright.$$('selector')       // すべてのマッチをハイライト
```

### トレースビューア

```bash
# トレースを記録
npx playwright test --trace on

# トレースを表示
npx playwright show-trace trace.zip
```

## 📋 よく使うパターン

### Page Object Model

```javascript
class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByLabel('ユーザー名');
    this.passwordInput = page.getByLabel('パスワード');
    this.submitButton = page.getByRole('button', { name: 'ログイン' });
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### リストフィルタリング

```javascript
// 動的リストから特定アイテムを見つける
await page
  .getByRole('listitem')
  .filter({ hasText: '商品2' })
  .getByRole('button', { name: 'カートに追加' })
  .click();
```

### フォーム入力パターン

```javascript
// 並列入力（高速）
await Promise.all([
  page.getByLabel('名').fill('太郎'),
  page.getByLabel('姓').fill('山田'),
  page.getByLabel('メール').fill('taro@example.com')
]);
```

### テーブル操作

```javascript
// 特定の行を見つける
const row = page
  .getByRole('row')
  .filter({ hasText: '山田太郎' });

// 行内のボタンをクリック
await row.getByRole('button', { name: '編集' }).click();
```

## ❌ アンチパターン（避けるべき）

```javascript
// ❌ 長いCSS/XPathチェーン
await page.locator('#tsf > div:nth-child(2) > div.A8SBwf').click();

// ✅ セマンティックまたはテストID
await page.getByRole('searchbox').click();

// ❌ CSSクラスへの依存
await page.locator('.btn-primary-lg-rounded').click();

// ✅ ロールまたはテストID
await page.getByRole('button', { name: '送信' }).click();

// ❌ コンテキストなしの位置指定
await page.locator('button').nth(3).click();

// ✅ 具体的に指定
await page
  .getByRole('listitem')
  .filter({ hasText: '利用可能' })
  .getByRole('button')
  .first()
  .click();
```

## 🚀 パフォーマンス最適化

### セレクタ速度ランキング

**階層1：超高速（<1ms）**

- `getByTestId()` - 直接属性参照
- CSS IDセレクタ（`#id`）
- CSS属性セレクタ（`[data-testid="value"]`）

**階層2：高速（1-5ms）**

- `getByRole()` - アクセシビリティツリー
- CSSクラスセレクタ（`.class`）

**階層3：中速（5-20ms）**

- `getByText()` - テキストマッチング
- CSS子孫セレクタ（`div button`）

**階層4：低速（20-100ms）**

- XPathセレクタ - 完全DOM走査
- レイアウトセレクタ（`:near()`、`:above()`など）

### 最適化のテクニック

```javascript
// ✅ 良い例：高速で具体的
await page.getByTestId('submit').click();

// ✅ ロケータをキャッシュ
const submitButton = page.getByRole('button', { name: '送信' });
await submitButton.waitFor();
await submitButton.click();

// ✅ 検索範囲を絞る
await page.locator('#search-results').getByText('アイテム').click();

// ❌ 避ける：XPath
// await page.locator('//div[contains(text(),"クリック")]').click();
```

## 📊 設定とセットアップ

```javascript
// playwright.config.ts
export default defineConfig({
  use: {
    // カスタムテストID属性
    testIdAttribute: 'data-pw',
    
    // タイムアウト設定
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
});
```

## ✅ ベストプラクティスまとめ

1. **ユーザー視点優先**: ロール、ラベル、プレースホルダ、テキスト
1. **安定性のためのテストID**: セマンティック属性が不十分な場合
1. **シンプルなCSS**: 必要な場合のみ
1. **避けるべき**: CSSクラス、XPath、長いチェーン、位置指定

**覚えておくべきポイント:**

- strictモードを活用して品質向上
- ユーザーの視点でセレクタを選択
- リファクタリングに強いセレクタを書く
- パフォーマンスと保守性のバランスを取る