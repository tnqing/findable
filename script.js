const categories = [
    "AI/테크", "건강", "감성숙소", "경제소식", "독서", "레시피", 
    "러닝", "맛집", "부동산", "세금", "생활정보", "세계뉴스", 
    "쇼핑", "스트레칭/재활", "식단/다이어트", 
    "뷰티", "여행", "외국어", "요가/필라테스", "음악/플리", 
    "인테리어", "자기계발", "자녀교육", "자전거", "정리정돈", "주식/ETF", 
    "직장/커리어", "창업/사업", "까페/베이커리", "헬스/웨이트", "행사/전시", "유머", 
    "아트", "취미", "덕질"
];

// Load stored content from LocalStorage or use defaults
let storedContents = JSON.parse(localStorage.getItem('findable_contents')) || {
    "레시피": [
        { title: "임성근 임짱TV: 된장 맛난이 레시피", url: "https://www.youtube.com/watch?v=eMQSosgeMBk", platform: "YouTube", thumbnail: "https://img.youtube.com/vi/eMQSosgeMBk/mqdefault.jpg", clicks: 50 },
        { title: "20년 전통 영업비밀, 양념깻잎 황금레시피", url: "https://www.instagram.com/reels/DWSeNQngiEc/", platform: "Instagram", thumbnail: "https://via.placeholder.com/400x400/f1f5f9/94a3b8?text=Recipe", clicks: 12 }
    ],
    "인테리어": [
        { title: "ninakaempf 인스타그램 하우스인테리어", url: "https://www.instagram.com/reels/DWTQkXejK06/", platform: "Instagram", thumbnail: "https://via.placeholder.com/400x400/f1f5f9/94a3b8?text=Interior", clicks: 5 }
    ],
    "자녀교육": [
        { title: "영어 내신 1등급 필살기 - 부교재 PDF 구하는 법", url: "https://www.instagram.com/reels/DWOYINPjBfN/", platform: "Instagram", thumbnail: "https://via.placeholder.com/400x400/f1f5f9/94a3b8?text=Education", clicks: 8 }
    ],
    "AI/테크": [
        { title: "2026년 99%가 모르는 AI의 3단계 구조", url: "https://www.instagram.com/reels/DWNW70hEg96/", platform: "Instagram", thumbnail: "https://via.placeholder.com/400x400/f1f5f9/94a3b8?text=AI+Tech", clicks: 15 }
    ]
};

const sortedCategories = [...categories].sort((a, b) => a.localeCompare(b, 'ko'));
const categoryGrid = document.getElementById('category-grid');
const categoryOverlay = document.getElementById('category-overlay');
const contentOverlay = document.getElementById('content-overlay');
const addLinkOverlay = document.getElementById('add-link-overlay');

const openBtn = document.getElementById('open-categories');
const submitBtn = document.getElementById('submit-categories');
const backBtn = document.getElementById('header-back-btn');
const guidanceMsg = document.getElementById('main-guidance-msg');
const selectedDisplay = document.getElementById('selected-display');

const topLinksGrid = document.getElementById('top-links-grid');
const allLinksList = document.getElementById('all-links-list');
const modalCategoryName = document.getElementById('modal-category-name');
const searchInput = document.getElementById('content-search');

const addLinkBtn = document.getElementById('add-link-btn');
const saveLinkBtn = document.getElementById('save-link-btn');
const newLinkInput = document.getElementById('new-link-url');
const newImageInput = document.getElementById('new-image-upload');
const newLinkTitleInput = document.getElementById('new-link-title');
const fileNameDisplay = document.getElementById('file-name-display');

const aiSettingsBtn = document.getElementById('ai-settings-btn');
const aiSettingsOverlay = document.getElementById('ai-settings-overlay');
const saveAiKeyBtn = document.getElementById('save-ai-key-btn');
const aiApiKeyInput = document.getElementById('ai-api-key');

function getApiKey() {
    return localStorage.getItem('findable_gemini_key') || "";
}

