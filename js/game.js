let cellSize = 40;
let width = 400;
let height = 700;
let snake = [];
let snakeDir = "RIGHT";
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let swipeThreshold = 30; // מרחק מינימלי לסווייפ
let ghostPos;
let ghostImage;
let gameOver = false;
let gameState = "MENU"; // מצבים: MENU, PLAYING, LEVEL_TRANSITION, GAME_OVER
let level = 1;
let score = 0;
let maxScorePerLevel = 12;
let totalLevels = 2;
let collectedItems = []; // List of eaten items
let snakeHeadImage, backgroundImage, winImage;
let ghostImages = [];
let eatSounds = [];
let eatenFoodEffects = []; // מאגר לאוכל שנאכל ואנימציותיו


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
    frameRate(6);

    document.addEventListener("touchstart", (event) => {
        event.preventDefault();
        handleTouchClick(event);
    }, { passive: false });

    document.addEventListener("click", handleTouchClick, false);
}

function handleTouchClick(event) {
    let x = event.clientX || event.touches?.[0]?.clientX;
    let y = event.clientY || event.touches?.[0]?.clientY;

    if (x > width * 0.66 && snakeDir !== "LEFT") {
        snakeDir = "RIGHT"; // לחיצה בצד ימין → נחש הולך ימינה
    } else if (x < width * 0.33 && snakeDir !== "RIGHT") {
        snakeDir = "LEFT"; // לחיצה בצד שמאל → נחש הולך שמאלה
    } else if (y < height * 0.33 && snakeDir !== "DOWN") {
        snakeDir = "UP"; // לחיצה בחלק העליון → נחש הולך למעלה
    } else if (y > height * 0.66 && snakeDir !== "UP") {
        snakeDir = "DOWN"; // לחיצה בחלק התחתון → נחש הולך למטה
    }
}


// פונקציה לזיהוי תחילת מגע
function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

// פונקציה לזיהוי סוף מגע והשוואת כיוון
function handleTouchEnd(event) {
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;

    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0 && snakeDir !== "LEFT") snakeDir = "RIGHT"; // Swipe Right
        else if (diffX < 0 && snakeDir !== "RIGHT") snakeDir = "LEFT"; // Swipe Left
    } else if (Math.abs(diffY) > swipeThreshold) {
        if (diffY > 0 && snakeDir !== "UP") snakeDir = "DOWN"; // Swipe Down
        else if (diffY < 0 && snakeDir !== "DOWN") snakeDir = "UP"; // Swipe Up
    }
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

    if (gameState === "WIN_SCREEN") {
        drawWinScreen();
        return;
    }

    if (gameOver) {
        drawGameOver();
        return;
    }

    background(backgroundImage);
    drawSnake();
    drawGhost();
    animateEatenFood(); // הצגת האוכל שנאכל עם האנימציה
    drawScore();
    moveSnake();
}

function drawMenu() {

    let gradientColor = lerpColor(color(15, 23, 42), color(22, 30, 58), sin(frameCount * 0.01));
    background(gradientColor);

    background(15, 23, 42); // רקע כהה אלגנטי
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(255);
    text("YOU:", width / 2, height / 6);

    // הצגת תמונת ראש הנחש
    image(snakeHeadImage, width / 2 - 20, height / 6 + 30, 40, 40);

    // טקסט "FOOD:"
    text("FOOD:", width / 2, height / 3);

    // הצגת תמונות האוכל (מסודרות בשורות)
    let startY = height / 3 + 30;
    let cols = 4;
    let spacing = 60;

    for (let i = 0; i < ghostImages.length; i++) {
        let x = (i % cols) * spacing + (width / 2 - ((cols - 1) * spacing) / 2);
        let y = startY + floor(i / cols) * spacing;
        image(ghostImages[i], x, y, 40, 40);
    }

    // כפתור "SURVIVE"
    fill(0, 255, 153);
    rect(width / 2 - 80, height - 150, 160, 50, 10);
    fill(0);
    textSize(20);
    text("SURVIVE", width / 2, height - 130);

    // כפתור "EXIT"
    fill(255, 77, 77);
    rect(width / 2 - 80, height - 80, 160, 50, 10);
    fill(0);
    textSize(20);
    text("EXIT", width / 2, height - 60);
}



