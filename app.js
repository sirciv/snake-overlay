class SnakeGame {

  init() {
    this.$app = document.querySelector('#app');
    this.$canvas = this.$app.querySelector('canvas');
    this.ctx = this.$canvas.getContext('2d');
    this.$score = this.$app.querySelector('.score');

    this.settings = {
      canvas: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: 'transparent',
        border: '#ffffff'
      },
      snake: {
        size: 45, //this is related to const x and y
        background: '#F6873D',
        border: '#F6873D'
      }
    };

    // The snake starts off with 5 pieces
    // Each piece is 30x30 pixels
    // Each following piece must be n times as far from the first piece
    const x = 450;
    const y = 450;

    this.snake = [
      { x: x, y: y },
      { x: x - this.settings.snake.size, y: y },
      { x: x - (this.settings.snake.size * 2), y: y },
      { x: x - (this.settings.snake.size * 3), y: y },
      { x: x - (this.settings.snake.size * 4), y: y }
    ];

    this.food = {
      active: false,
      coordinates: {
        x: 0,
        y: 0  
      }
    };

    this.game = {
      speed: 100,
      keyCodes: {
        87: 'up',
        83: 'down',
        68: 'right',
        65: 'left',
        38: 'up',
        40: 'down',
        39: 'right',
        37: 'left'
      }  
    };

    this.game.score = 0;
    this.game.direction = 'right';
    this.game.nextDirection = 'right';
    this.game.speed = 100;

    this.soundEffects = {
      score: new Audio('assets/score.mp3')
    };

    this.startGame();
  }

  startGame() {

    //allows use of arrow keys without scrolling the page

    this.scrollBlock = function (e) {
      if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
      }
    };
    this.scrollHandler = this.scrollBlock.bind(this);
    window.addEventListener("keydown", this.scrollBlock);

    // Reset a few things from the prior game
    this.$app.classList.add('game-in-progress');
    this.$app.classList.remove('game-over');
    this.$score.innerText = 0;

    this.generateSnake();

    this.startGameInterval = setInterval(() => {
      if(!this.detectCollision()) {
        this.generateSnake();
      } else {
        this.endGame();
      }
    }, this.game.speed);

    // Change direction
    document.addEventListener('keydown', event => {
      this.changeDirection(event.keyCode);
    });
  }

  changeDirection(keyCode) {
    const validKeyPress = Object.keys(this.game.keyCodes).includes(keyCode.toString());

    if(validKeyPress && this.validateDirectionChange(this.game.keyCodes[keyCode], this.game.direction)) {
      this.game.nextDirection = this.game.keyCodes[keyCode];
    }
  }

  // When already moving in one direction snake shouldn't be allowed to move in the opposite direction
  validateDirectionChange(keyPress, currentDirection) {
    return (keyPress === 'left' && currentDirection !== 'right') || 
      (keyPress === 'right' && currentDirection !== 'left') ||
      (keyPress === 'up' && currentDirection !== 'down') ||
      (keyPress === 'down' && currentDirection !== 'up');
  }

  resetCanvas() {
    // Full screen size
    this.$canvas.width = this.settings.canvas.width;
    this.$canvas.height = this.settings.canvas.height;

    // Background
    this.ctx.fillStyle = this.settings.canvas.background;
    this.ctx.fillRect(0, 0, this.$canvas.width, this.$canvas.height);
  }

  generateSnake() {
    let coordinate;

    switch(this.game.direction) {
      case 'right':
        coordinate = {
          x: this.snake[0].x + this.settings.snake.size,
          y: this.snake[0].y
        };
      break;
      case 'up':
        coordinate = {
          x: this.snake[0].x,
          y: this.snake[0].y - this.settings.snake.size
        };
      break;
      case 'left':
        coordinate = {
          x: this.snake[0].x - this.settings.snake.size,
          y: this.snake[0].y
        };
      break;
      case 'down':
        coordinate = {
          x: this.snake[0].x,
          y: this.snake[0].y + this.settings.snake.size
        };
    }

    // The snake moves by adding a piece to the beginning "this.snake.unshift(coordinate)" and removing the last piece "this.snake.pop()"
    // Except when it eats the food in which case there is no need to remove a piece and the added piece will make it grow
    this.snake.unshift(coordinate);
    this.resetCanvas();

    const ateFood = this.snake[0].x === this.food.coordinates.x && this.snake[0].y === this.food.coordinates.y;

    if(ateFood) {
      this.food.active = false;
      this.game.score += 1;
      this.snake.push(100);
      this.$score.innerText = this.game.score;
      this.soundEffects.score.play();
    } else {
      this.snake.pop();
    }

    this.generateFood();
    this.drawSnake();
  }

  drawSnake() {
    const size = this.settings.snake.size;

    this.ctx.fillStyle = this.settings.snake.background;

    // Draw each piece
    this.snake.forEach(coordinate => {
      this.ctx.fillRect(coordinate.x, coordinate.y, size, size);
    });

    this.game.direction = this.game.nextDirection;
  }

  generateFood() {
    // If there is uneaten food on the canvas there's no need to regenerate it
    if(this.food.active) {
      this.drawFood(this.food.coordinates.x, this.food.coordinates.y);
      return;
    }

    const gridSize = this.settings.snake.size;
    const xMax = this.settings.canvas.width - gridSize;
    const yMax = this.settings.canvas.height - gridSize;

    const x = Math.round((Math.random() * xMax) / gridSize) * gridSize;
    const y = Math.round((Math.random() * yMax) / gridSize) * gridSize;

    // Make sure the generated coordinates do not conflict with the snake's present location
    // If so recall this method recursively to try again
    this.snake.forEach(coordinate => {
      const foodSnakeConflict = coordinate.x == x && coordinate.y == y;

      if(foodSnakeConflict) {
        this.generateFood();
      } else {
        this.drawFood(x, y);
      }
    });
  }

  drawFood(x, y) {
    const size = this.settings.snake.size;

    // use this if you want each square to be seperate
    // this.ctx.fillRect(x, y, size, size);

    var img = new Image;
    img.src = "assets/snake-icon.png";
    this.ctx.drawImage(img, x, y, size, size);
    

    // let icon = document.getElementById("gearlogo_noflash");
    // this.ctx.drawImage(icon, x, y, size, size);

    this.food.active = true;
    this.food.coordinates.x = x;
    this.food.coordinates.y = y;
  }

  detectCollision() {
    for(let i = 4; i < this.snake.length; i++) {
      const selfCollison = this.snake[i].x === this.snake[0].x && this.snake[i].y === this.snake[0].y;

      if(selfCollison) {
        return true;
      }
    }

    // Wall collison
    const leftCollison = this.snake[0].x < 0;
    const topCollison = this.snake[0].y < 0;
    const rightCollison = this.snake[0].x > this.$canvas.width - this.settings.snake.size;
    const bottomCollison = this.snake[0].y > this.$canvas.height - this.settings.snake.size;

    return leftCollison || topCollison || rightCollison || bottomCollison;
  }

  endGame() {
    clearInterval(this.startGameInterval);
    this.$app.classList.remove('game-in-progress');
    const mainDiv = document.getElementById("app");
    mainDiv.remove();
    window.removeEventListener("keydown", this.scrollBlock);
  }x
}

const snakeGame = new SnakeGame();