aiSettingsBtn.addEventListener('click', () => {
    aiApiKeyInput.value = getApiKey();
    aiSettingsOverlay.classList.add('active');
    history.pushState({modal:'ai'}, '', '');
});
aiSettingsOverlay.addEventListener('click', (e) => { e.target === aiSettingsOverlay && history.back() });
saveAiKeyBtn.addEventListener('click', () => {
    localStorage.setItem('findable_gemini_key', aiApiKeyInput.value.trim());
    aiSettingsOverlay.classList.remove('active');
    alert("AI 키가 저장되었습니다! 이제 제목이 똑똑하게 달립니다 ✨");
});

let selectedItems = new Set();
let currentCategory = "";

function loadSettings() {
    const saved = localStorage.getItem('findable_categories');
    if (saved) {
        selectedItems = new Set(JSON.parse(saved));
        renderSelected();
    }
    const activeCat = localStorage.getItem('active_category');
    if (activeCat && selectedItems.has(activeCat)) {
        openContentView(activeCat);
    }
}

function saveSettings() {
    localStorage.setItem('findable_categories', JSON.stringify(Array.from(selectedItems)));
}

function saveContents() {
    try {
        localStorage.setItem('findable_contents', JSON.stringify(storedContents));
    } catch (e) {
        console.error("Local storage error:", e);
        // Alert user if quota exceeded
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.message.includes("quota")) {
            alert('🚨 저장 공간이 부족합니다! 너무 많은 이미지가 저장되었거나 이미지 용량이 너무 큽니다. 불필요한 게시물을 삭제해주세요.');
            // Revert state if possible or let user manually fix it
        }
    }
}

function initGrid() {
    categoryGrid.innerHTML = '';
    sortedCategories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'category-item';
        if (selectedItems.has(cat)) item.classList.add('selected');
        item.innerHTML = `<span>${cat}</span>`;
        item.addEventListener('click', () => toggleCategory(item, cat));
        categoryGrid.appendChild(item);
    });
}

function toggleCategory(element, name) {
    if (selectedItems.has(name)) {
        selectedItems.delete(name);
        element.classList.remove('selected');
    } else if (selectedItems.size < 10) {
        selectedItems.add(name);
        element.classList.add('selected');
    }
    submitBtn.disabled = selectedItems.size === 0;
}

// Event Listeners
openBtn.addEventListener('click', () => { initGrid(); categoryOverlay.classList.add('active'); history.pushState({modal:'category'}, '', ''); });
categoryOverlay.addEventListener('click', (e) => { e.target === categoryOverlay && history.back() });
submitBtn.addEventListener('click', () => { saveSettings(); categoryOverlay.classList.remove('active'); renderSelected(); });

// Add Link Logic
addLinkBtn.addEventListener('click', () => { addLinkOverlay.classList.add('active'); history.pushState({modal:'add'}, '', ''); });
addLinkOverlay.addEventListener('click', (e) => { e.target === addLinkOverlay && history.back() });

async function fetchTitle(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = "";
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/shorts/')) {
            videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
        } else if (url.includes('v=')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        }
        
        if (videoId) {
            try {
                const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
                const ytResponse = await fetch(oembedUrl);
                if (ytResponse.ok) {
                    const ytData = await ytResponse.json();
                    if (ytData.title) return ytData.title;
                }
            } catch (e) {
                console.error("YouTube oembed fetch failed:", e);
            }
        }
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
        
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        let title = doc.querySelector('title')?.innerText || '';
        return title.replace(/\n/g, '').trim();
    } catch (e) {
        console.error("Title fetch failed or timed out:", e);
        return null;
    }
}

