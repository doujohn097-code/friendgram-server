import { auth } from '@/lib/firebaseAdmin';
import { listPosts, addPost } from '@/lib/r2Store';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const type = searchParams.get('type') || null;
    const posts = await listPosts(type, limit);
    return Response.json({ posts });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await auth.verifyIdToken(token);
    const data = await request.json();
    const { images, video, caption, type } = data;
    const mediaType = type || 'post';

    if (!images && !video) return Response.json({ error: 'Missing media' }, { status: 400 });

    const { getUser } = await import('@/lib/r2Store');
    const profile = (await getUser(decoded.uid)) || {};
    const username = profile.username || decoded.email?.split('@')[0] || '';
    const avatar = profile.avatar || decoded.picture || '';
    const fullName = profile.fullName || decoded.name || '';

    const post = {
      id: crypto.randomUUID(),
      uid: decoded.uid,
      username,
      fullName,
      avatar,
      verified: false,
      caption: caption || '',
      type: mediaType,
      images: images || [],
      video: video || '',
      likes: 0,
      likedBy: [],
      comments: 0,
      shares: 0,
      saves: 0,
      createdAt: new Date().toISOString(),
    };

    await addPost(post);
    return Response.json(post);
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
