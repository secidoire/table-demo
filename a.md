# Playwright CSSセレクタ チートシート（HTML例付き）

## 📌 セレクタ選択の優先順位

### 第1階層：ユーザー指向のロケータ（最優先）

#### ロールベースセレクタ

```html
<!-- HTML -->
<button type="submit">ログイン</button>
<input type="checkbox" id="remember" />
<label for="remember">記憶する</label>
<a href="/about">会社概要</a>
<h1>ダッシュボード</h1>
```

```javascript
// Playwright
await page.getByRole('button', { name: 'ログイン' }).click();
await page.getByRole('checkbox', { name: '記憶する' }).check();
await page.getByRole('link', { name: '会社概要' }).click();
await page.getByRole('heading', { name: 'ダッシュボード', level: 1 }).isVisible();
```

#### ラベルベースセレクタ

```html
<!-- HTML -->
<label for="email">メールアドレス</label>
<input type="email" id="email" />

<label>
  パスワード
  <input type="password" />
</label>
```

```javascript
// Playwright
await page.getByLabel('メールアドレス').fill('test@example.com');
await page.getByLabel('パスワード').fill('secret123');
```

#### テキストベースセレクタ

```html
<!-- HTML -->
<p>ようこそ、山田様</p>
<div>現在のステータス: <span>アクティブ</span></div>
<button>ログアウト</button>
```

```javascript
// Playwright
await expect(page.getByText('ようこそ、山田様')).toBeVisible();
await page.getByText('アクティブ').isVisible();
await page.getByText('ログアウト', { exact: true }).click();
```

#### プレースホルダーベースセレクタ

```html
<!-- HTML -->
<input type="search" placeholder="検索..." />
<textarea placeholder="コメントを入力してください"></textarea>
```

```javascript
// Playwright
await page.getByPlaceholder('検索...').fill('playwright');
await page.getByPlaceholder('コメントを入力してください').fill('テストコメント');
```

### 第2階層：テストID

```html
<!-- HTML -->
<button data-testid="submit-button">送信</button>
<div data-testid="error-message">エラーが発生しました</div>

<!-- カスタム属性の場合 -->
<button data-pw="login-button">ログイン</button>
```

```javascript
// Playwright
await page.getByTestId('submit-button').click();
await page.getByTestId('error-message').isVisible();

// カスタム属性設定後
await page.getByTestId('login-button').click();
```

## 🎯 基本的なCSSセレクタ

### 要素セレクタ

```html
<!-- HTML -->
<button>クリック</button>
<input type="text" value="テキスト" />
<p>段落テキスト</p>
<div>コンテナ</div>
```

```javascript
// Playwright
await page.locator('button').click();
await page.locator('input').fill('新しい値');
await page.locator('p').textContent();
await page.locator('div').first().isVisible();
```

### クラスセレクタ

```html
<!-- HTML -->
<button class="submit-button">送信</button>
<button class="primary large">重要なボタン</button>
<div class="container active">
  <p class="text-content">テキスト</p>
</div>
```

```javascript
// Playwright
// 単一クラス
await page.locator('.submit-button').click();

// 複数クラス（両方必要）
await page.locator('.primary.large').click();

// 要素＋クラス
await page.locator('button.submit-button').click();
await page.locator('div.container.active').isVisible();
```

### IDセレクタ

```html
<!-- HTML -->
<input type="text" id="username" />
<button id="submit-btn">送信</button>
<div id="main-content">メインコンテンツ</div>
```

```javascript
// Playwright
await page.locator('#username').fill('john');
await page.locator('#submit-btn').click();
await page.locator('div#main-content').isVisible();
```

### 属性セレクタ

```html
<!-- HTML -->
<button disabled>無効なボタン</button>
<input type="password" required />
<a href="https://example.com">外部リンク</a>
<a href="document.pdf">PDFファイル</a>
<div data-test="login-form">
  <input data-test-id="email-input" />
</div>
<span lang="en-US">English</span>
```

```javascript
// Playwright
// 属性の存在
await page.locator('[disabled]').count();
await page.locator('[required]').fill('必須項目');

// 完全一致
await page.locator('[type="password"]').fill('secret');
await page.locator('[data-test="login-form"]').isVisible();

// 前方一致
await page.locator('[href^="https"]').count(); // HTTPSリンク

// 後方一致
await page.locator('[href$=".pdf"]').count(); // PDFファイル

// 部分一致
await page.locator('[href*="example"]').click();

// 言語属性（値または値-で始まる）
await page.locator('[lang|="en"]').count(); // en, en-US, en-GB等
```