saveLinkBtn.addEventListener('click', async () => {
    const url = newLinkInput.value.trim();
    const file = newImageInput.files[0];

    if (!url && !file) return;

    const originalText = saveLinkBtn.textContent;
    saveLinkBtn.textContent = "저장 중...";
    saveLinkBtn.disabled = true;

    if (!storedContents[currentCategory]) storedContents[currentCategory] = [];

    if (file) {
        try {
            const base64Image = await resizeImage(file, 800);
            const userTitle = newLinkTitleInput.value.trim();
            let title = userTitle || file.name.split('.')[0] || "화면 캡처 이미지";
            
            if (!userTitle && getApiKey()) {
                saveLinkBtn.textContent = "AI가 사진 분석 중...";
                const aiTitle = await analyzeWithGemini(base64Image, 'image');
                if (aiTitle) title = aiTitle;
            }

            storedContents[currentCategory].push({
                title: title,
                url: base64Image,
                platform: "Image",
                thumbnail: base64Image,
                clicks: 0
            });
        } catch (e) {
            console.error("Image process error", e);
        }
    } else if (url) {
        // Platform & Basic logic
        let platform = "Web";
        let thumb = `https://via.placeholder.com/400x225/f1f5f9/94a3b8?text=New+Link`;

        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            platform = "YouTube";
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
            if (videoId) thumb = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        } else if (url.includes('instagram.com')) {
            platform = "Instagram";
        }

        let rawTitle = await fetchTitle(url);
        
        if (!rawTitle) {
            if (platform === "YouTube") rawTitle = "YouTube 영상";
            else if (platform === "Instagram") rawTitle = "Instagram 게시물";
            else rawTitle = url;
        }

        const userTitle = newLinkTitleInput.value.trim();
        let title = userTitle || rawTitle;

        if (!userTitle && getApiKey()) {
            saveLinkBtn.textContent = "AI가 내용 파악 중...";
            const aiTitle = await analyzeWithGemini({ url, rawTitle }, 'url');
            if (aiTitle) title = aiTitle;
        }

        storedContents[currentCategory].push({
            title: title,
            url: url,
            platform: platform,
            thumbnail: thumb,
            clicks: 0,
            liked: false
        });
    }

    saveContents();
    renderContentSections(searchInput.value);
    
    newLinkInput.value = "";
    newImageInput.value = "";
    newLinkTitleInput.value = "";
    fileNameDisplay.textContent = "클릭하여 이미지 선택";
    saveLinkBtn.textContent = originalText;
    saveLinkBtn.disabled = false;
    addLinkOverlay.classList.remove('active');
});

// Helper: Resize Image for LocalStorage
function resizeImage(file, maxWidth = 800) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

newImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
    } else {
        fileNameDisplay.textContent = '클릭하여 이미지 선택';
    }
});

// AI Analyze Logic using Gemini
async function analyzeWithGemini(content, type) {
    const key = getApiKey();
    if (!key) return null;

    let promptText = "";
    let inlineData = null;

    if (type === 'image') {
        promptText = "이 이미지를 한 문장으로 요약해서 핵심 내용을 나타내는 2~5단어 사이의 한국어 제목을 지어줘. (예: 한강 공원 피크닉, 맛집 영수증 리뷰). 아무런 부가 설명이나 인사 없이 제목만 딱 하나 반환해.";
        inlineData = { mime_type: "image/jpeg", data: content.split(',')[1] };
    } else {
        const cleanRawTitle = (content.rawTitle || "").substring(0, 100);
        promptText = `다음 링크와 제목을 보고 이 글의 핵심 내용을 유추해서 3~6단어 사이의 명확한 한국어 제목을 하나만 지어줘. 링크: ${content.url}, 원본제목: ${cleanRawTitle}. 일반적인 'YouTube 영상'이나 '인스타그램' 같은 말은 빼고 구체적인 핵심만! 다른 문구 없이 제목만 반환해.`;
    }

    const payload = {
        contents: [{
            parts: [
                { text: promptText },
                ...(inlineData ? [{ inline_data: inlineData }] : [])
            ]
        }],
        generationConfig: { maxOutputTokens: 50, temperature: 0.2 }
    };

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const json = await res.json();

        if (json.error) {
            console.error("Gemini API Error Detail:", json.error.message);
            if (json.error.message.includes("API key not valid")) {
                alert("AI 설정: 입력하신 API 키가 올바르지 않은 것 같습니다. 다시 확인해 주세요!");
            }
            return null;
        }

        if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) {
            return json.candidates[0].content.parts[0].text.replace(/\n/g, '').replace(/"/g, '').trim();
        } else {
            console.warn("Gemini response is empty or invalid format", json);
            return null;
        }
    } catch (e) {
        console.error("Gemini AI fetch fail:", e);
        return null;
    }
}

