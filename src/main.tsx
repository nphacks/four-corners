import './createPost.js';

import '../jobs/solvedComment.ts'

import { Devvit, useState, useWebView } from '@devvit/public-api';
import { Router } from '../posts/Router.tsx';
import type { DevvitMessage, WebViewMessage } from './message.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true
});

Devvit.addCustomPostType({
  name: '4 Corners',
  description: 'This the main page to draw',
  height: 'tall',
  render: Router,
});

export default Devvit;
