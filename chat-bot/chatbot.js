// HR AI Chatbot 機能の実装 - 画像UIに完全対応

// DOM要素の取得
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');
const newChatBtn = document.querySelector('.new-chat-btn');
const welcomeContainer = document.getElementById('welcomeContainer');
const chatContainer = document.getElementById('chatContainer');
const stopResponseArea = document.getElementById('stopResponseArea');
const stopResponseBtn = document.getElementById('stopResponseBtn');
const sourceDisplay = document.getElementById('sourceDisplay');

// タブ機能用の変数
let currentTab = 'faq';
const chatHistory = {
    notion: {
        messages: [],
        isWelcomeVisible: true
    },
    faq: {
        messages: [],
        isWelcomeVisible: true
    }
};

// 応答制御用の変数
let currentResponseTimeout = null;
let isResponding = false;

// IME制御用の変数
let isComposing = false;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeChatbot();
    setupNewChatButton();
    setupStopResponseButton();
    setupTabSwitching();
    setupUsageToggle();
});

// チャットボットの初期化
function initializeChatbot() {
    // 入力フィールドのイベント
    messageInput.addEventListener('input', function() {
        // 送信ボタンの状態
        sendButton.disabled = this.value.trim() === '';
    });

    // IME変換開始
    messageInput.addEventListener('compositionstart', function() {
        isComposing = true;
    });

    // IME変換終了
    messageInput.addEventListener('compositionend', function() {
        isComposing = false;
    });

    // Enter送信（IME変換中は無視）
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 送信ボタン
    sendButton.addEventListener('click', sendMessage);

    // 初期状態
    sendButton.disabled = true;
}

// 新規チャットボタンの設定
function setupNewChatButton() {
    if (newChatBtn) {
        newChatBtn.addEventListener('click', function() {
            startNewChat();
        });
    }
}

// 応答を停止ボタンの設定
function setupStopResponseButton() {
    if (stopResponseBtn) {
        stopResponseBtn.addEventListener('click', function() {
            stopBotResponse();
        });
    }
}

// タブ切り替えの設定
function setupTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

// タブを切り替える
function switchTab(tabName) {
    if (tabName === currentTab) return;
    
    // 現在のタブの状態を保存
    saveCurrentTabState();
    
    // タブUIを更新
    updateTabUI(tabName);
    
    // 新しいタブの状態を復元
    currentTab = tabName;
    restoreTabState(tabName);
    
    // データソース表示を更新
    updateDataSourceDisplay(tabName);
}

// 現在のタブの状態を保存
function saveCurrentTabState() {
    const currentMessages = Array.from(chatMessages.children).map(msg => {
        return {
            type: msg.classList.contains('user') ? 'user' : 'bot',
            content: msg.querySelector('.message-content').innerHTML
        };
    });
    
    chatHistory[currentTab].messages = currentMessages;
    chatHistory[currentTab].isWelcomeVisible = welcomeContainer.style.display !== 'none';
}

// タブUIを更新
function updateTabUI(tabName) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// タブの状態を復元
function restoreTabState(tabName) {
    const tabData = chatHistory[tabName];
    
    // チャットメッセージをクリア
    chatMessages.innerHTML = '';
    
    // メッセージを復元
    tabData.messages.forEach(msg => {
        addMessageFromHistory(msg.content, msg.type);
    });
    
    // ウェルカム画面の表示状態を復元
    if (tabData.isWelcomeVisible) {
        welcomeContainer.style.display = 'flex';
        chatContainer.style.display = 'none';
    } else {
        welcomeContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
    }
    
    // 応答を停止
    stopBotResponse();
}