function renderSelected() {
    selectedDisplay.innerHTML = '';
    selectedDisplay.classList.add('visible');
    Array.from(selectedItems).forEach(cat => {
        const tag = document.createElement('div');
        tag.className = 'selection-tag';
        tag.textContent = cat;
        tag.addEventListener('click', () => openContentView(cat));
        selectedDisplay.appendChild(tag);
    });
}

function openContentView(category) {
    currentCategory = category;
    localStorage.setItem('active_category', category);
    modalCategoryName.textContent = category;
    backBtn.classList.add('active');
    guidanceMsg.classList.add('hidden');
    renderContentSections("");
    contentOverlay.classList.add('active');
    history.pushState({modal:'content'}, '', '');
}

function renderContentSections(query) {
    topLinksGrid.innerHTML = '';
    allLinksList.innerHTML = '';

    let allItems = (storedContents[currentCategory] || []).filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
    );
    if (window.showLikedOnly) {
        allItems = allItems.filter(item => item.liked);
    }

    if (allItems.length === 0) {
        allLinksList.innerHTML = `<div class="empty-state"><p>저장된 링크가 없습니다.</p></div>`;
        return;
    }

    // Top 10
    const top10 = [...allItems].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 10);
    top10.forEach(item => {
        const card = document.createElement(item.platform === 'Image' ? 'div' : 'a');
        if (item.platform !== 'Image') {
            card.href = item.url;
            card.addEventListener('click', (e) => e.preventDefault()); // Prevent default navigation
        }
        card.className = 'content-card';
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => { 
            if(e.target.closest('.card-actions')) return; // Ignore clicks on action buttons
            item.clicks = (item.clicks || 0) + 1; 
            saveContents(); 
            if (item.platform === 'Image') {
                const viewer = document.getElementById('image-viewer-overlay');
                document.getElementById('viewer-img').src = item.url;
                viewer.classList.add('active');
                history.pushState({modal:'image'}, '', '');
            } else {
                openItemDetail(item);
            }
        });
        
        const thumb = item.thumbnail || 'https://via.placeholder.com/400x225/f1f5f9/94a3b8?text=Link';
        card.innerHTML = `
            <div class="card-thumbnail"><span class="platform-badge">${item.platform}</span><img src="${thumb}"></div>
            <div class="card-info"><h3 class="card-title">${item.title}</h3></div>
            <div class="card-actions">
                <button class="action-btn heart-btn ${item.liked ? 'liked' : ''}" title="좋아요"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></button>
                <button class="action-btn edit-btn" title="제목 수정"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                <button class="action-btn delete-btn" title="삭제"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
            </div>
        `;
        
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');
        const heartBtn = card.querySelector('.heart-btn');
        
        heartBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            item.liked = !item.liked;
            saveContents();
            renderContentSections(searchInput.value);
        });

        editBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            const newTitle = prompt("새로운 제목을 입력하세요:", item.title);
            if (newTitle !== null && newTitle.trim() !== "") {
                item.title = newTitle.trim();
                saveContents();
                renderContentSections(searchInput.value);
            }
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (confirm("게시물을 삭제하시겠습니까?")) {
                const idx = storedContents[currentCategory].indexOf(item);
                if (idx > -1) {
                    storedContents[currentCategory].splice(idx, 1);
                    saveContents();
                    renderContentSections(searchInput.value);
                }
            }
        });

        topLinksGrid.appendChild(card);
    });

    // All List
    allItems.forEach(item => {
        const listItem = document.createElement(item.platform === 'Image' ? 'div' : 'a');
        if (item.platform !== 'Image') {
            listItem.href = item.url;
            listItem.addEventListener('click', (e) => e.preventDefault());
        }
        listItem.className = 'list-item';
        listItem.style.cursor = 'pointer';
        listItem.addEventListener('click', (e) => { 
            if(e.target.closest('.list-actions')) return;
            item.clicks = (item.clicks || 0) + 1; 
            saveContents(); 
            if (item.platform === 'Image') {
                const viewer = document.getElementById('image-viewer-overlay');
                document.getElementById('viewer-img').src = item.url;
                viewer.classList.add('active');
                history.pushState({modal:'image'}, '', '');
            } else {
                openItemDetail(item);
            }
        });
        
        const thumb = item.thumbnail || 'https://via.placeholder.com/80x45/f1f5f9/94a3b8?text=Link';
        listItem.innerHTML = `
            <img src="${thumb}" class="list-thumb">
            <div class="list-item-info">
                <div class="list-title">${item.title}</div>
                <div class="list-meta">${item.platform} • ${item.url.substring(0, 40)}...</div>
            </div>
            <div class="list-actions">
                <button class="action-btn heart-btn ${item.liked ? 'liked' : ''}" title="좋아요"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></button>
                <button class="action-btn edit-btn" title="제목 수정"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
                <button class="action-btn delete-btn" title="삭제"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
                <button class="action-btn" title="바로 방문하기" onclick="window.open('${item.url}', '_blank');"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg></button>
            </div>
        `;
        
        const listEditBtn = listItem.querySelector('.edit-btn');
        const listDeleteBtn = listItem.querySelector('.delete-btn');
        const listHeartBtn = listItem.querySelector('.heart-btn');
        
        listHeartBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            item.liked = !item.liked;
            saveContents();
            renderContentSections(searchInput.value);
        });

        listEditBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            const newTitle = prompt("새로운 제목을 입력하세요:", item.title);
            if (newTitle !== null && newTitle.trim() !== "") {
                item.title = newTitle.trim();
                saveContents();
                renderContentSections(searchInput.value);
            }
        });
        
        listDeleteBtn.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (confirm("게시물을 삭제하시겠습니까?")) {
                const idx = storedContents[currentCategory].indexOf(item);
                if (idx > -1) {
                    storedContents[currentCategory].splice(idx, 1);
                    saveContents();
                    renderContentSections(searchInput.value);
                }
            }
        });

        allLinksList.appendChild(listItem);
    });
}

