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
let currentTab = 'notion';
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

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeChatbot();
    setupNewChatButton();
    setupStopResponseButton();
    setupTabSwitching();
});

// チャットボットの初期化
function initializeChatbot() {
    // 入力フィールドのイベント
    messageInput.addEventListener('input', function() {
        // 送信ボタンの状態
        sendButton.disabled = this.value.trim() === '';
    });

    // Enter送信
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
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
            const botResponse = generateBotResponse(message);
            addMessage(botResponse, 'bot');
            hideStopResponseButton();
            isResponding = false;
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
            responses: {
                '人事制度': '【ドキュメント】人事制度についてお答えします。ドキュメントに保存された最新の人事制度ドキュメントから情報を検索しています。具体的にどのような内容について知りたいですか？',
                '給与': '【ドキュメント】給与体系について説明いたします。ドキュメントの給与規定ページから最新情報を参照しています。基本給、賞与、各種手当について詳しくご案内できます。',
                '評価': '【ドキュメント】人事評価制度についてお答えします。ドキュメントの評価制度ドキュメントから最新の評価基準、評価期間、フィードバックプロセスをご案内します。',
                '昇進': '【ドキュメント】昇進制度について説明いたします。ドキュメントのキャリアパス資料から昇進の条件、評価基準について詳しくご案内できます。',
                '休暇': '【ドキュメント】休暇制度についてお答えします。ドキュメントの休暇規定から有給休暇、特別休暇、育児休暇の詳細をご確認いただけます。',
                '福利厚生': '【ドキュメント】福利厚生制度について説明いたします。ドキュメントの福利厚生ページから健康保険、退職金制度、研修制度の最新情報をお伝えします。',
                '研修': '【ドキュメント】研修制度についてお答えします。ドキュメントの人材開発ページから新人研修、スキルアップ研修、リーダーシップ研修について詳しくご案内します。',
                '働き方': '【ドキュメント】働き方改革の取り組みについて説明いたします。ドキュメントのワークスタイルページからリモートワーク、フレックスタイムの詳細をお伝えします。'
            },
            defaultGreeting: 'こんにちは！HR AI アシスタント（ドキュメント版）です。ドキュメントに保存された最新の人事制度情報からお答えします。何でもお聞きください。📝',
            defaultResponse: 'ご質問ありがとうございます。ドキュメントの人事制度データベースから情報を検索しています。より具体的な内容をお聞かせください。<br><br>📝 ドキュメントから検索可能な項目：<br>• 給与体系・昇進制度<br>• 休暇・福利厚生制度<br>• 評価制度・研修制度<br>• 働き方改革の取り組み'
        },
        faq: {
            responses: {
                '人事制度': '【FAQ】人事制度についてお答えします。よくある質問データベースから関連する質問と回答をご紹介します。',
                '給与': '【FAQ】給与に関するよくある質問から回答します。給与計算、昇給、賞与についてのFAQをご確認ください。',
                '評価': '【FAQ】評価制度に関するよくある質問をご紹介します。評価基準や面談についてのFAQをご覧いただけます。',
                '昇進': '【FAQ】昇進に関するよくある質問をお答えします。昇進の条件や手続きについてのFAQをご確認ください。',
                '休暇': '【FAQ】休暇制度に関するよくある質問をご紹介します。有給取得や各種休暇申請のFAQをご覧ください。',
                '福利厚生': '【FAQ】福利厚生に関するよくある質問をお答えします。各種制度の利用方法についてのFAQをご確認ください。',
                '研修': '【FAQ】研修に関するよくある質問をご紹介します。研修申込みや受講についてのFAQをご覧いただけます。',
                '働き方': '【FAQ】働き方に関するよくある質問をお答えします。リモートワークやフレックス制度のFAQをご確認ください。'
            },
            defaultGreeting: 'こんにちは！HR AI アシスタント（FAQ版）です。よくある質問データベースから最適な回答をお探しします。お気軽にお聞きください。❓',
            defaultResponse: 'ご質問ありがとうございます。FAQデータベースから関連する質問を検索しています。より具体的な内容をお聞かせください。<br><br>❓ FAQ検索可能な項目：<br>• 給与・評価に関するFAQ<br>• 休暇・福利厚生のFAQ<br>• 研修・キャリアのFAQ<br>• 各種手続きのFAQ'
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

    // キーワードマッチング
    for (let key in currentTabData.responses) {
        if (userMessage.includes(key)) {
            return currentTabData.responses[key];
        }
    }

    // デフォルトレスポンス
    return currentTabData.defaultResponse;
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