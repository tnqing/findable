const categories = [
    "AI/테크", "건강", "경제소식", "독서", "레시피", 
    "러닝", "맛집", "부동산", "세금", 
    "쇼핑", "스트레칭/재활", "식단/다이어트", 
    "암호화폐", "여행", "외국어", "요가/필라테스", "음악/플리", 
    "인테리어", "자기계발", "자녀교육", "정리정돈", "주식/ETF", 
    "직장/커리어", "창업/사업", "헬스/웨이트", "행사/전시", "유머", 
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

let selectedItems = new Set();
let currentCategory = "";

function loadSettings() {
    const saved = localStorage.getItem('findable_categories');
    if (saved) {
        selectedItems = new Set(JSON.parse(saved));
        renderSelected();
    }
}

function saveSettings() {
    localStorage.setItem('findable_categories', JSON.stringify(Array.from(selectedItems)));
}

function saveContents() {
    localStorage.setItem('findable_contents', JSON.stringify(storedContents));
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
openBtn.addEventListener('click', () => { initGrid(); categoryOverlay.classList.add('active'); });
categoryOverlay.addEventListener('click', (e) => { e.target === categoryOverlay && categoryOverlay.classList.remove('active') });
submitBtn.addEventListener('click', () => { saveSettings(); categoryOverlay.classList.remove('active'); renderSelected(); });

// Add Link Logic
addLinkBtn.addEventListener('click', () => addLinkOverlay.classList.add('active'));
addLinkOverlay.addEventListener('click', (e) => { e.target === addLinkOverlay && addLinkOverlay.classList.remove('active') });

async function fetchTitle(url) {
    try {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        let title = doc.querySelector('title')?.innerText || '';
        return title.replace(/\n/g, '').trim();
    } catch (e) {
        console.error("Title fetch failed:", e);
        return null;
    }
}

saveLinkBtn.addEventListener('click', async () => {
    const url = newLinkInput.value.trim();
    if (!url) return;

    const originalText = saveLinkBtn.textContent;
    saveLinkBtn.textContent = "제목 불러오는 중...";
    saveLinkBtn.disabled = true;

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

    let title = await fetchTitle(url);
    
    if (!title) {
        if (platform === "YouTube") title = "YouTube 영상";
        else if (platform === "Instagram") title = "Instagram 게시물";
        else title = url;
    }

    if (!storedContents[currentCategory]) storedContents[currentCategory] = [];
    
    storedContents[currentCategory].push({
        title: title,
        url: url,
        platform: platform,
        thumbnail: thumb,
        clicks: 0
    });

    saveContents();
    renderContentSections(searchInput.value);
    
    newLinkInput.value = "";
    saveLinkBtn.textContent = originalText;
    saveLinkBtn.disabled = false;
    addLinkOverlay.classList.remove('active');
});

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
    modalCategoryName.textContent = category;
    backBtn.classList.add('active');
    guidanceMsg.classList.add('hidden');
    renderContentSections("");
    contentOverlay.classList.add('active');
}

function renderContentSections(query) {
    topLinksGrid.innerHTML = '';
    allLinksList.innerHTML = '';

    const allItems = (storedContents[currentCategory] || []).filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
    );

    if (allItems.length === 0) {
        allLinksList.innerHTML = `<div class="empty-state"><p>저장된 링크가 없습니다.</p></div>`;
        return;
    }

    // Top 10
    const top10 = [...allItems].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 10);
    top10.forEach(item => {
        const card = document.createElement('a');
        card.href = item.url;
        card.target = "_blank";
        card.className = 'content-card';
        card.addEventListener('click', () => { item.clicks = (item.clicks || 0) + 1; saveContents(); });
        
        const thumb = item.thumbnail || 'https://via.placeholder.com/400x225/f1f5f9/94a3b8?text=Link';
        card.innerHTML = `
            <div class="card-thumbnail"><span class="platform-badge">${item.platform}</span><img src="${thumb}"></div>
            <div class="card-info"><h3 class="card-title">${item.title}</h3></div>
        `;
        topLinksGrid.appendChild(card);
    });

    // All List
    allItems.forEach(item => {
        const listItem = document.createElement('a');
        listItem.href = item.url;
        listItem.target = "_blank";
        listItem.className = 'list-item';
        listItem.addEventListener('click', () => { item.clicks = (item.clicks || 0) + 1; saveContents(); });
        
        const thumb = item.thumbnail || 'https://via.placeholder.com/80x45/f1f5f9/94a3b8?text=Link';
        listItem.innerHTML = `
            <img src="${thumb}" class="list-thumb">
            <div class="list-item-info">
                <div class="list-title">${item.title}</div>
                <div class="list-meta">${item.platform} • ${item.url.substring(0, 40)}...</div>
            </div>
        `;
        allLinksList.appendChild(listItem);
    });
}

searchInput.addEventListener('input', (e) => renderContentSections(e.target.value));

function closeContentView() {
    contentOverlay.classList.remove('active');
    backBtn.classList.remove('active');
    guidanceMsg.classList.remove('hidden');
    searchInput.value = "";
    addLinkOverlay.classList.remove('active');
}

backBtn.addEventListener('click', closeContentView);
contentOverlay.addEventListener('click', (e) => { e.target === contentOverlay && closeContentView() });

document.addEventListener('DOMContentLoaded', () => { loadSettings(); initGrid(); });
