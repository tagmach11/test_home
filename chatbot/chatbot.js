// 챗봇 데이터
let chatbotData = null;
let currentButtons = [];

// DOM 요소
const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotContainer = document.getElementById('chatbotContainer');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotButtons = document.getElementById('chatbotButtons');
const serviceNameEl = document.getElementById('serviceName');
const chatbotStatusEl = document.getElementById('chatbotStatus');

// 챗봇 초기화
async function initChatbot() {
    try {
        // 현재 스크립트의 경로를 기반으로 data.json 경로 결정
        const scriptPath = document.currentScript?.src || '';
        const basePath = scriptPath.includes('chatbot/') ? 'chatbot/data.json' : 'chatbot/data.json';
        const response = await fetch(basePath);
        chatbotData = await response.json();
        
        // 서비스명과 상태 설정
        if (serviceNameEl) serviceNameEl.textContent = chatbotData.serviceName;
        if (chatbotStatusEl) chatbotStatusEl.textContent = chatbotData.status;
        
        // 인사 메시지 표시
        showGreeting();
        
        // 질문 버튼 표시
        showQuestionButtons();
    } catch (error) {
        console.error('챗봇 데이터 로드 실패:', error);
        showError('챗봇을 불러오는 중 오류가 발생했습니다.');
    }
}

// 인사 메시지 표시
function showGreeting() {
    if (!chatbotData) return;
    
    const greetingMessage = {
        type: 'bot',
        text: chatbotData.greeting
    };
    
    addMessage(greetingMessage);
}

// 질문 버튼 표시
function showQuestionButtons(questions = null) {
    if (!chatbotData) return;
    
    chatbotButtons.innerHTML = '';
    currentButtons = [];
    
    const questionsToShow = questions || chatbotData.questions;
    
    questionsToShow.forEach((item, index) => {
        const button = document.createElement('button');
        button.className = 'chatbot-button';
        if (item.id === 'contact-agent') {
            button.classList.add('contact');
        }
        button.textContent = item.question;
        button.setAttribute('data-question-id', item.id);
        button.addEventListener('click', () => handleQuestionClick(item));
        
        chatbotButtons.appendChild(button);
        currentButtons.push(item);
    });
}

// 질문 클릭 처리
function handleQuestionClick(questionData) {
    // 사용자 메시지 추가
    addMessage({
        type: 'user',
        text: questionData.question
    });
    
    // 답변 추가
    setTimeout(() => {
        addMessage({
            type: 'bot',
            text: questionData.answer
        });
        
        // 상담원 연결 버튼이 아니면 질문 버튼 다시 표시
        if (questionData.id !== 'contact-agent') {
            showQuestionButtons();
        }
    }, 300);
}

// 메시지 추가
function addMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${message.type}`;
    
    const bubble = document.createElement('div');
    bubble.className = `chatbot-bubble ${message.type}`;
    bubble.textContent = message.text;
    
    // 봇 메시지의 경우 줄바꿈 및 리스트 포맷팅
    if (message.type === 'bot') {
        formatBotMessage(bubble, message.text);
    }
    
    messageDiv.appendChild(bubble);
    chatbotMessages.appendChild(messageDiv);
    
    // 스크롤을 맨 아래로
    scrollToBottom();
}

// 봇 메시지 포맷팅 (리스트, 링크 등)
function formatBotMessage(element, text) {
    // HTML 엔티티 처리
    let formattedText = text
        .replace(/\n/g, '<br>')
        .replace(/•/g, '&bull;')
        .replace(/✓/g, '&check;')
        .replace(/🔒/g, '🔒')
        .replace(/🛡️/g, '🛡️')
        .replace(/📋/g, '📋')
        .replace(/📧/g, '📧')
        .replace(/📞/g, '📞')
        .replace(/😊/g, '😊');
    
    // 번호 리스트 처리 (1️⃣, 2️⃣ 등)
    formattedText = formattedText.replace(/(\d+)️⃣/g, '<strong>$1.</strong>');
    
    // 강조 표시 (**텍스트**)
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 이메일과 전화번호 링크 처리
    formattedText = formattedText.replace(/([\w.-]+@[\w.-]+\.\w+)/g, '<a href="mailto:$1">$1</a>');
    formattedText = formattedText.replace(/(\d{2,3}-\d{3,4}-\d{4})/g, '<a href="tel:$1">$1</a>');
    
    element.innerHTML = formattedText;
}

// 스크롤을 맨 아래로
function scrollToBottom() {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// 에러 메시지 표시
function showError(message) {
    addMessage({
        type: 'bot',
        text: message
    });
}

// 챗봇 열기
function openChatbot() {
    chatbotContainer.classList.remove('hidden');
    chatbotToggle.classList.add('hidden');
    setTimeout(() => {
        chatbotContainer.classList.add('active');
    }, 10);
}

// 챗봇 닫기
function closeChatbot() {
    chatbotContainer.classList.remove('active');
    setTimeout(() => {
        chatbotContainer.classList.add('hidden');
        chatbotToggle.classList.remove('hidden');
    }, 300);
}

// 이벤트 리스너
if (chatbotToggle) {
    chatbotToggle.addEventListener('click', openChatbot);
}

if (chatbotClose) {
    chatbotClose.addEventListener('click', closeChatbot);
}

// ESC 키로 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatbotContainer.classList.contains('active')) {
        closeChatbot();
    }
});

// 외부 클릭 시 닫기 (선택사항)
document.addEventListener('click', (e) => {
    if (chatbotContainer.classList.contains('active') && 
        !chatbotContainer.contains(e.target) && 
        !chatbotToggle.contains(e.target)) {
        // 주석 해제 시 외부 클릭으로 닫기 활성화
        // closeChatbot();
    }
});

// 초기화
initChatbot();

