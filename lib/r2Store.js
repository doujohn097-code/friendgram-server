import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from './r2';

function buf(data) {
  if (typeof data === 'string') return Buffer.from(data, 'utf8');
  return Buffer.from(JSON.stringify(data), 'utf8');
}

export async function getJSON(key, fallback = null) {
  try {
    const obj = await r2.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
    const body = await obj.Body.transformToString();
    return JSON.parse(body);
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.Code === 'NoSuchKey' || err.code === 'NoSuchKey') {
      return fallback;
    }
    throw err;
  }
}

export async function putJSON(key, data) {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buf(data),
    ContentType: 'application/json',
  }));
  return true;
}

const USERS_KEY = 'data/users.json';
const POSTS_KEY = 'data/posts.json';

export async function getUser(uid) {
  const users = await getJSON(USERS_KEY, {});
  return users[uid] || null;
}

export async function getUserByUsername(username) {
  const users = await getJSON(USERS_KEY, {});
  return Object.values(users).find((u) => u.username === username) || null;
}

export async function setUser(uid, data) {
  const users = await getJSON(USERS_KEY, {});
  users[uid] = { ...users[uid], ...data, uid };
  await putJSON(USERS_KEY, users);
  return users[uid];
}

export async function listPosts(type = null, limit = 50) {
  const posts = await getJSON(POSTS_KEY, []);
  let list = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (type) list = list.filter((p) => p.type === type);
  return list.slice(0, limit);
}

export async function addPost(post) {
  const posts = await getJSON(POSTS_KEY, []);
  posts.push(post);
  await putJSON(POSTS_KEY, posts);
  return post;
}

export async function updatePost(id, updater) {
  const posts = await getJSON(POSTS_KEY, []);
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated = typeof updater === 'function' ? updater(posts[idx]) : { ...posts[idx], ...updater };
  posts[idx] = updated;
  await putJSON(POSTS_KEY, posts);
  return updated;
}