searchInput.addEventListener('input', (e) => renderContentSections(e.target.value));

function closeContentView(fromPopState = false) {
    contentOverlay.classList.remove('active');
    backBtn.classList.remove('active');
    guidanceMsg.classList.remove('hidden');
    searchInput.value = "";
    addLinkOverlay.classList.remove('active');
    localStorage.removeItem('active_category');
    if (fromPopState !== true) {
        // history.back() might be called if user clicked UI back button
    }
}

backBtn.addEventListener('click', () => history.back());
contentOverlay.addEventListener('click', (e) => { e.target === contentOverlay && history.back() });

async function updateMissingTitles() {
    let updated = false;
    for (const category in storedContents) {
        for (let item of storedContents[category]) {
            // Update title if it's missing, or if it's just the URL, or a generic placeholder
            if (!item.title || item.title === item.url || item.title === "YouTube 영상" || item.title === "Instagram 게시물" || item.title === "새로운 링크") {
                try {
                    const fetchedTitle = await fetchTitle(item.url);
                    if (fetchedTitle && fetchedTitle !== item.url && fetchedTitle !== "Instagram") {
                        item.title = fetchedTitle;
                        updated = true;
                    }
                } catch (e) {
                    console.error("Failed to update title for", item.url);
                }
            }
        }
    }
    
    if (updated) {
        saveContents();
        if (currentCategory) {
            renderContentSections(searchInput.value);
        }
    }
}

// History Management for Modals
function pushModalState(modalId) {
    history.pushState({ modal: modalId }, '', '');
}

window.addEventListener('popstate', (e) => {
    // Whenever back button is pressed, we close the top-most active modal
    if (document.getElementById('item-detail-overlay').classList.contains('active')) {
        document.getElementById('item-detail-overlay').classList.remove('active');
        document.getElementById('detail-media-container').innerHTML = '';
    } else if (imageViewerOverlay.classList.contains('active')) {
        imageViewerOverlay.classList.remove('active');
    } else if (addLinkOverlay.classList.contains('active')) {
        addLinkOverlay.classList.remove('active');
    } else if (document.getElementById('ai-settings-overlay').classList.contains('active')) {
        document.getElementById('ai-settings-overlay').classList.remove('active');
    } else if (categoryOverlay.classList.contains('active')) {
        categoryOverlay.classList.remove('active');
    } else if (contentOverlay.classList.contains('active')) {
        closeContentView(true); // pass true to indicate it's from popstate
    }
});

