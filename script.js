// Create tall grass elements
const grassContainer = document.getElementById('grassContainer');
const grassCount = 40;

for (let i = 0; i < grassCount; i++) {
    const grass = document.createElement('div');
    grass.className = 'grass';
    
    // Random properties
    const height = Math.random() * 150 + 100; // Between 100-250px
    const width = Math.random() * 20 + 10; // Between 10-30px
    const left = Math.random() * 100; // 0-100% of the container width
    const rotation = Math.random() * 10 - 5; // -5 to 5 degrees
    const delay = Math.random() * 2; // 0-2s delay for animation
    
    grass.style.height = `${height}px`;
    grass.style.width = `${width}px`;
    grass.style.left = `${left}%`;
    grass.style.transform = `rotate(${rotation}deg)`;
    grass.style.animationDelay = `${delay}s`;
    
    // Add some 3D depth with z-index
    grass.style.zIndex = Math.floor(left) > 50 ? -1 : -2;
    
    grassContainer.appendChild(grass);
}

const holes = document.querySelectorAll('.hole');
const scoreDisplay = document.getElementById('score');
const roundDisplay = document.getElementById('round');
const hitsDisplay = document.getElementById('hits');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const startBtn = document.getElementById('startBtn');
const startScreen = document.getElementById('startScreen');
const hammer = document.getElementById('hammer');

let score = 0;
let round = 1;
let hits = 0;
let lastHole;
let timeUp = false;
let gameSpeed = 1500; // Starting speed in ms
let friendlyLadyActive = false;
let strictManActive = false;
let gameStarted = false;

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
        isWhackable = false;
    }
    
    // Create and add the character
    const character = document.createElement('div');
    character.className = `character ${characterType}`;
    character.dataset.whackable = isWhackable;
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
    // Reset initial display
    scoreDisplay.textContent = 0;
    roundDisplay.textContent = 1;
    hitsDisplay.textContent = 0;
    
    // Hide start screen
    startScreen.style.display = 'none';
    
    // Reset game state
    score = 0;
    round = 1;
    hits = 0;
    timeUp = false;
    gameSpeed = 1500;
    friendlyLadyActive = false;
    strictManActive = false;
    gameStarted = true;
    
    // Reset all holes to have furry boys
    holes.forEach(hole => {
        hole.innerHTML = '<div class="character furry-boy" data-whackable="true"></div>';
    });
    
    // Start spawning characters
    peep();
}

function endGame() {
    timeUp = true;
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'flex';
    gameStarted = false;
}

function whack(e) {
    if (!gameStarted) return;
    if (!e.isTrusted) return; // Cheater!
    
    // Check if the clicked element is a character
    if (!e.target.classList.contains('character')) return;
    
    // Check if character is whackable
    const isWhackable = e.target.dataset.whackable === "true";
    
    if (!isWhackable) {
        // Game over if you hit a non-whackable character
        endGame();
        return;
    }
    
    e.target.classList.remove('up');
    score++;
    hits++;
    scoreDisplay.textContent = score;
    hitsDisplay.textContent = hits;
    
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
    
    // Check if round is complete
    if (hits >= 10) {
        completeRound();
    }
}

function completeRound() {
    round++;
    hits = 0;
    roundDisplay.textContent = round;
    hitsDisplay.textContent = 0;
    
    // Increase speed by 0.5% (multiply by 0.995 for proper decrease)
    gameSpeed = gameSpeed * 0.995;
    
    // Activate friendly lady from round 3
    if (round >= 3) {
        friendlyLadyActive = true;
    }
    
    // Activate strict man from round 6
    if (round >= 6) {
        strictManActive = true;
    }
}

// Attach event listeners
document.addEventListener('click', whack);
restartBtn.addEventListener('click', function() {
    gameOverScreen.style.display = 'none';
    initGame();
});
startBtn.addEventListener('click', initGame);

// Track mouse for hammer
document.addEventListener('mousemove', function(e) {
    if (hammer.style.display === 'block') {
        hammer.style.left = `${e.pageX - 30}px`;
        hammer.style.top = `${e.pageY - 30}px`;
    }
});