import { auth } from '@/lib/firebaseAdmin';
import { getJSON, putJSON } from '@/lib/r2Store';

export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await auth.verifyIdToken(token);
    const { id } = params;

    const posts = await getJSON('data/posts.json', []);
    const post = posts.find((p) => p.id === id);
    if (!post) return Response.json({ error: 'Post not found' }, { status: 404 });
    if (post.uid !== decoded.uid) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const updated = posts.filter((p) => p.id !== id);
    await putJSON('data/posts.json', updated);
    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
