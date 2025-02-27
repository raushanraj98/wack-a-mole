const holes = document.querySelectorAll('.hole');
const characters = document.querySelectorAll('.character');
const scoreDisplay = document.getElementById('score');
const roundDisplay = document.getElementById('round');
const hitsDisplay = document.getElementById('hits');
const gameOverScreen = document.getElementById('gameOver');
const gameOverReason = document.getElementById('gameOverReason');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const hammer = document.getElementById('hammer');
const grass = document.getElementById('grass');

let score = 0;
let round = 1;
let hits = 0;
let lastHole;
let timeUp = false;
let gameSpeed = 1500; // Starting speed in ms
let friendlyLadyActive = false;
let strictManActive = false;

// Create 3D grass blades
function createGrass() {
    for (let i = 0; i < 40; i++) {
        const blade = document.createElement('div');
        blade.className = 'grass-blade';
        
        // Random height between 60px and 150px
        const height = 60 + Math.random() * 90;
        blade.style.height = `${height}px`;
        
        // Random position along the bottom of the screen
        const leftPos = Math.random() * 100;
        blade.style.left = `${leftPos}%`;
        
        // Random animation delay for natural movement
        blade.style.animationDelay = `${Math.random() * 5}s`;
        
        // Random width variance 
        const width = 8 + Math.random() * 8;
        blade.style.width = `${width}px`;
        
        // Random color variation
        const greenHue = 90 + Math.floor(Math.random() * 30);
        blade.style.background = `linear-gradient(to top, hsl(${greenHue}, 70%, 30%), hsl(${greenHue}, 80%, 50%))`;
        
        // Add z-index for depth effect
        blade.style.zIndex = -Math.floor(leftPos / 10);
        
        grass.appendChild(blade);
    }
}

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

function startGame() {
    scoreDisplay.textContent = 0;
    roundDisplay.textContent = 1;
    hitsDisplay.textContent = 0;
    score = 0;
    round = 1;
    hits = 0;
    timeUp = false;
    gameSpeed = 1500;
    friendlyLadyActive = false;
    strictManActive = false;
    
    // Reset all holes to have furry boys
    holes.forEach(hole => {
        hole.innerHTML = '<div class="character furry-boy" data-whackable="true" data-type="furry-boy"></div>';
    });
    
    gameOverScreen.style.display = 'none';
    restartBtn.style.display = 'none';
    
    peep();
}

function endGame(reason) {
    timeUp = true;
    finalScoreDisplay.textContent = score;
    
    if (reason) {
        gameOverReason.textContent = reason;
    } else {
        gameOverReason.textContent = "Game Over!";
    }
    
    gameOverScreen.style.display = 'flex';
}

function whack(e) {
    if (!e.isTrusted) return; // Cheater!
    
    // Check if the clicked element is a character
    if (!e.target.classList.contains('character')) return;
    
    const characterType = e.target.dataset.type;
    
    // Check if character is whackable (only furry boy is whackable)
    if (characterType !== 'furry-boy') {
        // Game over if you hit a non-whackable character
        if (characterType === 'friendly-lady') {
            endGame("Game Over! You hit the Friendly Lady!");
        } else if (characterType === 'strict-man') {
            endGame("Game Over! You hit the Strict Man!");
        } else {
            endGame();
        }
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
    
    // Increase speed for next round (by 0.05% of previous round)
    gameSpeed = gameSpeed * 0.9995; // 0.05% faster
    
    // Activate friendly lady from round 3
    if (round >= 3) {
        friendlyLadyActive = true;
    }
    
    // Activate strict man from round 6
    if (round >= 6) {
        strictManActive = true;
    }
}

// Initialize grass
createGrass();

// Attach event listeners
document.addEventListener('click', whack);
restartBtn.addEventListener('click', startGame);

// Track mouse for hammer
document.addEventListener('mousemove', function(e) {
    if (hammer.style.display === 'block') {
        hammer.style.left = `${e.pageX - 30}px`;
        hammer.style.top = `${e.pageY - 30}px`;
    }
});
