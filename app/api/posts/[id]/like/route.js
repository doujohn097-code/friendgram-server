import { auth } from '@/lib/firebaseAdmin';
import { updatePost } from '@/lib/r2Store';

export async function POST(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await auth.verifyIdToken(token);
    const { liked } = await request.json();
    const { id } = params;

    const updated = await updatePost(id, (post) => {
      const likedBy = new Set(post.likedBy || []);
      const already = likedBy.has(decoded.uid);
      if (liked && !already) likedBy.add(decoded.uid);
      if (!liked && already) likedBy.delete(decoded.uid);
      return { ...post, likes: likedBy.size, likedBy: Array.from(likedBy) };
    });

    if (!updated) return Response.json({ error: 'Post not found' }, { status: 404 });
    return Response.json({ likes: updated.likes, liked });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
