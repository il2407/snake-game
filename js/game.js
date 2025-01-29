let cellSize = 40;
let width = 400;
let height = 700;
let snake = [];
let snakeDir = "RIGHT";
let ghostPos;
let ghostImage;
let score = 0;
let level = 1;
let maxScorePerLevel = 12;
let totalLevels = 2;
let gameOver = false;
let gameState = "MENU"; // Possible states: MENU, PLAYING, LEVEL_TRANSITION, GAME_OVER
let collectedItems = []; // List of eaten items
let snakeHeadImage, backgroundImage, winImage;
let ghostImages = [];
let eatSounds = [];

function preload() {
    snakeHeadImage = loadImage("assets/face.png");
    backgroundImage = loadImage("assets/background.png");
    winImage = loadImage("assets/win_image.png");

    ghostImages = [
        loadImage("assets/miso.png"),
        loadImage("assets/mold.png"),
        loadImage("assets/frisbee.png"),
        loadImage("assets/car.png"),
        loadImage("assets/gamba.png"),
        loadImage("assets/floor.png"),
        loadImage("assets/rest.png"),
        loadImage("assets/tavor.png")
    ];

    for (let i = 1; i <= 1123; i++) {
        let soundFile = loadSound(`song_parts/part${i}.mp3`);
        eatSounds.push(soundFile);
    }
}

function setup() {
    createCanvas(width, height);
    frameRate(8);
}

function draw() {
    if (gameState === "MENU") {
        drawMenu();
        return;
    }

    if (gameState === "LEVEL_TRANSITION") {
        drawLevelTransition();
        return;
    }

    if (gameOver) {
        drawGameOver();
        return;
    }

    background(backgroundImage);
    drawSnake();
    drawGhost();
    drawScore();
    moveSnake();
}

function drawMenu() {
    background(50);
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text("Welcome to the Game!", width / 2, height / 8);

    // Displaying the objects in a well-positioned grid
    let rows = ceil(ghostImages.length / 4);
    let startY = height / 5;
    for (let i = 0; i < ghostImages.length; i++) {
        let x = (i % 4) * 60 + 70;
        let y = floor(i / 4) * 60 + startY;
        image(ghostImages[i], x, y, 40, 40);
    }

    // "Start Game" button
    fill(0, 255, 0);
    rect(width / 2 - 60, height - 150, 120, 40);
    fill(0);
    textSize(20);
    text("Start Game", width / 2, height - 130);

    // "Exit" button
    fill(255, 0, 0);
    rect(width / 2 - 60, height - 90, 120, 40);
    fill(0);
    text("Exit", width / 2, height - 70);
}

function drawLevelTransition() {
    background(0);
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text("You survived a year in a relationship!", width / 2, height / 2 - 20);

    fill(0, 255, 0);
    rect(width / 2 - 60, height / 2 + 30, 120, 40);
    fill(0);
    textSize(20);
    text("Continue to Level 2", width / 2, height / 2 + 50);
}

function drawGameOver() {
    background(30);
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text("Game Over!", width / 2, height / 2);
    textSize(16);
    text("Press R to Restart", width / 2, height / 2 + 40);
}

function moveSnake() {
    let head = [...snake[0]];
    if (snakeDir === "UP") head[1] -= cellSize;
    if (snakeDir === "DOWN") head[1] += cellSize;
    if (snakeDir === "LEFT") head[0] -= cellSize;
    if (snakeDir === "RIGHT") head[0] += cellSize;

    head[0] = (head[0] + width) % width;
    head[1] = (head[1] + height) % height;

    if (snake.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
        gameOver = true;
        return;
    }

    snake.unshift(head);

    if (dist(head[0], head[1], ghostPos[0], ghostPos[1]) < cellSize) {
        score++;
        collectedItems.push(ghostImage);
        spawnNewGhost();
        playRandomEatSound();

        if (score === maxScorePerLevel) {
            level++;
            if (level > totalLevels) {
                displayWinScreen();
                noLoop();
            } else {
                gameState = "LEVEL_TRANSITION";
            }
        }
    } else {
        snake.pop();
    }
}

function keyPressed() {
    if (keyCode === UP_ARROW && snakeDir !== "DOWN") snakeDir = "UP";
    if (keyCode === DOWN_ARROW && snakeDir !== "UP") snakeDir = "DOWN";
    if (keyCode === LEFT_ARROW && snakeDir !== "RIGHT") snakeDir = "LEFT";
    if (keyCode === RIGHT_ARROW && snakeDir !== "LEFT") snakeDir = "RIGHT";
    if (key === "R" || key === "r") resetGame();
    if (key === "M" || key === "m") gameState = "MENU"; // Return to main menu
}

function mousePressed() {
    if (gameState === "MENU") {
        if (mouseX > width / 2 - 60 && mouseX < width / 2 + 60) {
            if (mouseY > height - 150 && mouseY < height - 110) {
                gameState = "PLAYING";
                resetGame();
            } else if (mouseY > height - 90 && mouseY < height - 50) {
                console.log("Game Closed!");
                noLoop();
            }
        }
    }

    if (gameState === "LEVEL_TRANSITION") {
        if (mouseX > width / 2 - 60 && mouseX < width / 2 + 60 &&
            mouseY > height / 2 + 30 && mouseY < height / 2 + 70) {
            gameState = "PLAYING";
            resetGame();
        }
    }
}

function resetGame() {
    snake = [[100, 50], [90, 50], [80, 50]];
    snakeDir = "RIGHT";
    score = 0;
    level = 1;
    collectedItems = [];
    spawnNewGhost();
    gameOver = false;
}

function spawnNewGhost() {
    ghostPos = randomGhostPosition();
    ghostImage = random(ghostImages);
}

function drawGhost() {
    image(ghostImage, ghostPos[0], ghostPos[1], cellSize, cellSize);
}

function playRandomEatSound() {
    if (eatSounds.length > 0) {
        let sound = random(eatSounds);
        sound.play();
    }
}

function randomGhostPosition() {
    let cols = floor(width / cellSize);
    let rows = floor(height / cellSize);
    let x = floor(random(cols)) * cellSize;
    let y = floor(random(rows)) * cellSize;
    return [x, y];
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        if (i === 0) {
            image(snakeHeadImage, snake[i][0], snake[i][1], cellSize, cellSize);
        } else {
            fill(0, 255, 0);
            rect(snake[i][0], snake[i][1], cellSize, cellSize);
        }
    }
}

function drawScore() {
    fill(255);
    textSize(16);
    text(`Score: ${score}`, 10, 20);
    text(`Level: ${level}`, width - 70, 20);
}
