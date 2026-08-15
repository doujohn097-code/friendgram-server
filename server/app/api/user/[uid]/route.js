import { auth } from '@/lib/firebaseAdmin';
import { getUser, setUser, getUserByUsername } from '@/lib/r2Store';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await auth.verifyIdToken(token);
    const { uid } = params;
    if (decoded.uid !== uid) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const { bio, avatar, fullName, username } = data;

    if (username) {
      const existing = await getUserByUsername(username);
      if (existing && existing.uid !== uid) {
        return Response.json({ error: 'Username taken' }, { status: 409 });
      }
    }

    await setUser(uid, { bio, avatar, fullName, username });
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const { uid } = params;
    const user = (await getUser(uid)) || { uid };
    return Response.json(user);
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
