/** @typedef {import('../src/message.ts').DevvitSystemMessage} DevvitSystemMessage */
/** @typedef {import('../src/message.ts').WebViewMessage} WebViewMessage */

class App {
    constructor() {
      // Get references to the HTML elements
      this.output = /** @type {HTMLPreElement} */ (document.querySelector('#messageOutput'));
      // this.debugOutput = document.querySelector('#debug-output');
      this.image1 =  /** @type {HTMLImageElement} */ document.querySelector('#image1');
      this.image2 = /** @type {HTMLImageElement} */ document.querySelector('#image2'); 
      this.image3 = /** @type {HTMLImageElement} */ document.querySelector('#image3');
      this.image4 = /** @type {HTMLImageElement} */ document.querySelector('#image4');
      this.timeLeft = 15;
      addEventListener('message', this.#onMessage);
      addEventListener('load', () => {
        postWebViewMessage({ type: 'webViewReady' });
      });
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
            const { image1, image2, image3, image4 } = message.data;
            // if (this.debugOutput) {
            //   this.debugOutput.innerText = `
            //     Image1: ${image1 ? 'Received' : 'Missing'}<br>
            //     Image2: ${image2 ? 'Received' : 'Missing'}<br> 
            //     Image3: ${image3 ? 'Received' : 'Missing'}<br>
            //     Image4: ${image4 ? 'Received' : 'Missing'}
            //   `;
            // }
            
            // Set images if they exist
            if (image1 && this.image1) this.image1.src = image1;
            if (image2 && this.image2) this.image2.src = image2;
            if (image3 && this.image3) this.image3.src = image3;
            if (image4 && this.image4) this.image4.src = image4;
            this.startTimer();
            break;
        }
        default:
          /** to-do: @satisifes {never} */
          const _ = message;
          break;
      }
    };
  
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
        postWebViewMessage({ type: 'setViewing', data: { closeWebView: true } });
      }
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
  