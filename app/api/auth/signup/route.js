import { auth } from '@/lib/firebaseAdmin';
import { setUser, getUserByUsername } from '@/lib/r2Store';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await auth.verifyIdToken(token);
    const { fullName, username, email } = await request.json();

    if (!fullName || !username || !email) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const existing = await getUserByUsername(username);
    if (existing && existing.uid !== decoded.uid) {
      return Response.json({ error: 'Username taken' }, { status: 409 });
    }

    await setUser(decoded.uid, {
      uid: decoded.uid,
      fullName,
      username,
      email,
      avatar: '',
      bio: '',
      createdAt: new Date().toISOString(),
    });

    return Response.json({ ok: true, uid: decoded.uid });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
