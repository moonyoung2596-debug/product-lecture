const generateBtn = document.getElementById('generate-btn');
const themeToggle = document.getElementById('theme-toggle');
const numberDivs = document.querySelectorAll('.number');

// Check for saved theme
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    // Save theme preference
    let theme = 'dark';
    if (document.body.classList.contains('light-mode')) {
        theme = 'light';
    }
    localStorage.setItem('theme', theme);
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
