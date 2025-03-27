/** Message from Devvit to the web view. */
export type DevvitMessage =
  | { type: 'initialData'; data: { word: string; quarter: string, imageUrl: string } }
  | { type: 'updateCounter'; data: { currentCounter: number } }
  | { type: 'updateImageUrl'; data: {currentImageUrl: string} };

/** Message from the web view to Devvit. */
export type WebViewMessage =
  | { type: 'webViewReady' }
  | { type: 'setCounter'; data: { newCounter: number } }
  | { type: 'setImageUrl'; data: { newImageUrl: string, closeWebView: boolean } };

/**
 * Web view MessageEvent listener data type. The Devvit API wraps all messages
 * from Blocks to the web view.
 */
export type DevvitSystemMessage = {
  data: { message: DevvitMessage };
  /** Reserved type for messages sent via `context.ui.webView.postMessage`. */
  type?: 'devvit-message' | string;
};




export type DevvitGuessMessage =
  | { type: 'initialData'; data: { image1: string; image2: string, image3: string, image4: string } }

export type WebViewGuessMessage =
  | { type: 'webViewReady' }
  | { type: 'setViewing'; data: { closeWebView: boolean } };