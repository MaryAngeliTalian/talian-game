// Game Elements
const scoreElement = document.getElementById('score');
const levelDisplay = document.getElementById('levelDisplay');
const timerElement = document.getElementById('timer');
const typedDisplay = document.getElementById('typedDisplay');
const finalScore = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');
const gameContainer = document.getElementById('gameContainer');
const holes = document.querySelectorAll('.hole');
const pow = document.getElementById('pow');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const continueBtn = document.getElementById('continueBtn');
const levelUpScreen = document.getElementById('levelUpScreen');
const pauseScreen = document.getElementById('pauseScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const newLevelElement = document.getElementById('newLevel');

// Sound
const whackSound = document.getElementById('whackSound');
const bgMusic = document.getElementById('bgMusic');


// Game State
let score = 0;
let level = 1;
let timeLeft = 30;
let gameActive = false;
let isPaused = false;
let typedBuffer = "";
let activeMoles = [];
let moleTimeouts = [];
let moleSpawner = null;
let countdownTimer = null;

// Level settings
const levels = {
  1: { name: "Easy", moleInterval: 1500, moleLifetime: 4000, duration: 30 },
  2: { name: "Medium", moleInterval: 1000, moleLifetime: 3000, duration: 30 },
  3: { name: "Hard", moleInterval: 1000, moleLifetime: 2500, duration: 30 }
};

// Words
const words = [
  "cat", "jump", "fast", "hello", "world", "code", "dog",
  "type", "game", "play", "run", "debug", "logic", "write", "click",
  "meow", "paws", "furry", "purr", "whisker", "tail", "mouse"
];

// Typed buffer display
function updateTypedDisplay() {
  typedDisplay.textContent = typedBuffer || "...";
}

// Show a mole with a word
function showMole() {
  if (!gameActive || isPaused) return;

  const availableHoles = [...holes].filter(h => !h.querySelector(".mole").classList.contains("show"));
  if (availableHoles.length === 0) return;

  const hole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
  const mole = hole.querySelector(".mole");
  const word = words[Math.floor(Math.random() * words.length)];

  mole.innerHTML = `<span>${word}</span>`;
  mole.classList.add("show");
  hole.classList.add("active");

  const moleData = { word, mole, hole };
  activeMoles.push(moleData);

  const timeoutId = setTimeout(() => {
    if (mole.classList.contains("show")) {
      mole.classList.remove("show");
      hole.classList.remove("active");
      mole.innerHTML = "";
      activeMoles = activeMoles.filter(m => m !== moleData);
    }
  }, levels[level].moleLifetime);

  moleTimeouts.push(timeoutId);
}

// Start level
function startLevel() {
  const config = levels[level];
  if (!config) return endGame();

  // Reset game state
  typedBuffer = "";
  updateTypedDisplay();
  activeMoles.forEach(m => {
    m.mole.classList.remove("show");
    m.hole.classList.remove("active");
    m.mole.innerHTML = "";
  });
  activeMoles = [];
  clearAllMoleTimeouts();

  levelDisplay.textContent = config.name;
  timeLeft = config.duration;
  timerElement.textContent = timeLeft;
  pauseScreen.classList.remove('show');

  // Start mole spawning
  moleSpawner = setInterval(showMole, config.moleInterval);

  // Timer countdown
  countdownTimer = setInterval(() => {
    if (!isPaused) {
      timeLeft--;
      timerElement.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(moleSpawner);
        clearInterval(countdownTimer);
        endLevel();
      }
    }
  }, 1000);

  gameActive = true;
  isPaused = false;
}

// End current level
function endLevel() {
  gameActive = false;
  clearInterval(moleSpawner);
  clearInterval(countdownTimer);
  clearAllMoleTimeouts();

  activeMoles.forEach(m => {
    m.mole.classList.remove("show");
    m.hole.classList.remove("active");
    m.mole.innerHTML = "";
  });
  activeMoles = [];

  if (level < Object.keys(levels).length) {
    newLevelElement.textContent = level + 1;
    levelUpScreen.classList.add('show');
  } else {
    finalScore.textContent = score;
    gameOverScreen.classList.add('show');
  }
}

// Start game
function startGame() {
  score = 0;
  level = 1;
  scoreElement.textContent = score;
  gameOverScreen.classList.remove('show');
  levelUpScreen.classList.remove('show');
  startLevel();
}

