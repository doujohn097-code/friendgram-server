import admin from 'firebase-admin';

if (!admin.apps.length) {
  const b64 = process.env.FIREBASE_ADMIN_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const options = { projectId };

  if (b64) {
    try {
      const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
      options.credential = admin.credential.cert(serviceAccount);
    } catch (err) {
      console.warn('FIREBASE_ADMIN_KEY decode failed, continuing without it:', err.message);
    }
  }

  if (process.env.FIREBASE_STORAGE_BUCKET) {
    options.storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  }

  admin.initializeApp(options);
}

export const auth = admin.auth();
export const db = admin.firestore();
export default admin;
