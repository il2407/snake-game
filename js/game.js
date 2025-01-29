let cellSize = 40;
let snake = [];
let snakeDir = "RIGHT";
let touchStartX = 0;
let touchStartY = 0;
let videoWin; // משתנה לסרטון הניצחון
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
let width = window.innerWidth * 0.9; // 90% מרוחב המסך
let height = window.innerHeight * 0.9; // 90% מגובה המסך
let moveDelay = 10; // הנחש יזוז רק כל 6 פריימים




let snakeBodyImages = [];

function preload() {
    snakeHeadImage = loadImage("assets/face.png");
    backgroundImage = loadImage("assets/background.png");
    winImage = loadImage("assets/win_image.png");

    // טען את הסרטון
    videoWin = createVideo("assets/win_video.mp4");
    videoWin.hide(); // מחביאים את הסרטון עד לסיום המשחק

    ghostImages = [
        loadImage("assets/miso.png"),
        loadImage("assets/mold.png"),
        loadImage("assets/frisbee.png"),
        loadImage("assets/car.png"),
        loadImage("assets/gamba.png"),
        loadImage("assets/floor.png"),
        loadImage("assets/rest.png"),
        loadImage("assets/tavor.png"),
        loadImage("assets/rest2.png"),
        loadImage("assets/india.png")
    ];

    snakeBodyImages = [
        loadImage("assets/snake_body1.png"),
        loadImage("assets/snake_body2.png")
    ];

    for (let i = 1; i <= 1123; i++) {
        let soundFile = loadSound(`song_parts/part${i}.mp3`);
        eatSounds.push(soundFile);
    }
}


function setup() {
    createCanvas(width, height);
    frameRate(30);

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
    animateEatenFood();
    drawScore();

    // הנחש יזוז רק כל 'moveDelay' פריימים
    if (frameCount % moveDelay === 0) {
        moveSnake();
    }
}


function drawMenu() {
    background(15, 23, 42);
    textAlign(CENTER, CENTER);

    let sectionHeight = height / 3; // כל חלק תופס שליש מהמסך
    let imageSize = width * 0.15; // גודל התמונות

    /** 🔹 חלק 1: YOU + תמונות הנחש **/
    fill(255);
    textSize(width * 0.07);
    text("YOU", width / 2, sectionHeight * 0.25);

    // הצגת ראש הנחש וגוף הנחש מתחת לטקסט
    image(snakeHeadImage, width / 2 - imageSize - 10, sectionHeight * 0.4, imageSize, imageSize);
    image(snakeBodyImages[1], width / 2 + 10, sectionHeight * 0.4, imageSize, imageSize);

    /** 🔹 חלק 2: FOOD + תמונות האוכל **/
    fill(255);
    text("FOOD", width / 2, sectionHeight + sectionHeight * 0.25);

    let foodStartY = sectionHeight + sectionHeight * 0.4;
    let cols = 4;
    let spacing = width * 0.18;

    for (let i = 0; i < ghostImages.length; i++) {
        let x = (i % cols) * spacing + (width / 2 - ((cols - 1) * spacing) / 2);
        let y = foodStartY + floor(i / cols) * spacing;
        image(ghostImages[i], x, y, imageSize, imageSize);
    }

    /** 🔹 חלק 3: כפתור SURVIVE! (בגודל זהה לשאר החלקים) **/
    let btnWidth = width * 0.6;
    let btnHeight = sectionHeight * 0.6;
    let btnX = width / 2 - btnWidth / 2;
    let btnY = sectionHeight * 2 + sectionHeight * 0.2;

    fill(0, 255, 153);
    rect(btnX, btnY, btnWidth, btnHeight, 15);
    fill(0);
    textSize(width * 0.07);
    text("SURVIVE!", width / 2, btnY + btnHeight / 2);
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
    textSize(width * 0.07);
    fill(255);
    text("You survived 2 years!", width / 2, height * 0.2);

    // אם הסרטון עדיין לא מתנגן, ננגן אותו
    if (!videoWin.elt.playing) {
        videoWin.position(width * 0.1, height * 0.3);
        videoWin.size(width * 0.8, height * 0.4);
        videoWin.show();
        videoWin.play();
    }

    // כפתור לחזור לתפריט הראשי
    let btnWidth = width * 0.6;
    let btnHeight = height * 0.08;
    let btnX = width / 2 - btnWidth / 2;
    let btnY = height * 0.75;

    fill(0, 255, 0);
    rect(btnX, btnY, btnWidth, btnHeight, 15);
    fill(0);
    textSize(width * 0.05);
    text("Back to Menu", width / 2, btnY + btnHeight / 2);
}


