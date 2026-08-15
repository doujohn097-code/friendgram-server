import { putJSON } from './lib/r2Store.js';
await putJSON('data/posts.json', []);
console.log('posts cleared');