// Next level
nextLevelBtn.addEventListener("click", () => {
  level++;
  levelUpScreen.classList.remove('show');
  startLevel();
});

// Stop game manually
function stopGame() {
  gameActive = false;
  clearInterval(moleSpawner);
  clearInterval(countdownTimer);
  clearAllMoleTimeouts();

  activeMoles.forEach(m => {
    m.mole.classList.remove("show");
    m.hole.classList.remove("active");
    m.mole.innerHTML = "";
  });
  activeMoles = [];

  endGame();
}

// End game completely
function endGame() {
  gameActive = false;
  finalScore.textContent = score;
  gameOverScreen.classList.add('show');
}

// Clear mole timeouts
function clearAllMoleTimeouts() {
  moleTimeouts.forEach(clearTimeout);
  moleTimeouts = [];
}

// Pause
function pauseGame() {
  if (!gameActive || isPaused) return;
  isPaused = true;
  pauseScreen.classList.add('show');
  clearAllMoleTimeouts();
}

// Continue
function continueGame() {
  if (!gameActive || !isPaused) return;
  isPaused = false;
  pauseScreen.classList.remove('show');

  activeMoles.forEach(m => {
    const timeoutId = setTimeout(() => {
      if (m.mole.classList.contains("show")) {
        m.mole.classList.remove("show");
        m.hole.classList.remove("active");
        m.mole.innerHTML = "";
        activeMoles = activeMoles.filter(item => item !== m);
      }
    }, levels[level].moleLifetime);
    moleTimeouts.push(timeoutId);
  });
}

// Show pow effect
function showPowEffect(hole) {
  const rect = hole.getBoundingClientRect();
  pow.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
  pow.style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
  pow.style.transform = 'translate(-50%, -50%)';
  pow.style.display = 'block';
  setTimeout(() => pow.style.display = 'none', 300);
}

// Play sound
function playWhackSound() {
  whackSound.currentTime = 0;
  whackSound.play().catch(() => {});
}

// Typing logic
document.addEventListener("keydown", (e) => {
  
  if (!gameActive || isPaused) return;

  if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
    typedBuffer += e.key.toLowerCase();
    updateTypedDisplay();

    const match = activeMoles.find(m => m.word.toLowerCase() === typedBuffer);
    if (match) {
      playWhackSound();
      score += 10;
      scoreElement.textContent = score;
      showPowEffect(match.hole);
      match.mole.classList.remove("show");
      match.hole.classList.remove("active");
      match.mole.innerHTML = "";
      activeMoles = activeMoles.filter(m => m !== match);
      typedBuffer = "";
      updateTypedDisplay();
    } else {
      const stillValid = activeMoles.some(m => m.word.toLowerCase().startsWith(typedBuffer));
      if (!stillValid) {
        typedBuffer = "";
        updateTypedDisplay();
      }
    }
  } else if (e.key === "Backspace") {
    typedBuffer = typedBuffer.slice(0, -1);
    updateTypedDisplay();
  } else if (e.key === "Escape") {
    isPaused ? continueGame() : pauseGame();
  }
});

// Button events
pauseBtn.addEventListener("click", pauseGame);
continueBtn.addEventListener("click", continueGame);
stopBtn.addEventListener("click", stopGame);
playAgainBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

// Start game on load
window.addEventListener("load", () => {
  gameContainer.style.display = 'flex';
  startGame();
});


function saveScore(name, score) {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name, score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.splice(10); // Keep only top 10
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function showLeaderboard() {
    const leaderboardScreen = document.getElementById('leaderboardScreen');
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';

    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li>No scores yet!</li>';
    } else {
        leaderboard.forEach((entry, index) => {
            const li = document.createElement('li');
            li.textContent = `${entry.name}: ${entry.score}`;
            leaderboardList.appendChild(li);
        });
    }

    leaderboardScreen.style.display = 'block';
}

function closeLeaderboard() {
    document.getElementById('leaderboardScreen').style.display = 'none';
}
// Inside stopGame() or at end of endLevel() when game is over
if (level >= 3 || timeLeft <= 0) {
    let playerName = prompt("Game over! Enter your name for the leaderboard:");
    if (!playerName) playerName = "Anonymous";
    saveScore(playerName, score);
}