## 🔗 CSS結合子

### 子孫結合子（スペース）

```html
<!-- HTML -->
<article>
  <header>
    <h2>記事タイトル</h2>
  </header>
  <div class="content">
    <p>段落1</p>
    <div>
      <p>ネストされた段落</p>
    </div>
  </div>
</article>
```

```javascript
// Playwright
// article内のすべてのp要素（深さ問わず）
await page.locator('article p').count(); // 2つ

// 複数レベル
await page.locator('article div p').count(); // 2つ
await page.locator('article .content p').first().click();
```

### 子結合子（>）

```html
<!-- HTML -->
<div class="container">
  <p>直接の子</p>
  <div>
    <p>孫要素（選択されない）</p>
  </div>
  <span>直接の子</span>
</div>
```

```javascript
// Playwright
// 直接の子のみ
await page.locator('.container > p').count(); // 1つのみ
await page.locator('.container > *').count(); // 3つ（p, div, span）
```

### 隣接兄弟結合子（+）

```html
<!-- HTML -->
<div class="header">ヘッダー</div>
<p>ヘッダー直後の段落</p>
<p>次の段落</p>

<label for="name">名前</label>
<input id="name" type="text" />
```

```javascript
// Playwright
// div直後のp要素
await page.locator('div.header + p').click(); // "ヘッダー直後の段落"のみ

// ラベル直後の入力フィールド
await page.locator('label + input').fill('山田太郎');
```

### 一般兄弟結合子（~）

```html
<!-- HTML -->
<h2>セクションタイトル</h2>
<p>段落1</p>
<div>区切り</div>
<p>段落2</p>
<p>段落3</p>
```

```javascript
// Playwright
// h2の後のすべてのp要素
await page.locator('h2 ~ p').count(); // 3つ

// 最初のpの後のすべてのp
await page.locator('p ~ p').count(); // 2つ
```

## ⚡ Playwright固有の擬似クラス

### :visible 擬似クラス

```html
<!-- HTML -->
<button>表示ボタン</button>
<button style="display: none">非表示ボタン</button>
<button style="visibility: hidden">不可視ボタン</button>
<button style="opacity: 0">透明ボタン</button>
```

```javascript
// Playwright
await page.locator('button:visible').count(); // 2つ（表示と透明）
// opacity:0は「表示」扱い、display:noneとvisibility:hiddenは非表示
```

### テキストマッチング擬似クラス

```html
<!-- HTML -->
<article>
  <h2>Playwrightの紹介</h2>
  <p>Playwrightは自動テストツールです</p>
</article>

<nav id="nav-bar">
  <a href="/">ホーム</a>
  <a href="/about">会社概要</a>
  <a href="/home">Home</a>
</nav>

<button>Submit Form</button>
<button>送信</button>
```

```javascript
// Playwright
// :has-text() - 部分一致
await page.locator('article:has-text("Playwright")').click();

// :text() - テキストを含む最小要素
await page.locator('#nav-bar :text("ホーム")').click();

// :text-is() - 完全一致
await page.locator('#nav-bar :text-is("ホーム")').click(); // "ホーム"のみ
await page.locator('#nav-bar :text-is("Home")').click(); // "Home"のみ

// :text-matches() - 正規表現
await page.locator('button:text-matches("submit|送信", "i")').click();
```

### :has() 擬似クラス

```html
<!-- HTML -->
<article>
  <h2>商品A</h2>
  <div class="promo">セール中</div>
  <button>購入</button>
</article>

<article>
  <h2>商品B</h2>
  <button>購入</button>
</article>

<ul>
  <li>
    <span>アイテム1</span>
    <button class="delete">削除</button>
  </li>
  <li>
    <span>アイテム2</span>
  </li>
</ul>
```

```javascript
// Playwright
// promoクラスを持つdivを含むarticle
await page.locator('article:has(div.promo)').click();

// 削除ボタンを持つリストアイテム
await page.locator('li:has(button.delete)').count(); // 1つ
```

### :nth-match() 擬似クラス

```html
<!-- HTML -->
<div>
  <button>購入</button>
  <p>説明</p>
  <button>購入</button>
  <span>価格</span>
  <button>購入</button>
</div>
```

```javascript
// Playwright
// 3番目の「購入」ボタン（ページ全体で）
await page.locator(':nth-match(:text("購入"), 3)').click();
```

### レイアウト擬似クラス

