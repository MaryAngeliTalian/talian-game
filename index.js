// Elements
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const timerElement = document.getElementById('timer');
const pauseBtn = document.getElementById('pauseBtn');
const continueBtn = document.getElementById('continueBtn');
const stopBtn = document.getElementById('stopBtn');
const pauseScreen = document.getElementById('pauseScreen');
const levelUpScreen = document.getElementById('levelUpScreen');
const newLevelElement = document.getElementById('newLevel');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');
const cursor = document.querySelector('.cursor');
const pow = document.getElementById('pow');
const holes = document.querySelectorAll('.hole');

//Sound Effects
const whackSound = document.getElementById('whackSound');

// Game state
let score = 0;
let level = 1;
let timeLeft = 15;
let gameActive = false;
let gamePaused = false;
let timerInterval;
let catTimeout;
let nextCatTimeout;
let activeHole = null;

// Utility Functions
function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomHole() {
    const idx = Math.floor(Math.random() * holes.length);
    return holes[idx];
}

// Show cat
function showRandomCat() {
    if (!gameActive || gamePaused) return;

    const hole = randomHole();
    const cat = hole.querySelector('.mole');

    activeHole = hole;
    hole.classList.add('active');

    catTimeout = setTimeout(() => {
        hideCat(hole);
        nextCatTimeout = setTimeout(showRandomCat, randomTime(catHideTime, catHideTime + 300));
    }, catShowTime);
}

// Hide cat
function hideCat(hole) {
    hole.classList.remove('active');
    activeHole = null;
}

// Hit detection
holes.forEach(hole => {
    hole.addEventListener('click', () => {
        if (!hole.classList.contains('active') || gamePaused) return;

        hole.classList.remove('active');
        score += 10;
        scoreElement.textContent = score;

        playWhackSound(); // <--- INSERTED HERE

        // Show "pow" effect
        const rect = hole.getBoundingClientRect();
        pow.style.left = rect.left + 'px';
        pow.style.top = rect.top + 'px';
        pow.style.display = 'block';
        setTimeout(() => pow.style.display = 'none', 300);

        clearTimeout(catTimeout);
        clearTimeout(nextCatTimeout);
        nextCatTimeout = setTimeout(showRandomCat, randomTime(catHideTime, catHideTime + 300));
    });
});


//Play whack sound
function playWhackSound() {
    whackSound.currentTime = 0; // Reset sound to start
    whackSound.play().catch(e => console.log("Error playing sound:", e));
}

// Timer
function updateTimer() {
    timerElement.textContent = timeLeft;
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endLevel();
    }
}

// Start game level
function startLevel() {
    gameActive = true;
    gamePaused = false;

    // Set cat show/hide times by level
    if (level === 1) {
        catShowTime = 850;
        catHideTime = 650;
    } else if (level === 2) {
        catShowTime = 700;
        catHideTime = 500;
    } else {
        catShowTime = 600;
        catHideTime = 400;
    }

    pauseBtn.disabled = false;
    continueBtn.disabled = true;
    stopBtn.disabled = false;

    timerInterval = setInterval(() => {
        if (!gamePaused) {
            timeLeft--;
            updateTimer();
        }
    }, 1000);

    showRandomCat();
}

// End level
function endLevel() {
    gameActive = false;
    clearInterval(timerInterval);
    clearTimeout(catTimeout);
    clearTimeout(nextCatTimeout);
    if (activeHole) hideCat(activeHole);

    pauseBtn.disabled = true;
    continueBtn.disabled = true;
    stopBtn.disabled = true;

    if (level < 3) {
        newLevelElement.textContent = level + 1;
        levelUpScreen.classList.add('show');
    } else {
        finalScoreElement.textContent = score;
        gameOverScreen.classList.add('show');
    }
}

// Next level
function nextLevel() {
    levelUpScreen.classList.remove('show');
    level++;
    timeLeft = 10;
    levelElement.textContent = level;
    timerElement.textContent = timeLeft;
    startLevel();
}

// Reset game
function resetGame() {
    score = 0;
    level = 1;
    timeLeft = 20;
    scoreElement.textContent = score;
    levelElement.textContent = level;
    timerElement.textContent = timeLeft;
    gameOverScreen.classList.remove('show');
    startLevel();
}

// Pause
function pauseGame() {
    if (!gameActive || gamePaused) return;

    gamePaused = true;
    clearTimeout(catTimeout);
    clearTimeout(nextCatTimeout);
    pauseScreen.classList.add('show');

    pauseBtn.disabled = true;
    continueBtn.disabled = false;
}

// Continue
function continueGame() {
    if (!gameActive || !gamePaused) return;

    gamePaused = false;
    pauseScreen.classList.remove('show');

    pauseBtn.disabled = false;
    continueBtn.disabled = true;

    showRandomCat();
}

// Stop
function stopGame() {
    gameActive = false;
    gamePaused = false;
    clearInterval(timerInterval);
    clearTimeout(catTimeout);
    clearTimeout(nextCatTimeout);
    if (activeHole) hideCat(activeHole);

    pauseScreen.classList.remove('show');
    finalScoreElement.textContent = score;
    gameOverScreen.classList.add('show');

    pauseBtn.disabled = true;
    continueBtn.disabled = true;
    stopBtn.disabled = true;
}

// Cursor
window.addEventListener('mousemove', e => {
    cursor.style.top = e.pageY + 'px';
    cursor.style.left = e.pageX + 'px';
});
window.addEventListener('mousedown', () => cursor.classList.add('active'));
window.addEventListener('mouseup', () => cursor.classList.remove('active'));

// Button Events
pauseBtn.addEventListener('click', pauseGame);
continueBtn.addEventListener('click', continueGame);
stopBtn.addEventListener('click', stopGame);
nextLevelBtn.addEventListener('click', nextLevel);

playAgainBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Auto-start game on load
startLevel();

function saveScore(name, score) {
    // LocalStorage Leaderboard (optional)
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(10); // Keep top 10
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    // Firestore Leaderboard
    db.collection('leaderboard').add({
        name: name,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("Score successfully written to Firestore!");
    })
    .catch((error) => {
        console.error("Error writing score to Firestore: ", error);
    });
}

