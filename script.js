const holes = document.querySelectorAll('.hole');
const characters = document.querySelectorAll('.character');
const scoreDisplay = document.getElementById('score');
const roundDisplay = document.getElementById('round');
const hitsDisplay = document.getElementById('hits');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');
const hammer = document.getElementById('hammer');

let score = 0;
let round = 1;
let hits = 0;
let lastHole;
let timeUp = true; // Start with game not active
let gameSpeed = 1500; // Starting speed in ms
let friendlyLadyActive = false;
let strictManActive = false;

function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    
    if (hole === lastHole) {
        return randomHole(holes);
    }
    
    lastHole = hole;
    return hole;
}

function peep() {
    if (timeUp) return;
    
    const time = randomTime(gameSpeed * 0.5, gameSpeed);
    const hole = randomHole(holes);
    
    // Clear the hole
    hole.innerHTML = '';
    
    // Determine which character to show
    let characterType = 'furry-boy';
    let isWhackable = true;
    
    // Random chance to show different characters based on current round
    const rand = Math.random();
    
    if (round >= 6 && strictManActive && rand < 0.2) {
        characterType = 'strict-man';
        isWhackable = false;
    } else if (round >= 3 && friendlyLadyActive && rand < 0.3) {
        characterType = 'friendly-lady';
        isWhackable = false; // Now friendly lady is also not whackable
    }
    
    // Create and add the character
    const character = document.createElement('div');
    character.className = `character ${characterType}`;
    character.dataset.whackable = isWhackable;
    character.dataset.type = characterType;
    hole.appendChild(character);
    
    // Make character appear
    setTimeout(() => {
        character.classList.add('up');
        
        setTimeout(() => {
            character.classList.remove('up');
            if (!timeUp) peep();
        }, time);
    }, 100);
}

function initGame() {
    // Hide start screen
    startScreen.style.display = 'none';
    
    // Reset all holes to have furry boys
    holes.forEach(hole => {
        hole.innerHTML = '<div class="character furry-boy" data-whackable="true" data-type="furry-boy"></div>';
    });
    
    // Set game state
    score = 0;
    round = 1;
    hits = 0;
    timeUp = false;
    gameSpeed = 1500;
    friendlyLadyActive = false;
    strictManActive = false;
    
    // Update displays
    scoreDisplay.textContent = score;
    roundDisplay.textContent = round;
    hitsDisplay.textContent = hits;
    
    // Start the game
    peep();
}

function startGame() {
    gameOverScreen.style.display = 'none';
    initGame();
}

function endGame() {
    timeUp = true;
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'flex';
}

function whack(e) {
    if (!e.isTrusted || timeUp) return; // Cheater or game not active!
    
    // Check if the clicked element is a character
    if (!e.target.classList.contains('character')) return;
    
    const characterType = e.target.dataset.type;
    const isWhackable = e.target.dataset.whackable === "true";
    
    // Show hammer animation
    hammer.style.display = 'block';
    hammer.style.left = `${e.pageX - 30}px`;
    hammer.style.top = `${e.pageY - 30}px`;
    hammer.classList.add('active');
    
    setTimeout(() => {
        hammer.classList.remove('active');
        setTimeout(() => {
            hammer.style.display = 'none';
        }, 100);
    }, 100);
    
    if (!isWhackable) {
        // Game over if you hit a non-whackable character
        endGame();
        return;
    }
    
    // Only furry boy is whackable
    if (characterType === 'furry-boy') {
        e.target.classList.remove('up');
        score++;
        hits++;
        scoreDisplay.textContent = score;
        hitsDisplay.textContent = hits;
        
        // Check if round is complete
        if (hits >= 10) {
            completeRound();
        }
    }
}

function completeRound() {
    round++;
    hits = 0;
    roundDisplay.textContent = round;
    hitsDisplay.textContent = 0;
    
    // Increase speed for next round (by 0.5% of previous round)
    gameSpeed = gameSpeed * 0.995; // 0.5% faster
    
    // Activate friendly lady from round 3
    if (round >= 3) {
        friendlyLadyActive = true;
    }
    
    // Activate strict man from round 6
    if (round >= 6) {
        strictManActive = true;
    }
}

// Set up touch/click handlers
document.addEventListener('click', whack);
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Track mouse/touch for hammer
document.addEventListener('mousemove', function(e) {
    if (hammer.style.display === 'block') {
        hammer.style.left = `${e.pageX - 30}px`;
        hammer.style.top = `${e.pageY - 30}px`;
    }
});

// Handle touch events for mobile
document.addEventListener('touchmove', function(e) {
    if (hammer.style.display === 'block' && e.touches[0]) {
        hammer.style.left = `${e.touches[0].pageX - 30}px`;
        hammer.style.top = `${e.touches[0].pageY - 30}px`;
    }
}, { passive: true });

document.addEventListener('touchstart', function(e) {
    // Prevent zoom on double tap
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// Make sure game doesn't start automatically
timeUp = true;
