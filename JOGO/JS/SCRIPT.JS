class Position {          // Armazena as coordenadas
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Game {       
  constructor(difficulty) {                // Classe responsável pelo jogo
    this.difficulty = difficulty;      
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvasWidth = 600;
    this.canvasHeight = 600;
    this.size = 30;
    this.initialPosition = new Position(270, 240);
    this.snake = [this.initialPosition];
    this.direction = null;
    this.gameLoop = null;
    this.food = null;
    this.foodColor = null;
    this.defaultValuePoints = 10;
    this.scorePointText = document.querySelector(".score__value");
    this.menuGameOver = document.querySelector(".menu-screen");
    this.scoreTextMenuGameOver = document.querySelector(".score_game_over");
    this.restartButtonGame = document.querySelector(".btn-play");
    this.highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;

    this.setDifficulty();
    this.initializeCanvasSize();
    this.eventMovementSnake();
    this.gameStart();
    this.restartGameEvent();
    this.updateHighScoreDisplay();
  }
  restartGameEvent() {
    // Evento para o botão "Jogar novamente"
    this.restartButtonGame.addEventListener("click", () => {
      this.menuGameOver.style.display = "none";
      this.canvas.style.filter = "blur(0px)";
      this.scorePointText.textContent = 0;
      this.snake = [this.initialPosition];
      // Reinicia o jogo, se necessário
      this.direction = null; // Resetar a direção
    });
  
    // Evento para o botão "Voltar ao Início"
    const homeButton = document.querySelector(".btn-home");
    homeButton.addEventListener("click", () => {
      this.menuGameOver.style.display = "none"; // Oculta o menu de game over
      
      // Mostra o menu inicial
      const initMenu = document.querySelector(".initial-menu");
      initMenu.style.display = "flex";
      
      // Reseta a pontuação e a cobra
      this.scorePointText.textContent = 0;
      this.snake = [this.initialPosition];
      this.direction = null; // Resetar a direção
    });
  }
  
  setDifficulty() {            // Define a dificuldade do jogo
    const difficulties = { easy: 5000, normal: 4000, hard: 2000 };
    this.difficulty = difficulties[this.difficulty] || 3000; // Padrão para normal
  }

  initializeCanvasSize() {         // Dimensões do canvas
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
  }

  drawnSnake() {              // Desenha cada parte da cobra
    this.ctx.fillStyle = "white";

    this.snake.forEach((positionSnake, index) => {
      this.ctx.fillStyle = index === this.snake.length - 1 ? "gray" : "white";
      this.ctx.fillRect(positionSnake.x, positionSnake.y, this.size, this.size);
    });
  }

  eventMovementSnake() {     // Atualiza direção com base no comando
    document.addEventListener("keydown", ({ key }) => {
      const directions = {
        ArrowUp: "up", w: "up",
        ArrowLeft: "left", a: "left",
        ArrowDown: "down", s: "down",
        ArrowRight: "right", d: "right"
      };
      this.direction = directions[key] || this.direction;
    });
  }
  

  movementSnake() {       // Atualiza a posição da cobra
    if (!this.direction) return;

    const headSnake = this.snake[this.snake.length - 1];
    let newHead;

    switch (this.direction) {
      case "up":
        newHead = new Position(headSnake.x, headSnake.y - this.size);
        break;
      case "down":
        newHead = new Position(headSnake.x, headSnake.y + this.size);
        break;
      case "left":
        newHead = new Position(headSnake.x - this.size, headSnake.y);
        break;
      case "right":
        newHead = new Position(headSnake.x + this.size, headSnake.y);
        break;
    }

    this.snake.push(newHead);
    this.snake.shift();
  }

  randomIndex(array) {     // Retorna um índice aleatório de um array
    return array[Math.floor(Math.random() * array.length)];
  }

  randomColorFood() {      // Gera cores aleatórias para a comida
    const colorsArray = [
      "#FF5733", "#33FF57", "#3357FF", "#FF33A6", 
      "#A633FF", "#33FFF2", "#FF9633", "#33FF96", 
      "#9633FF", "#FF3396", "#FF3333", "#33FF33", 
      "#3333FF", "#FFFF33", "#FF33FF", "#33FFFF", 
      "#FF6633", "#3366FF", "#66FF33", "#FF3366"
    ];

    return this.randomIndex(colorsArray);
  }

  generateMultiplesOfThree() {   // Gera as coordenadas da comida
    const numbers = [];
    for (let i = 0; i < this.canvasWidth - this.size; i += this.size) {
      numbers.push(i);
    }
    return this.randomIndex(numbers);
  }

  drawnFood() {  // Desenha a comida no canvas
    if (!this.food) {
      this.food = new Position(
        this.generateMultiplesOfThree(),
        this.generateMultiplesOfThree()
      );
      this.foodColor = this.randomColorFood();
    }

    this.ctx.fillStyle = this.foodColor;
    this.ctx.fillRect(this.food.x, this.food.y, this.size, this.size);
  }

  incrementPoints() {   // Atualiza os pontos quando a comida é pega
    this.scorePointText.innerHTML =
      parseInt(this.scorePointText.innerHTML) + this.defaultValuePoints;
  }

  checkFoodCollision() {     // Verifica se a comida foi comida e adiciona novo corpo à cobra 
    const head = this.snake[this.snake.length - 1];

    if (head.x === this.food.x && head.y === this.food.y) {
      this.incrementPoints();
      this.food = null; // Gera nova comida na próxima iteração
      this.snake.push(head); // Adiciona o novo segmento
      // Se desejar tocar um som, descomente a linha abaixo:
      // this.pointAudio.play();
    }
  }

  checkLandscapeCollision() {        // Verifica se houve colisão com bordas ou com a própria cobra 
    const head = this.snake[this.snake.length - 1];
    const neckIndex = this.snake.length - 2;

    const outOfBounds = head.x < 0 || head.x >= this.canvasWidth || head.y < 0 || head.y >= this.canvasHeight;
    const selfCollision = this.snake.find(
      (position, index) =>
        index < neckIndex && position.x === head.x && position.y === head.y
    );

    if (outOfBounds || selfCollision) {
      this.gameOver();
    }
  }
  
  updateHighScoreDisplay() {
    const highScoreText = document.querySelector(".high-score"); // Você precisa criar esse elemento no HTML
    highScoreText.textContent = this.highScore;
  }

  incrementPoints() {
    this.scorePointText.innerHTML = parseInt(this.scorePointText.innerHTML) + this.defaultValuePoints;

    // Verifica se a pontuação atual é maior que o recorde
    const currentScore = parseInt(this.scorePointText.innerHTML);
    if (currentScore > this.highScore) {
      this.highScore = currentScore;
      localStorage.setItem('highScore', this.highScore); // Armazena o novo recorde
      this.updateHighScoreDisplay(); // Atualiza a exibição
    }
  }
  gameOver() {          // Fim do jogo
    this.direction = null; // Para a cobra
    this.menuGameOver.style.display = "flex"; // Exibe menu de fim de jogo
    this.scoreTextMenuGameOver.innerHTML = this.scorePointText.textContent;
    // Mostra o recorde na tela de game over
    const highScoreTextGameOver = document.querySelector(".high-score_game_over"); // Crie esse elemento no HTML
    highScoreTextGameOver.textContent = this.highScore;
    this.canvas.style.filter = "blur(2px)"; // Aplica efeito de desfoque
    this.scoreTextMenuGameOver.innerHTML = this.scorePointText.textContent; // Mostra pontuação final
  }

  restartGameEvent() {
    // Evento para o botão "Jogar novamente"
    this.restartButtonGame.addEventListener("click", () => {
      this.menuGameOver.style.display = "none";
      this.canvas.style.filter = "blur(0px)";
      this.scorePointText.textContent = 0;
      this.snake = [this.initialPosition];
      // Reinicia o jogo, se necessário
      this.direction = null; // Resetar a direção
    });
  
    // Evento para o botão "Voltar ao Início"
    const homeButton = document.querySelector(".btn-home");
    homeButton.addEventListener("click", () => {
      this.menuGameOver.style.display = "none"; // Oculta o menu de game over
      
      // Mostra o menu inicial
      const initMenu = document.querySelector(".initial-menu");
      initMenu.style.display = "flex";
      
      // Reseta a pontuação e a cobra
      this.scorePointText.textContent = 0;
      this.snake = [this.initialPosition];
      this.direction = null; // Resetar a direção
    });
  }

  gameStart() {      // Inicia o loop principal do jogo
    this.gameLoop = setInterval(() => {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

      this.drawnSnake();
      this.movementSnake();
      this.drawnFood();
      this.checkFoodCollision();
      this.checkLandscapeCollision();
    }, 300);

    setInterval(() => {
      this.food = null; // Gera nova comida se não houver
    }, this.difficulty);
  }
}

window.onload = () => {            // Carrega a página inicial com o nome e dificuldade selecionada
  const initMenu = document.querySelector(".initial-menu");
  const nickname = document.querySelector("#nickname");
  const difficulty = document.querySelector(".difficulty-game");
  const initGameBtn = document.querySelector(".init_game");
  const canvas = document.querySelector("canvas");
  const nicknameText = document.querySelector(".nickname_player");
  const errorsText = document.querySelector(".error_text");

  initGameBtn.addEventListener("click", () => {
    if (!nickname.value || !difficulty.value) {
      errorsText.style.display = "block";
      return;
    }

    nicknameText.textContent = nickname.value;
    initMenu.style.display = "none";
    canvas.style.display = "flex";

    new Game(difficulty.value);
  });
};
