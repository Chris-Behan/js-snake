import {
  init,
  Sprite,
  GameLoop,
  initKeys,
  keyPressed,
  Text,
} from "./kontra.mjs";

let { canvas } = init();
initKeys();
const tileWidth = 50;

function makeSnakeSquare(x, y) {
  return Sprite({
    x: x,
    y: y,
    prevX: x,
    prevY: y,
    color: "green",
    width: tileWidth,
    height: tileWidth,
    dir: 1,
    tail: null,
    score: 0,
  });
}

const fruit = Sprite({
  x: randomPos(8),
  y: randomPos(12),
  color: "red",
  width: 50,
  height: 50,
});

function createVerticalLine(x) {
  return Sprite({
    x: x,
    y: 0,
    color: "black",
    width: 1,
    height: canvas.height,
  });
}

function createHorizontalLine(y) {
  return Sprite({
    x: 0,
    y: y,
    color: "black",
    width: canvas.width,
    height: 1,
  });
}

function randomPos(max) {
  return Math.floor(Math.random() * max) * tileWidth;
}

let frameCounter = 1;
let gameOver = false;
const gameOverText = Text({
  text: "Game Over",
  color: "red",
  font: "64px Arial",
  x: 38,
  y: 200,
  textAlign: "center",
});

const restartText = Text({
  text: "Press space to restart",
  color: "red",
  font: "32px Arial",
  x: 45,
  y: 400,
  textAlign: "center",
});

function getScoreText(score) {
  return Text({
    text: `Score: ${score}`,
    color: "red",
    font: "64px Arial",
    x: 80,
    y: 300,
    textAlign: "center",
  });
}

function drawGrid() {
  let i = 1;
  while (i * snake.width <= canvas.width) {
    let line = createVerticalLine(i * snake.width);
    line.render();
    i++;
  }
  let j = 1;
  while (j * snake.width <= canvas.height) {
    let line = createHorizontalLine(j * snake.width);
    line.render();
    j++;
  }
}

function handleInput(snake) {
  if (gameOver && keyPressed("space")) {
    snake.score = 0;
    snake.tail = null;
    gameOver = false;
    snake.x = 100;
    snake.y = 150;
    snake.dir = 1;
  }

  // Don't allow snake to move in opposite of current direction
  if (keyPressed("left") && snake.dir !== 1) {
    snake.dir = 0;
  } else if (keyPressed("right") && snake.dir !== 0) {
    snake.dir = 1;
  } else if (keyPressed("up") && snake.dir !== 3) {
    snake.dir = 2;
  } else if (keyPressed("down") && snake.dir !== 2) {
    snake.dir = 3;
  }
}

function updateHead(head) {
  switch (head.dir) {
    case 0:
      head.prevX = head.x;
      head.prevY = head.y;
      head.x -= tileWidth;
      break;
    case 1:
      head.prevX = head.x;
      head.prevY = head.y;
      head.x += tileWidth;
      break;
    case 2:
      head.prevX = head.x;
      head.prevY = head.y;
      head.y -= tileWidth;
      break;
    case 3:
      head.prevX = head.x;
      head.prevY = head.y;
      head.y += tileWidth;
      break;
  }
}

function handleCollision(head) {
  handleWallCollision(head);
  handleSelfCollision(head);
  handleFruitCollision(head, fruit);
}

function handleFruitCollision(head, fruit) {
  if (head.x == fruit.x && head.y == fruit.y) {
    head.score++;
    spawnFruit(head, fruit);
    while (head.tail != null) {
      head = head.tail;
    }
    head.tail = makeSnakeSquare(head.prevX, head.prevY);
  }
}

function spawnFruit(head, fruit) {
  fruit.x = randomPos(8);
  fruit.y = randomPos(12);
  let validPos = false;
  // check that fruit did not spawn on top of snake
  while (!validPos) {
    validPos = true;
    let headRef = head;
    while (headRef !== null) {
      if (headRef.x == fruit.x && headRef.y == fruit.y) {
        fruit.x = randomPos(8);
        fruit.y = randomPos(12);
        validPos = false;
        break;
      }
      headRef = headRef.tail;
    }
  }
}

function handleSelfCollision(head) {
  let tail = head.tail;
  while (tail !== null) {
    if (tail.x == head.x && tail.y == head.y) {
      gameOver = true;
    }
    tail = tail.tail;
  }
}

function handleWallCollision(head) {
  if (head.x < 0) {
    gameOver = true;
  } else if (head.x >= canvas.width) {
    gameOver = true;
  } else if (head.y < 0) {
    gameOver = true;
  } else if (head.y >= canvas.height) {
    gameOver = true;
  }
}

function updateTail(head) {
  let tail = head.tail;
  while (tail != null) {
    tail.prevX = tail.x;
    tail.prevY = tail.y;
    tail.x = head.prevX;
    tail.y = head.prevY;
    head = tail;
    tail = tail.tail;
  }
}

function drawSnake(snake) {
  while (snake != null) {
    snake.render();
    snake = snake.tail;
  }
}

let snake = makeSnakeSquare(100, 150);

let loop = GameLoop({
  update() {
    frameCounter += 1;
    handleInput(snake);
    if (frameCounter % 10 == 0) {
      updateHead(snake);
      updateTail(snake);
      handleCollision(snake);
    }
  },

  render() {
    if (!gameOver) {
      drawGrid();
      drawSnake(snake);
      fruit.render();
    } else {
      let score = getScoreText(snake.score);
      score.render();
      gameOverText.render();
      restartText.render();
    }
  },
});

loop.start();
