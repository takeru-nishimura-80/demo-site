// サイドバー共通機能
class Sidebar {
    constructor() {
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.setActiveNavItem();
    }

    render() {
        const sidebarHTML = `
            <div class="sidebar-header">
                <div class="sidebar-logo">FAQ管理システム</div>
            </div>
            <nav class="sidebar-nav">
                <div class="nav-main">
                    <a href="dashboard.html" class="nav-item" data-page="dashboard">ダッシュボード</a>
                    <a href="faq-management.html" class="nav-item" data-page="faq-management">FAQ管理</a>
                    <a href="faq-upload.html" class="nav-item" data-page="faq-upload">FAQアップロード</a>
                    <a href="category-management.html" class="nav-item" data-page="category-management">カテゴリ管理</a>
                    <a href="admin-management.html" class="nav-item" data-page="admin-management">管理者管理</a>
                </div>
                <div class="nav-footer">
                    <button class="nav-item logout-btn" onclick="logout()">ログアウト</button>
                </div>
            </nav>
        `;

        const sidebarElement = document.querySelector('.sidebar');
        if (sidebarElement) {
            sidebarElement.innerHTML = sidebarHTML;
        }
    }

    bindEvents() {
        // ナビゲーションアイテムのクリックイベント
        document.querySelectorAll('.nav-item:not(.logout-btn)').forEach(item => {
            item.addEventListener('click', (e) => {
                const href = item.getAttribute('href');
                
                // 現在のページと同じ場合は何もしない
                if (href && href !== window.location.pathname.split('/').pop()) {
                    window.location.href = href;
                } else {
                    e.preventDefault();
                }
                
                console.log('Navigation:', item.textContent.trim());
            });
        });
    }

    setActiveNavItem() {
        // 現在のページに基づいてアクティブなナビゲーションアイテムを設定
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            
            const dataPage = item.getAttribute('data-page');
            // FAQ管理関連のページは全て「FAQ管理」をアクティブにする
            // カテゴリ管理関連のページは全て「カテゴリ管理」をアクティブにする
            // 管理者管理関連のページは全て「管理者管理」をアクティブにする
            if (dataPage === currentPage ||
                (dataPage === 'faq-management' && (currentPage === 'faq-registration' || currentPage === 'faq-detail-edit')) ||
                (dataPage === 'category-management' && (currentPage === 'category-registration' || currentPage === 'category-detail-edit')) ||
                (dataPage === 'admin-management' && (currentPage === 'admin-registration' || currentPage === 'admin-detail-edit'))) {
                item.classList.add('active');
            }
        });
    }

    // モバイル用サイドバートグル
    toggleMobile() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('open');
    }
}

// ログアウト機能（グローバル関数として定義）
function logout() {
    // セッション情報をクリア
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('loginTime');
    
    // ログイン画面にリダイレクト
    window.location.href = 'login.html';
}

// DOMContentLoaded時にサイドバーを初期化
document.addEventListener('DOMContentLoaded', function() {
    new Sidebar();
});