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
let model, webcam, labelContainer, maxPredictions;

const startTestBtn = document.getElementById('start-test-btn');

async function initAnimalTest() {
    startTestBtn.disabled = true;
    startTestBtn.textContent = "모델 로딩 중...";
    
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(200, 200, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        const div = document.createElement("div");
        div.className = "result-bar";
        labelContainer.appendChild(div);
    }
    
    startTestBtn.style.display = 'none';
}

async function loop() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className === "Dog" ? "🐶 강아지상" : "🐱 고양이상";
        const probability = (prediction[i].probability * 100).toFixed(0);
        labelContainer.childNodes[i].innerHTML = `
            <span>${className}</span>
            <span>${probability}%</span>
        `;
    }
}

startTestBtn.addEventListener('click', initAnimalTest);