// History Management logic continues past this point

document.addEventListener('DOMContentLoaded', () => { 
    loadSettings(); 
    initGrid(); 
    updateMissingTitles();
    // Heart filter button
    const filterBtn = document.getElementById('filter-liked-btn');
    window.showLikedOnly = false;
    filterBtn.addEventListener('click', () => {
        window.showLikedOnly = !window.showLikedOnly;
        filterBtn.classList.toggle('active');
        renderContentSections(searchInput.value);
    });
});

const imageViewerOverlay = document.getElementById('image-viewer-overlay');
const closeViewerBtn = document.getElementById('close-viewer-btn');

closeViewerBtn.addEventListener('click', () => { history.back(); });
imageViewerOverlay.addEventListener('click', (e) => { 
    if (e.target === imageViewerOverlay) history.back();
});

// Item Detail Logic
const itemDetailOverlay = document.getElementById('item-detail-overlay');
const closeDetailBtn = document.getElementById('close-detail-btn');
const detailTitle = document.getElementById('detail-title');
const detailMediaContainer = document.getElementById('detail-media-container');
const detailNoteDisplay = document.getElementById('detail-note-display');
const detailNoteInput = document.getElementById('detail-note-input');
const editNoteBtn = document.getElementById('edit-note-btn');
const detailFooter = document.getElementById('detail-footer');
const saveNoteBtn = document.getElementById('save-note-btn');

const aiSummarizeBtn = document.getElementById('ai-summarize-btn');

let currentDetailItem = null;

function openItemDetail(item) {
    currentDetailItem = item;
    detailTitle.textContent = item.title;
    
    // Media Logic
    detailMediaContainer.innerHTML = '';
    detailMediaContainer.style.display = 'none';
    
    if (item.platform === 'YouTube') {
        let videoId = "";
        if (item.url.includes('youtu.be/')) videoId = item.url.split('youtu.be/')[1]?.split('?')[0];
        else if (item.url.includes('youtube.com/shorts/')) videoId = item.url.split('youtube.com/shorts/')[1]?.split('?')[0];
        else if (item.url.includes('v=')) videoId = item.url.split('v=')[1]?.split('&')[0];
        
        if (videoId) {
            detailMediaContainer.style.display = 'block';
            detailMediaContainer.innerHTML = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}?autoplay=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border:none; border-radius: 16px;"></iframe>`;
        }
    } else {
        // Just show link if not youtube
        detailMediaContainer.style.display = 'block';
        detailMediaContainer.style.padding = '2rem';
        detailMediaContainer.style.textAlign = 'center';
        detailMediaContainer.style.background = 'var(--bg-card)';
        detailMediaContainer.innerHTML = `<a href="${item.url}" target="_blank" style="color: var(--accent-color); font-weight: 600; font-size: 1.1rem;">🔗 이 웹사이트 바로가기</a>`;
    }
    
    // Note Logic
    if (item.note) {
        detailNoteDisplay.textContent = item.note;
    } else {
        detailNoteDisplay.textContent = "메모가 없습니다. '수정하기'를 눌러 메모를 남겨보세요.";
    }
    detailNoteDisplay.style.display = 'block';
    detailNoteInput.style.display = 'none';
    editNoteBtn.textContent = '수정하기';
    editNoteBtn.style.display = 'block';
    detailFooter.style.display = 'none';
    
    // AI Summarize style rules
    aiSummarizeBtn.style.display = getApiKey() ? 'flex' : 'none';
    aiSummarizeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>AI로 다시 요약하기';
    aiSummarizeBtn.disabled = false;
    
    itemDetailOverlay.classList.add('active');
    history.pushState({modal:'detail'}, '', '');

    // Auto summarize if no note exists
    if (!item.note && getApiKey()) {
        setTimeout(runAISummarization, 50); // Small delay to let UI render first
    }
}

