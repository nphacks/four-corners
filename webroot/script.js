/** @typedef {import('../src/message.ts').DevvitSystemMessage} DevvitSystemMessage */
/** @typedef {import('../src/message.ts').WebViewMessage} WebViewMessage */

class App {
  constructor() {
    // Get references to the HTML elements
    this.output = /** @type {HTMLPreElement} */ (document.querySelector('#messageOutput'));
    this.increaseButton = /** @type {HTMLButtonElement} */ (
      document.querySelector('#btn-increase')
    );
    this.decreaseButton = /** @type {HTMLButtonElement} */ (
      document.querySelector('#btn-decrease')
    );
    this.submitDrawingButton = /** @type {HTMLButtonElement} */ (
      document.querySelector('#btn-get-image')
    );
    this.wordLabel = /** @type {HTMLSpanElement} */ (document.querySelector('#word'));
    this.quarterLabel = /** @type {HTMLSpanElement} */ (document.querySelector('#quarter'));
    this.counter = 0;
    this.imageUrl = 'Test'

    // When the Devvit app sends a message with `postMessage()`, this will be triggered
    addEventListener('message', this.#onMessage);

    // This event gets called when the web view is loaded
    addEventListener('load', () => {
      postWebViewMessage({ type: 'webViewReady' });
    });

    // this.increaseButton.addEventListener('click', () => {
    //   // Sends a message to the Devvit app
    //   postWebViewMessage({ type: 'setCounter', data: { newCounter: this.counter + 1 } });
    // });

    // this.decreaseButton.addEventListener('click', () => {
    //   // Sends a message to the Devvit app
    //   postWebViewMessage({ type: 'setCounter', data: { newCounter: this.counter - 1 } });
    // });

    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.currentColor = '#000000';
    this.lineWidth = 3;

    this.drawingTimeLimit = 120; // 120 seconds
    this.timeLeft = this.drawingTimeLimit;
    this.timerInterval = null;
    this.isDrawingAllowed = true;

    // Set up event listeners
    this.setupEventListeners();
    this.setupColorOptions();
    this.setupBrushStrokeOptions();
  }

  /**
   * @arg {MessageEvent<DevvitSystemMessage>} ev
   * @return {void}
   */
  #onMessage = (ev) => {
    // Reserved type for messages sent via `context.ui.webView.postMessage`
    if (ev.data.type !== 'devvit-message') return;
    const { message } = ev.data.data;

    // Always output full message
    this.output.replaceChildren(JSON.stringify(message, undefined, 2));

    switch (message.type) {
      case 'initialData': {
        // Load initial data
        const { word, quarter } = message.data;
        this.wordLabel.innerText = word;
        this.quarterLabel.innerText = quarter;
        this.counter = currentCounter;
        this.quarterLabel.innerText = `${this.quarter}`;
        break;
      }
      // case 'updateCounter': {
      //   const { currentCounter } = message.data;
      //   this.counter = currentCounter;
      //   this.counterLabel.innerText = `${this.counter}`;
      //   break;
      // }
      case 'updateImageUrl': {
        const { imageUrl } = message.imageUrl;
        this.imageUrl = imageUrl;
        // this.counterLabel.innerText = `${this.counter}`;
        break;
      }
      default:
        /** to-do: @satisifes {never} */
        const _ = message;
        break;
    }
  };

  setupEventListeners() {
    // Drawing events
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.isDrawingAllowed) this.startDrawing(e);
    });
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDrawingAllowed && this.isDrawing) this.draw(e);
    });
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      if (this.isDrawingAllowed) this.handleTouchStart(e);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isDrawingAllowed && this.isDrawing) this.handleTouchMove(e);
    });
    this.canvas.addEventListener('touchend', () => this.stopDrawing());
    
    // Button events
    document.getElementById('btn-clear').addEventListener('click', () => this.clearCanvas());
    document.getElementById('btn-get-image').addEventListener('click', () => {
      this.imageUrl = this.getImageData()
      postWebViewMessage({ type: 'setImageUrl', data: { newImageUrl: this.imageUrl, closeWebView: true } });
    });

    const startTimerOnInteraction = () => {
      if (!this.timerInterval) {
        this.startTimer();
        // Remove this after first interaction
        this.canvas.removeEventListener('mousedown', startTimerOnInteraction);
        this.canvas.removeEventListener('touchstart', startTimerOnInteraction);
      }
    };
    
    this.canvas.addEventListener('mousedown', startTimerOnInteraction);
    this.canvas.addEventListener('touchstart', startTimerOnInteraction);
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      document.getElementById('timer').textContent = `Time left: ${this.timeLeft} seconds`;
      
      if (this.timeLeft <= 0) {
        this.stopTimer();
        this.isDrawingAllowed = false;
        document.getElementById('timer').textContent = "Time's up!";
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  setupColorOptions() {
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selected class from all options
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            option.classList.add('selected');
            // Update current color
            this.currentColor = option.dataset.color;
        });
    });
  }

  setupBrushStrokeOptions() {
    const brushStrokeOptions = document.querySelectorAll('.brush-stroke-option');
    brushStrokeOptions.forEach(option => {
      option.addEventListener('click', () => {
        // Remove selected class from all options
        brushStrokeOptions.forEach(opt => opt.classList.remove('selected'));
        // Add selected class to clicked option
        option.classList.add('selected');
        // Update current line width
        this.lineWidth = parseInt(option.dataset.width);
      });
    });
  }

  startDrawing(e) {
    this.isDrawing = true;
    const pos = this.getCanvasCoordinates(e);
    [this.lastX, this.lastY] = [pos.x, pos.y];
  }

  draw(e) {
    if (!this.isDrawing) return;
    
    const pos = this.getCanvasCoordinates(e);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
    [this.lastX, this.lastY] = [pos.x, pos.y];
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    this.canvas.dispatchEvent(mouseEvent);
  }

  handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    this.canvas.dispatchEvent(mouseEvent);
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getImageData() {
      // const imageDataURL = this.canvas.toDataURL('image/png');
      // return imageDataURL;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Fill with white then draw original content
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(this.canvas, 0, 0);
    
    return tempCanvas.toDataURL('image/png');
  }

  getCanvasCoordinates(e) {
      const rect = this.canvas.getBoundingClientRect();
      return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
      };
  }

}

/**
 * Sends a message to the Devvit app.
 * @arg {WebViewMessage} msg
 * @return {void}
 */
function postWebViewMessage(msg) {
  parent.postMessage(msg, '*');
}

new App();
