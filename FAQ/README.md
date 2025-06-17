# FAQ管理システム - サイドバー共通化

## 概要

FAQシステムの各画面で使用されているサイドバーを共通化し、メンテナンス性と一貫性を向上させました。

## 共通化されたファイル

### 1. 共通スタイル
- `common/common.css` - 基本的なレイアウトとボタンスタイル
- `common/sidebar.css` - サイドバー専用のスタイル

### 2. 共通JavaScript
- `common/sidebar.js` - サイドバーの動的生成とナビゲーション機能

## ファイル構成

```
design/FAQ/
├── common/
│   ├── common.css      # 共通スタイル
│   ├── sidebar.css     # サイドバースタイル
│   └── sidebar.js      # サイドバー機能
├── dashboard.html      # ダッシュボード（共通化済み）
├── faq-management.html # FAQ管理（共通化済み）
├── faq-upload.html     # FAQアップロード（共通化済み）
├── faq-registration.html # FAQ新規登録（共通化済み）
├── faq-detail-edit.html # FAQ詳細・編集（共通化済み）
└── README.md          # このファイル
```

## 使用方法

### 1. 新しいページを作成する場合

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FAQ管理システム - 新しいページ</title>
    <!-- 共通CSSを読み込み -->
    <link rel="stylesheet" href="common/common.css">
    <link rel="stylesheet" href="common/sidebar.css">
    <style>
        /* ページ固有のスタイル */
    </style>
</head>
<body>
    <div class="app-layout">
        <!-- サイドバー（空のコンテナ） -->
        <aside class="sidebar">
            <!-- JavaScriptで動的に生成されます -->
        </aside>

        <!-- メインコンテンツ -->
        <div class="main-wrapper">
            <!-- ヘッダー -->
            <header class="header">
                <div class="container">
                    <div class="header-content">
                        <div class="page-breadcrumb"></div>
                        <div class="user-info">
                            <span>管理者</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- メインコンテンツ -->
            <main class="container main-content">
                <!-- ページ固有のコンテンツ -->
            </main>
        </div>
    </div>

    <!-- 共通JavaScriptを読み込み -->
    <script src="common/sidebar.js"></script>
    <script>
        // ページ固有のJavaScript
    </script>
</body>
</html>
```

### 2. サイドバーにメニューを追加する場合

`common/sidebar.js`の`render()`メソッドを編集：

```javascript
render() {
    const sidebarHTML = `
        <div class="sidebar-header">
            <div class="sidebar-logo">FAQ管理システム</div>
        </div>
        <nav class="sidebar-nav">
            <a href="dashboard.html" class="nav-item" data-page="dashboard">ダッシュボード</a>
            <a href="faq-management.html" class="nav-item" data-page="faq-management">FAQ管理</a>
            <a href="faq-upload.html" class="nav-item" data-page="faq-upload">FAQアップロード</a>
            <!-- 新しいメニューを追加 -->
            <a href="new-page.html" class="nav-item" data-page="new-page">新しいページ</a>
            <button class="nav-item logout-btn" onclick="logout()">ログアウト</button>
        </nav>
    `;
    // ...
}
```

## メリット

### 1. メンテナンス性の向上
- サイドバーの修正が1箇所で完了
- 新しいメニュー項目の追加が簡単
- スタイルの統一が容易

### 2. コードの削減
- 重複コードの大幅削減
- ファイルサイズの最適化
- 開発効率の向上

### 3. 一貫性の確保
- 全画面で統一されたUI/UX
- ナビゲーション動作の統一
- レスポンシブ対応の統一

### 4. 拡張性の向上
- 新しい画面の追加が容易
- 機能追加時の影響範囲が明確
- テストの効率化

## 注意事項

- 新しいページを作成する際は、必ず共通ファイルを読み込んでください
- サイドバーの修正は`common/sidebar.js`で行ってください
- ページ固有のスタイルは各HTMLファイル内の`<style>`タグで定義してください

## 今後の改善案

1. **ヘッダーの共通化**: サイドバーと同様にヘッダーも共通化
2. **テンプレートエンジンの導入**: より高度な共通化のためのテンプレート機能
3. **コンポーネント化**: モーダル、フォームなどの共通コンポーネント作成
4. **ビルドプロセスの導入**: CSS/JSの最適化とバンドル化