function drawLevelTransition() {
    background(0);
    textAlign(CENTER, CENTER);

    // הצגת הודעת מעבר שלב
    fill(255);
    textSize(width * 0.07); // גודל פונט מותאם
    text(`You survived ${level} year!`, width / 2, height * 0.4);

    // כפתור "Continue"
    let btnWidth = width * 0.6;
    let btnHeight = height * 0.08;
    let btnX = width / 2 - btnWidth / 2;
    let btnY = height * 0.55;

    fill(0, 255, 0);
    rect(btnX, btnY, btnWidth, btnHeight, 15);

    fill(0);
    textSize(width * 0.05);
    text("Continue to Year 2", width / 2, btnY + btnHeight / 2);
}

function drawGameOver() {
    background(30);
    textAlign(CENTER, CENTER);

    fill(255);
    textSize(width * 0.07);
    text("Game Over!", width / 2, height * 0.4);

    let btnWidth = width * 0.5;
    let btnHeight = height * 0.08;
    let btnX = width / 2 - btnWidth / 2;
    let btnY = height * 0.55;

    fill(0, 255, 0);
    rect(btnX, btnY, btnWidth, btnHeight, 15);

    fill(0);
    textSize(width * 0.05);
    text("Restart", width / 2, btnY + btnHeight / 2);
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

    eatenFoodEffects.push({
        x: ghostPos[0],
        y: ghostPos[1],
        size: cellSize * 2, // מתחיל בגודל המוגדל
        opacity: 255,
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
        let btnX = width / 2 - 60;
        let btnY = height - 150;
        let btnWidth = 120;
        let btnHeight = 40;
        if (mouseX > btnX && mouseX < btnX + btnWidth &&
            mouseY > btnY && mouseY < btnY + btnHeight) {
            gameState = "PLAYING";
            resetGame();
        }
    }

    if (gameState === "GAME_OVER") {
        let btnX = width / 2 - 60;
        let btnY = height - 150;
        let btnWidth = 120;
        let btnHeight = 40;

        if (mouseX > btnX && mouseX < btnX + btnWidth &&
            mouseY > btnY && mouseY < btnY + btnHeight) {
            gameState = "MENU"; // חזרה לתפריט הראשי
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
    level = 1;
    gameOver = false;
    gameState = "PLAYING"; // החזרת המשחק למצב פעיל
    spawnNewGhost();
}



function spawnNewGhost() {
    ghostPos = randomGhostPosition();
    ghostImage = random(ghostImages);
}

function drawGhost() {
    let foodSize = cellSize * 1.5; // 50% יותר גדול
    let offset = (foodSize - cellSize) / 2;
    image(ghostImage, ghostPos[0] - offset, ghostPos[1] - offset, foodSize, foodSize);
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
            // הראש תמיד יישאר עם תמונת הפנים
            image(snakeHeadImage, snake[i][0], snake[i][1], cellSize, cellSize);
        } else {
            // הצגת הגוף עם שתי תמונות מתחלפות לסירוגין
            let bodyImage = snakeBodyImages[i % 2];
            image(bodyImage, snake[i][0], snake[i][1], cellSize, cellSize);
        }
    }
}


function drawScore() {
    let padding = width * 0.03; // מרווח מהקצה
    let boxHeight = height * 0.05; // גובה תיבת הניקוד
    let textSizeValue = width * 0.045; // גודל טקסט יחסי

    // רקע כהה מאחורי הניקוד והשלב
    fill(0, 0, 0, 150);
    rect(padding, padding, width * 0.35, boxHeight, 8);
    rect(width - width * 0.35 - padding, padding, width * 0.35, boxHeight, 8);

    // הצגת הניקוד והשלב
    fill(255);
    textSize(textSizeValue);
    textAlign(LEFT, CENTER);
    text(`Score: ${score}`, padding + 10, padding + boxHeight / 2);

    textAlign(RIGHT, CENTER);
    text(`Level: ${level}`, width - padding - 10, padding + boxHeight / 2);
}

