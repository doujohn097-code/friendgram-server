import admin from 'firebase-admin';

if (!admin.apps.length) {
  const b64 = process.env.FIREBASE_ADMIN_KEY;
  if (!b64) {
    throw new Error('FIREBASE_ADMIN_KEY is not set');
  }
  const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const auth = admin.auth();
export const db = admin.firestore();
export default admin;
