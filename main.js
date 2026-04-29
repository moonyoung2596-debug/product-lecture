const generateBtn = document.getElementById('generate-btn');
const blackModeBtn = document.getElementById('black-mode');
const lightModeBtn = document.getElementById('light-mode');
const numberDivs = document.querySelectorAll('.number');
const uploadArea = document.getElementById('upload-area');
const imageUpload = document.getElementById('image-upload');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const labelContainer = document.getElementById('label-container');
const resultMessage = document.getElementById('result-message');
const loadingSpinner = document.getElementById('loading-spinner');

// Teachable Machine URL
const URL = "https://teachablemachine.withgoogle.com/models/nh8ktuz-F/";

let model;

// 지능형 모델 로딩 함수
async function ensureModelLoaded() {
    if (model) return true;
    try {
        console.log("AI 모델 로딩 시작...");
        
        let retryCount = 0;
        while (typeof tmImage === 'undefined' && retryCount < 40) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retryCount++;
        }

        if (typeof tmImage === 'undefined') {
            throw new Error("AI 라이브러리를 불러오지 못했습니다.");
        }
        
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        console.log("모델 로드 성공!");
        return true;
    } catch (error) {
        console.error("모델 로드 중 오류 발생:", error);
        resultMessage.innerHTML = "⚠️ AI 모델을 불러오지 못했습니다. 페이지를 새로고침해 주세요.";
        return false;
    }
}

// 분석 함수
async function predict() {
    loadingSpinner.style.display = 'block';
    resultMessage.innerHTML = '';
    labelContainer.innerHTML = '';

    const isReady = await ensureModelLoaded();
    if (!isReady) {
        loadingSpinner.style.display = 'none';
        return;
    }
    
    try {
        await new Promise(resolve => setTimeout(resolve, 500));

        const prediction = await model.predict(imagePreview);
        if (!prediction || prediction.length === 0) {
            throw new Error("분석 결과가 없습니다.");
        }

        prediction.sort((a, b) => b.probability - a.probability);

        const animalMap = {
            'dog': '강아지상',
            'cat': '고양이상'
        };

        const topResult = prediction[0];
        const koreanName = animalMap[topResult.className.toLowerCase()] || topResult.className;
        resultMessage.innerHTML = `당신은 <span style="color: var(--accent-color);">${koreanName}</span> 입니다!`;

        const barElements = [];
        for (let i = 0; i < prediction.length; i++) {
            const className = prediction[i].className.toLowerCase();
            const displayName = animalMap[className] || prediction[i].className;
            const probability = (prediction[i].probability * 100).toFixed(0);
            
            const barWrapper = document.createElement('div');
            barWrapper.className = 'result-bar-wrapper';
            barWrapper.innerHTML = `
                <div class="result-label">
                    <span>${displayName}</span>
                    <span>${probability}%</span>
                </div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: 0%;"></div>
                </div>
            `;
            labelContainer.appendChild(barWrapper);
            barElements.push({ element: barWrapper.querySelector('.bar-fill'), width: probability + '%' });
        }

        // Trigger animation after a tiny delay
        setTimeout(() => {
            barElements.forEach(item => {
                item.element.style.width = item.width;
            });
        }, 50);

    } catch (error) {
        console.error("분석 오류:", error);
        resultMessage.innerHTML = "분석 중 오류가 발생했습니다.";
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// Image Upload Logic
uploadArea.addEventListener('click', () => imageUpload.click());

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = 'rgba(33, 150, 243, 0.05)';
    uploadArea.style.borderColor = 'var(--accent-color)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.backgroundColor = 'transparent';
    uploadArea.style.borderColor = '#ccc';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = 'transparent';
    uploadArea.style.borderColor = '#ccc';
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreviewContainer.style.display = 'block';
        document.getElementById('upload-instruction').style.display = 'none';
        
        imagePreview.onload = () => predict();
    };
    reader.readAsDataURL(file);
}

// Lotto Logic
generateBtn.addEventListener('click', () => {
    generateBtn.disabled = true;
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const sorted = Array.from(numbers).sort((a, b) => a - b);
    
    numberDivs.forEach((div, i) => {
        div.textContent = sorted[i];
    });
    
    setTimeout(() => { generateBtn.disabled = false; }, 500);
});

// Theme Logic
blackModeBtn.addEventListener('click', () => { document.body.classList.remove('light-mode'); });
lightModeBtn.addEventListener('click', () => { document.body.classList.add('light-mode'); });