// 履歴からメッセージを追加（スクロールなし）
function addMessageFromHistory(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    if (type === 'bot') {
        messageDiv.innerHTML = `
            <div class="bot-avatar">🤖</div>
            <div class="message-content">${text}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="user-avatar">👤</div>
            <div class="message-content">${text}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
}

// データソース表示を更新
function updateDataSourceDisplay(tabName) {
    if (sourceDisplay) {
        sourceDisplay.textContent = tabName === 'notion' ? 'ドキュメント' : 'FAQ';
    }
}

// 新規チャットを開始
function startNewChat() {
    // 現在のタブのみクリア
    chatHistory[currentTab].messages = [];
    chatHistory[currentTab].isWelcomeVisible = true;
    
    // ウェルカム画面を表示
    welcomeContainer.style.display = 'flex';
    chatContainer.style.display = 'none';
    
    // チャットメッセージをクリア
    chatMessages.innerHTML = '';
    
    // 入力フィールドをクリア
    messageInput.value = '';
    sendButton.disabled = true;
    
    // タイピングインジケーターを非表示
    hideTypingIndicator();
    
    // 応答を停止
    stopBotResponse();
}

// チャット画面に切り替え
function switchToChatView() {
    welcomeContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
    
    // 現在のタブの状態を更新
    chatHistory[currentTab].isWelcomeVisible = false;
}

// メッセージ送信
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // 初回メッセージの場合、チャット画面に切り替え
    if (welcomeContainer.style.display !== 'none') {
        switchToChatView();
    }

    // ユーザーメッセージを追加
    addMessage(message, 'user');
    messageInput.value = '';
    sendButton.disabled = true;

    // タイピングインジケーターを表示
    showTypingIndicator();

    // ボットの返答をシミュレート
    isResponding = true;
    const responseDelay = 1500 + Math.random() * 1000;
    
    currentResponseTimeout = setTimeout(() => {
        if (isResponding) {
            hideTypingIndicator();
            // タイピングインジケーターが確実に非表示になってからボットメッセージを表示
            setTimeout(() => {
                if (isResponding) {
                    const botResponse = generateBotResponse(message);
                    addMessage(botResponse, 'bot');
                    hideStopResponseButton();
                    isResponding = false;
                }
            }, 100);
        }
    }, responseDelay);
}

// メッセージを追加
function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    if (type === 'bot') {
        messageDiv.innerHTML = `
            <div class="bot-avatar">🤖</div>
            <div class="message-content">${text}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="user-avatar">👤</div>
            <div class="message-content">${text}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 現在のタブの履歴に追加
    chatHistory[currentTab].messages.push({
        type: type,
        content: text
    });
}

// タイピングインジケーターを表示
function showTypingIndicator() {
    typingIndicator.classList.add('show');
    showStopResponseButton();
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// タイピングインジケーターを非表示
function hideTypingIndicator() {
    typingIndicator.classList.remove('show');
}

// 応答を停止ボタンを表示
function showStopResponseButton() {
    if (stopResponseArea) {
        stopResponseArea.style.display = 'block';
    }
}

// 応答を停止ボタンを非表示
function hideStopResponseButton() {
    if (stopResponseArea) {
        stopResponseArea.style.display = 'none';
    }
}

// ボットの応答を停止
function stopBotResponse() {
    if (currentResponseTimeout) {
        clearTimeout(currentResponseTimeout);
        currentResponseTimeout = null;
    }
    isResponding = false;
    hideTypingIndicator();
    hideStopResponseButton();
}

// ボットの返答を生成
function generateBotResponse(userMessage) {
    // タブごとの応答設定
    const tabResponses = {
        notion: {
            commonResponse: '【ドキュメント】ご質問ありがとうございます。ドキュメントに保存された最新の人事制度情報から回答いたします。給与体系、評価制度、休暇制度、福利厚生、研修制度、働き方改革など、幅広い人事制度についてご案内できます。<br><br>参照元：<a href="https://company.notion.site/docs/hr-database" target="_blank">https://company.notion.site/docs/hr-database</a>',
            defaultGreeting: 'こんにちは！HR AI アシスタント（ドキュメント版）です。ドキュメントに保存された最新の人事制度情報からお答えします。何でもお聞きください。📝',
            defaultResponse: 'ご質問ありがとうございます。ドキュメントの人事制度データベースから情報を検索しています。より具体的な内容をお聞かせください。<br><br>📝 ドキュメントから検索可能な項目：<br>• 給与体系・昇進制度<br>• 休暇・福利厚生制度<br>• 評価制度・研修制度<br>• 働き方改革の取り組み<br><br>参照元：<a href="https://company.notion.site/docs/hr-database" target="_blank">https://company.notion.site/docs/hr-database</a>'
        },
        faq: {
            commonResponse: '【FAQ】ご質問ありがとうございます。よくある質問データベースから関連する回答をご案内いたします。給与、評価、休暇、福利厚生、研修、働き方などの人事制度に関するFAQを検索して、最適な回答をお探しします。<br><br>参照元：<a href="https://company.example.com/faq" target="_blank">https://company.example.com/faq</a>',
            defaultGreeting: 'こんにちは！HR AI アシスタント（FAQ版）です。よくある質問データベースから最適な回答をお探しします。お気軽にお聞きください。❓',
            defaultResponse: 'ご質問ありがとうございます。FAQデータベースから関連する質問を検索しています。より具体的な内容をお聞かせください。<br><br>❓ FAQ検索可能な項目：<br>• 給与・評価に関するFAQ<br>• 休暇・福利厚生のFAQ<br>• 研修・キャリアのFAQ<br>• 各種手続きのFAQ<br><br>参照元：<a href="https://company.example.com/faq" target="_blank">https://company.example.com/faq</a>'
        }
    };

    const currentTabData = tabResponses[currentTab];

    // 挨拶への対応
    if (userMessage.includes('こんにちは') || userMessage.includes('おはよう') || userMessage.includes('こんばんは')) {
        return currentTabData.defaultGreeting;
    }

    if (userMessage.includes('ありがとう')) {
        const source = currentTab === 'notion' ? 'ドキュメント' : 'FAQ';
        return `どういたしまして！他にも${source}から検索できる人事制度について気になることがあれば、いつでもお気軽にお声がけください。お役に立てて嬉しいです。😊`;
    }

    if (userMessage.includes('はじめまして') || userMessage.includes('初めて')) {
        return currentTabData.defaultGreeting;
    }

    // キーワードマッチング（人事制度関連の質問の場合は共通回答を返す）
    const hrKeywords = ['人事制度', '給与', '評価', '昇進', '休暇', '福利厚生', '研修', '働き方'];
    const hasHrKeyword = hrKeywords.some(keyword => userMessage.includes(keyword));
    
    if (hasHrKeyword) {
        return currentTabData.commonResponse;
    }

    // デフォルトレスポンス
    return currentTabData.defaultResponse;
}

// 使い方説明のトグル機能をセットアップ
function setupUsageToggle() {
    const usageToggle = document.getElementById('usageToggle');
    const usageContent = document.getElementById('usageContent');
    
    if (!usageToggle || !usageContent) return;
    
    // 初期状態は閉じた状態
    let isCollapsed = true;
    
    // 初期状態を閉じた状態に設定
    usageContent.classList.add('collapsed');
    usageToggle.classList.add('collapsed');
    
    usageToggle.addEventListener('click', function() {
        isCollapsed = !isCollapsed;
        
        if (isCollapsed) {
            // 閉じる
            usageContent.classList.add('collapsed');
            usageToggle.classList.add('collapsed');
        } else {
            // 開く
            usageContent.classList.remove('collapsed');
            usageToggle.classList.remove('collapsed');
        }
    });
}

// ユーティリティ関数
function getCurrentTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + 
           now.getMinutes().toString().padStart(2, '0');
}

function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// エクスポート（モジュール化する場合）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sendMessage,
        addMessage,
        generateBotResponse,
        startNewChat,
        switchToChatView
    };
}