closeDetailBtn.addEventListener('click', () => {
    history.back();
});
itemDetailOverlay.addEventListener('click', (e) => { 
    if (e.target === itemDetailOverlay) {
        history.back();
    }
});

editNoteBtn.addEventListener('click', () => {
    if (detailNoteInput.style.display === 'none') {
        detailNoteInput.value = currentDetailItem.note || '';
        detailNoteDisplay.style.display = 'none';
        detailNoteInput.style.display = 'block';
        detailFooter.style.display = 'flex';
        editNoteBtn.textContent = '취소';
        detailNoteInput.focus();
    } else {
        detailNoteDisplay.style.display = 'block';
        detailNoteInput.style.display = 'none';
        detailFooter.style.display = 'none';
        editNoteBtn.textContent = '수정하기';
    }
});

saveNoteBtn.addEventListener('click', () => {
    if (currentDetailItem) {
        currentDetailItem.note = detailNoteInput.value.trim();
        saveContents();
        detailNoteDisplay.textContent = currentDetailItem.note || "메모가 없습니다. '수정하기'를 눌러 메모를 남겨보세요.";
        detailNoteDisplay.style.display = 'block';
        detailNoteInput.style.display = 'none';
        detailFooter.style.display = 'none';
        editNoteBtn.textContent = '수정하기';
    }
});

async function runAISummarization() {
    if (!currentDetailItem || !getApiKey()) return;
    
    const originalHtml = aiSummarizeBtn.innerHTML;
    aiSummarizeBtn.innerHTML = '요약 중...';
    aiSummarizeBtn.disabled = true;
    detailNoteDisplay.style.display = 'block';
    detailNoteInput.style.display = 'none';
    detailFooter.style.display = 'none';
    editNoteBtn.textContent = '수정하기';
    
    detailNoteDisplay.textContent = "✨ AI가 영상 제목과 링크를 분석하여 자동 요약본을 작성 중입니다...\n(약 2~5초 정도 소요될 수 있습니다 ⏳)";
    
    let promptText = `다음 링크와 영상 제목을 보고, 이것이 레시피(요리) 영상이라고 가정하여 핵심을 정리해줘. \n만약 요리 영상이 아니라면 해당 영상의 핵심 줄거리를 구조화해서 정리해줘.\n영상 제목: ${currentDetailItem.title}\n링크: ${currentDetailItem.url}\n\n[출력 형식 예시 - 요리인 경우]\n- 🍳 요리명: [요리 이름]\n- 🛒 준비 재료: [주요 재료 목록들]\n- 👨‍🍳 요리 순서:\n  1. ...\n  2. ...\n\n[출력 형식 예시 - 일반인 경우]\n- 📝 주제: [유추되는 주제]\n- 💡 핵심 요약: [내용 정리]\n\n최대한 구체적이고 깔끔한 단답형 마크다운으로 한글로 작성해.`;
    
    const key = getApiKey();
    const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { maxOutputTokens: 500, temperature: 0.3 }
    };
    
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        
        if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) {
            const summary = json.candidates[0].content.parts[0].text.trim();
            currentDetailItem.note = summary;
            saveContents();
            detailNoteDisplay.textContent = summary;
        } else {
            console.error("Gemini AI Summarize Error:", json);
            detailNoteDisplay.textContent = "❌ AI 요약에 실패했습니다. (Gemini가 영상 내용을 제대로 추측하지 못했거나 오류가 발생했습니다)\n우측 상단의 '수정하기'를 눌러 직접 요약을 등록해 보세요.";
        }
    } catch (e) {
        console.error(e);
        detailNoteDisplay.textContent = "❌ 네트워크 혹은 API 통신 오류로 요약에 실패했습니다.";
    }
    
    aiSummarizeBtn.innerHTML = originalHtml;
    aiSummarizeBtn.disabled = false;
}

aiSummarizeBtn.addEventListener('click', runAISummarization);