```html
<!-- HTML -->
<div style="display: flex;">
  <label>ユーザー名:</label>
  <input type="text" />
  <button>確認</button>
  <button>キャンセル</button>
</div>
```

```javascript
// Playwright
// ラベルの右側の入力フィールド
await page.locator('input:right-of(:text("ユーザー名"))').fill('user123');

// キャンセルの左側のボタン
await page.locator('button:left-of(:text("キャンセル"))').click();
```

## 🔍 セレクタの組み合わせとチェイン

### 複雑なセレクタの組み合わせ

```html
<!-- HTML -->
<div class="product-card" data-product-id="123">
  <h3>商品名</h3>
  <div class="price">¥1,000</div>
  <button class="buy-button primary">カートに追加</button>
</div>
```

```javascript
// Playwright
// 複数の条件を組み合わせ
await page.locator('.product-card[data-product-id="123"] button.buy-button').click();

// ロケータチェイン（推奨）
await page
  .locator('.product-card')
  .filter({ has: page.locator('[data-product-id="123"]') })
  .locator('.buy-button')
  .click();
```

### フィルタリングパターン

```html
<!-- HTML -->
<ul>
  <li>
    <h4>商品1</h4>
    <span>在庫あり</span>
    <button>カートに追加</button>
  </li>
  <li>
    <h4>商品2</h4>
    <span>在庫なし</span>
    <button disabled>カートに追加</button>
  </li>
  <li>
    <h4>商品3</h4>
    <span>在庫あり</span>
    <button>カートに追加</button>
  </li>
</ul>
```

```javascript
// Playwright
// 在庫ありの商品のみ
await page
  .getByRole('listitem')
  .filter({ hasText: '在庫あり' })
  .getByRole('button', { name: 'カートに追加' })
  .first()
  .click();

// 商品2を除外
await page
  .getByRole('listitem')
  .filter({ hasNotText: '商品2' })
  .count(); // 2つ
```

## 📋 実践的な使用例

### フォーム操作

```html
<!-- HTML -->
<form id="registration-form">
  <div class="form-group">
    <label for="firstName">名</label>
    <input type="text" id="firstName" required />
  </div>
  
  <div class="form-group">
    <label for="lastName">姓</label>
    <input type="text" id="lastName" required />
  </div>
  
  <div class="form-group">
    <label for="email">メールアドレス</label>
    <input type="email" id="email" placeholder="user@example.com" />
  </div>
  
  <div class="form-group">
    <label for="country">国</label>
    <select id="country">
      <option value="">選択してください</option>
      <option value="jp">日本</option>
      <option value="us">アメリカ</option>
    </select>
  </div>
  
  <div class="form-group">
    <input type="checkbox" id="terms" />
    <label for="terms">利用規約に同意する</label>
  </div>
  
  <button type="submit" data-testid="submit-form">登録</button>
</form>
```

```javascript
// Playwright - フォーム入力
await page.getByLabel('名').fill('太郎');
await page.getByLabel('姓').fill('山田');
await page.getByLabel('メールアドレス').fill('taro@example.com');
await page.getByLabel('国').selectOption('jp');
await page.getByLabel('利用規約に同意する').check();
await page.getByTestId('submit-form').click();

// または並列処理で高速化
await Promise.all([
  page.getByLabel('名').fill('太郎'),
  page.getByLabel('姓').fill('山田'),
  page.getByLabel('メールアドレス').fill('taro@example.com')
]);
```

### テーブル操作

```html
<!-- HTML -->
<table>
  <thead>
    <tr>
      <th>名前</th>
      <th>メール</th>
      <th>ステータス</th>
      <th>アクション</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>山田太郎</td>
      <td>yamada@example.com</td>
      <td>アクティブ</td>
      <td>
        <button class="edit-btn">編集</button>
        <button class="delete-btn">削除</button>
      </td>
    </tr>
    <tr>
      <td>鈴木花子</td>
      <td>suzuki@example.com</td>
      <td>非アクティブ</td>
      <td>
        <button class="edit-btn">編集</button>
        <button class="delete-btn">削除</button>
      </td>
    </tr>
  </tbody>
</table>
```

```javascript
// Playwright - テーブル操作
// 特定の行を見つけて操作
const row = page.getByRole('row').filter({ hasText: '山田太郎' });
await row.getByRole('button', { name: '編集' }).click();

// ステータスでフィルタ
const activeRows = page.getByRole('row').filter({ hasText: 'アクティブ' });
await expect(activeRows).toHaveCount(1);

// 特定のセルの値を取得
const email = await row.getByRole('cell').nth(1).textContent();
```

