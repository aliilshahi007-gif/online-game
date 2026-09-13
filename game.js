const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreDisplay = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');

let gameRunning = false;
let score = 0;
let lives = 3;

class Player {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 50;
        this.speed = 7;
    }

    draw() {
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    update(keys) {
        if (keys['ArrowLeft'] && this.x > 0) this.x -= this.speed;
        if (keys['ArrowRight'] && this.x < canvas.width - this.width) this.x += this.speed;
    }

    shoot() {
        return new Bullet(this.x + this.width / 2, this.y);
    }
}

class Enemy {
    constructor() {
        this.width = 35;
        this.height = 35;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 2 + Math.random() * 2;
    }

    draw() {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        this.y += this.speed;
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 15;
        this.speed = 8;
    }

    draw() {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
    }
}

let player = new Player();
let enemies = [];
let bullets = [];
let keys = {};
let shootCooldown = 0;

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && gameRunning && shootCooldown === 0) {
        bullets.push(player.shoot());
        shootCooldown = 15;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function startGame() {
    gameRunning = true;
    score = 0;
    lives = 3;
    enemies = [];
    bullets = [];
    player = new Player();
    startBtn.style.display = 'none';
    gameOverScreen.style.display = 'none';
    gameLoop();
}

function collisionDetection(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.update(keys);
    player.draw();

    if (shootCooldown > 0) shootCooldown--;

    if (Math.random() < 0.02) {
        enemies.push(new Enemy());
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        enemies[i].draw();

        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            lives--;
            livesDisplay.textContent = `Lives: ${lives}`;
            if (lives <= 0) endGame();
            continue;
        }

        for (let j = bullets.length - 1; j >= 0; j--) {
            if (collisionDetection(bullets[j], enemies[i])) {
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
                break;
            }
        }
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        bullets[i].draw();

        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }

    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameRunning = false;
    gameOverScreen.style.display = 'block';
    finalScoreDisplay.textContent = `Final Score: ${score}`;
}

window.startGame = startGame;