function drawLevelTransition() {
    background(0);
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text(`You survived ${level} year!`, width / 2, height / 2 - 20);

    fill(0, 255, 0);
    rect(width / 2 - 80, height / 2 + 30, 160, 40);
    fill(0);
    textSize(20);
    text("Continue to Year 2", width / 2, height / 2 + 50);
}

function drawWinScreen() {
    background(0);
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255);
    text("You survived 2 years!", width / 2, height / 2 - 20);

    textSize(20);
    text("Congratulations!", width / 2, height / 2 + 20);
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
    text("Game Over!", width / 2, height / 2 - 20);

    // כפתור Restart
    fill(0, 255, 0);
    rect(width / 2 - 60, height / 2 + 20, 120, 40);
    fill(0);
    textSize(20);
    text("Restart", width / 2, height / 2 + 40);
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

        // הוספת האוכל שנאכל לאנימציה
        eatenFoodEffects.push({
            x: ghostPos[0],
            y: ghostPos[1],
            size: cellSize,
            opacity: 255, // שקיפות מלאה בהתחלה
            image: ghostImage
        });

        spawnNewGhost();
        playRandomEatSound();

        if (score === maxScorePerLevel) {
            if (level === 1) {
                gameState = "LEVEL_TRANSITION";
            } else if (level === 2) {
                gameState = "WIN_SCREEN";
            }
        }
    } else {
        snake.pop();
    }



}

function animateEatenFood() {
    for (let i = eatenFoodEffects.length - 1; i >= 0; i--) {
        let food = eatenFoodEffects[i];

        // הגדלת המזון והפחתת השקיפות בהדרגה
        food.size += 2;
        food.opacity -= 15;

        // ציור המזון עם שקיפות
        tint(255, food.opacity);
        image(food.image, food.x, food.y, food.size, food.size);
        noTint();

        // אם המזון נעלם לחלוטין, להסיר אותו מהמערך
        if (food.opacity <= 0) {
            eatenFoodEffects.splice(i, 1);
        }
    }
}


function keyPressed() {
    if (keyCode === UP_ARROW && snakeDir !== "DOWN") snakeDir = "UP";
    if (keyCode === DOWN_ARROW && snakeDir !== "UP") snakeDir = "DOWN";
    if (keyCode === LEFT_ARROW && snakeDir !== "RIGHT") snakeDir = "LEFT";
    if (keyCode === RIGHT_ARROW && snakeDir !== "LEFT") snakeDir = "RIGHT";
    if (key === "R" || key === "r") resetGame();
    if (key === "M" || key === "m") gameState = "MENU"; // חזרה לתפריט
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

    if (gameState === "GAME_OVER") {
        if (mouseX > width / 2 - 60 && mouseX < width / 2 + 60 &&
            mouseY > height / 2 + 20 && mouseY < height / 2 + 60) {
            gameState = "PLAYING";
            resetGame();
        }
    }

    if (gameState === "LEVEL_TRANSITION") {
        if (mouseX > width / 2 - 80 && mouseX < width / 2 + 80 &&
            mouseY > height / 2 + 30 && mouseY < height / 2 + 70) {
            level = 2;
            score = 0;
            gameState = "PLAYING";
            resetGame();
        }
    }
}

function resetGame() {
    snake = [[100, 50], [90, 50], [80, 50]];
    snakeDir = "RIGHT";
    score = 0;
    spawnNewGhost();
    gameOver = false;
}


function spawnNewGhost() {
    ghostPos = randomGhostPosition();
    ghostImage = random(ghostImages);
}

function drawGhost() {
    let bounceOffset = sin(frameCount * 0.1) * 5;
    image(ghostImage, ghostPos[0], ghostPos[1] + bounceOffset, cellSize, cellSize);
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
    let colors = [
        color(0, 255, 0),
        color(0, 200, 50),
        color(0, 180, 100),
    ];

    for (let i = 0; i < snake.length; i++) {
        fill(colors[i % colors.length]);
        rect(snake[i][0], snake[i][1], cellSize, cellSize, 5);
    }

}

function drawScore() {
    fill(255);
    textSize(16);
    text(`Score: ${score}`, 10, 20);
    text(`Level: ${level}`, width - 70, 20);
}