### モーダル/ダイアログ操作

```html
<!-- HTML -->
<div class="modal" role="dialog" style="display: none;">
  <div class="modal-content">
    <h2>確認</h2>
    <p>本当に削除しますか？</p>
    <button class="confirm">はい</button>
    <button class="cancel">キャンセル</button>
  </div>
</div>

<!-- 表示されたモーダル -->
<div class="modal" role="dialog" style="display: block;">
  <div class="modal-content">
    <h2>確認</h2>
    <p>本当に削除しますか？</p>
    <button class="confirm">はい</button>
    <button class="cancel">キャンセル</button>
  </div>
</div>
```

```javascript
// Playwright - モーダル操作
// 表示されているモーダルのみを対象
await page.locator('.modal:visible').getByRole('button', { name: 'はい' }).click();

// またはrole属性を使用
await page.getByRole('dialog').getByRole('button', { name: 'はい' }).click();
```

### 動的コンテンツの処理

```html
<!-- HTML - ローディング中 -->
<div class="search-results">
  <div class="loader">検索中...</div>
</div>

<!-- HTML - 結果表示後 -->
<div class="search-results">
  <ul>
    <li>結果1</li>
    <li>結果2</li>
    <li>結果3</li>
  </ul>
</div>
```

```javascript
// Playwright - 動的コンテンツを待つ
// ローダーが消えるのを待つ
await page.locator('.loader').waitFor({ state: 'hidden' });

// 結果が表示されるのを待つ
await page.locator('.search-results li').first().waitFor();

// 結果をクリック
await page.locator('.search-results li').first().click();
```

## ⚠️ Strictモード対応例

```html
<!-- HTML - 複数の同じボタン -->
<div class="card">
  <h3>商品A</h3>
  <button>詳細</button>
  <button>購入</button>
</div>

<div class="card">
  <h3>商品B</h3>
  <button>詳細</button>
  <button>購入</button>
</div>
```

```javascript
// ❌ エラー：複数マッチ
await page.locator('button').click(); // 4つのボタンがマッチ

// ✅ 解決策1：コンテキストを追加
await page
  .locator('.card')
  .filter({ hasText: '商品A' })
  .getByRole('button', { name: '購入' })
  .click();

// ✅ 解決策2：より具体的なセレクタ
await page.locator('.card:has-text("商品B") button:text("詳細")').click();

// ✅ 解決策3：nth-matchを使用（位置が固定の場合）
await page.locator(':nth-match(button:text("購入"), 2)').click();
```

## 📊 Shadow DOMとiframe

### Shadow DOM

```html
<!-- HTML -->
<div id="shadow-host"></div>
<script>
  const host = document.getElementById('shadow-host');
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <div class="shadow-content">
      <button>Shadow内のボタン</button>
    </div>
  `;
</script>
```

```javascript
// Playwright - Shadow DOMを自動的に貫通
await page.locator('#shadow-host button').click();
await page.locator('.shadow-content button').click();
```

### iframe処理

```html
<!-- HTML -->
<iframe id="my-frame" src="frame.html"></iframe>

<!-- frame.html の内容 -->
<html>
  <body>
    <button>iframe内のボタン</button>
  </body>
</html>
```

```javascript
// Playwright - iframe内の要素を操作
const frame = page.frameLocator('#my-frame');
await frame.locator('button').click();

// または
await page.frameLocator('#my-frame').getByRole('button').click();
```

## ✅ Page Object Modelの実装例

```html
<!-- HTML - ログインページ -->
<div class="login-page">
  <h1>ログイン</h1>
  <form>
    <div class="error-message" style="display: none;">
      ログインに失敗しました
    </div>
    <input type="email" id="email" placeholder="メールアドレス" />
    <input type="password" id="password" placeholder="パスワード" />
    <button type="submit">ログイン</button>
  </form>
</div>
```

```javascript
// Playwright - Page Object Model
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.getByRole('button', { name: 'ログイン' });
    this.errorMessage = page.locator('.error-message');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }
}

// テストでの使用
const loginPage = new LoginPage(page);
await loginPage.login('test@example.com', 'password123');
if (await loginPage.isErrorVisible()) {
  console.log('ログインエラーが表示されました');
}
```

このガイドで、HTMLとPlaywrightセレクタの対応関係が明確になったと思います。実際のHTML構造を見ながら、適切なセレクタを選択できるようになっています。