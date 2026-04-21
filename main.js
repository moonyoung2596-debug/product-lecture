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
