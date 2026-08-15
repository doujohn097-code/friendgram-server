import { auth } from '@/lib/firebaseAdmin';
import { getUser } from '@/lib/r2Store';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await auth.verifyIdToken(token);
    const profile = (await getUser(decoded.uid)) || {};

    return Response.json({
      uid: decoded.uid,
      email: decoded.email || profile.email,
      username: profile.username || decoded.email?.split('@')[0] || '',
      fullName: profile.fullName || decoded.name || '',
      avatar: profile.avatar || decoded.picture || '',
      bio: profile.bio || '',
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 401 });
  }
}
