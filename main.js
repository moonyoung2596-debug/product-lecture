const generateBtn = document.getElementById('generate-btn');
const blackModeBtn = document.getElementById('black-mode');
const lightModeBtn = document.getElementById('light-mode');
const numberDivs = document.querySelectorAll('.number');

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

// Lotto Generator Logic
generateBtn.addEventListener('click', () => {
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    numberDivs.forEach((div, index) => {
        div.textContent = sortedNumbers[index];
    });
});

// Teachable Machine Animal Test Logic
const URL = "https://teachablemachine.withgoogle.com/models/gWwGmV5A0/";
let model, labelContainer, maxPredictions;
let isModelLoading = false;

const uploadArea = document.getElementById('upload-area');
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const imagePreviewContainer = document.getElementById('image-preview-container');

async function ensureModelLoaded() {
    if (model) return;
    if (isModelLoading) return;
    
    isModelLoading = true;
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    
    labelContainer = document.getElementById("label-container");
    if (labelContainer.childNodes.length === 0) {
        for (let i = 0; i < maxPredictions; i++) {
            const div = document.createElement("div");
            div.className = "result-bar";
            labelContainer.appendChild(div);
        }
    }
    isModelLoading = false;
}

// Prediction Logic
async function predict(imageElement) {
    if (!model) return;
    const prediction = await model.predict(imageElement);
    for (let i = 0; i < maxPredictions; i++) {
        const rawClassName = prediction[i].className.toLowerCase();
        let className = prediction[i].className;
        
        if (rawClassName === "dog") {
            className = "🐶 강아지상";
        } else if (rawClassName === "cat") {
            className = "🐱 고양이상";
        }
        
        const probability = (prediction[i].probability * 100).toFixed(0);
        labelContainer.childNodes[i].innerHTML = `
            <span>${className}</span>
            <span>${probability}%</span>
        `;
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
        
        await ensureModelLoaded();
        
        // Use a small timeout to ensure image is rendered for prediction
        setTimeout(() => predict(imagePreview), 100);
    };
    reader.readAsDataURL(file);
}
