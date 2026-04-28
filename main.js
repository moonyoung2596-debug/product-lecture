const generateBtn = document.getElementById('generate-btn');
const blackModeBtn = document.getElementById('black-mode');
const lightModeBtn = document.getElementById('light-mode');
const numberDivs = document.querySelectorAll('.number');
const uploadArea = document.getElementById('upload-area');
const imageUpload = document.getElementById('image-upload');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const labelContainer = document.getElementById('label-container');

let model;
const URL = "https://teachablemachine.withgoogle.com/models/h7v-X3vYp/"; // Example TM model URL

async function ensureModelLoaded() {
    if (!model) {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
    }
}

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
}

// Set black mode (default dark)
blackModeBtn.addEventListener('click', () => {
    document.body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark');
});

// Set light mode
lightModeBtn.addEventListener('click', () => {
    document.body.classList.add('light-mode');
    localStorage.setItem('theme', 'light');
});

// Lotto Generator Logic with Animation
generateBtn.addEventListener('click', () => {
    generateBtn.disabled = true;
    generateBtn.textContent = '번호 생성 중...';
    
    let iterations = 0;
    const interval = setInterval(() => {
        numberDivs.forEach(div => {
            div.textContent = Math.floor(Math.random() * 45) + 1;
            div.style.transform = `scale(${1 + Math.random() * 0.2})`;
        });
        iterations++;
        
        if (iterations > 10) {
            clearInterval(interval);
            const numbers = new Set();
            while (numbers.size < 6) {
                numbers.add(Math.floor(Math.random() * 45) + 1);
            }
            const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
            
            numberDivs.forEach((div, index) => {
                div.textContent = sortedNumbers[index];
                div.style.transform = 'scale(1)';
                div.style.color = 'var(--accent-color)';
            });
            
            generateBtn.disabled = false;
            generateBtn.textContent = '행운의 번호 다시 뽑기';
        }
    }, 50);
});

// Refined Prediction Logic
async function predict(imageElement) {
    if (!model) {
        await ensureModelLoaded();
    }
    if (!model) return;

    const prediction = await model.predict(imageElement);
    prediction.sort((a, b) => b.probability - a.probability); // 높은 확률 순 정렬
    
    labelContainer.innerHTML = ''; // 초기화
    
    for (let i = 0; i < Math.min(prediction.length, 5); i++) {
        const p = prediction[i];
        const rawClassName = p.className.toLowerCase();
        let className = p.className;
        
        // 동물상 명칭 한글화 및 이모지 추가
        const animalMap = {
            'dog': '🐶 강아지상',
            'cat': '🐱 고양이상',
            'rabbit': '🐰 토끼상',
            'bear': '🐻 곰상',
            'dinosaur': '🦖 공룡상',
            'fox': '🦊 여우상'
        };
        className = animalMap[rawClassName] || className;
        
        const probability = (p.probability * 100).toFixed(0);
        
        const resultBar = document.createElement('div');
        resultBar.className = 'result-bar';
        resultBar.innerHTML = `
            <div class="result-label">
                <span>${className}</span>
                <span>${probability}%</span>
            </div>
            <div class="bar-container">
                <div class="bar-fill" style="width: ${probability}%; background-color: ${i === 0 ? 'var(--accent-color)' : 'var(--number-bg)'}"></div>
            </div>
        `;
        labelContainer.appendChild(resultBar);
    }

    // 분석 완료 후 공유 컨테이너 표시
    const shareContainer = document.getElementById('share-container');
    if (shareContainer) {
        shareContainer.style.display = 'block';
    }
}

// Image Upload Logic
uploadArea.addEventListener('click', () => imageUpload.click());

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleImageFile(file);
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
});

function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        imagePreview.src = e.target.result;
        imagePreviewContainer.style.display = 'block';
        
        // Use a small timeout to ensure image is rendered for prediction
        setTimeout(() => predict(imagePreview), 100);
    };
    reader.readAsDataURL(file);
}

// SNS Sharing Logic
function shareTwitter() {
    const text = "AI가 분석한 내 동물상은? 지금 바로 테스트해보세요! #AI동물상테스트 #관상 #AI관상";
    const url = window.location.origin + window.location.pathname;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
}

function shareFacebook() {
    const url = window.location.origin + window.location.pathname;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
}

function copyLink() {
    const url = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(url).then(() => {
        alert("링크가 클립보드에 복사되었습니다! 친구들에게 공유해보세요. ✨");
    }).catch(err => {
        console.error('링크 복사 실패:', err);
    });
}
